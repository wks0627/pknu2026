/* =========================================================
   online.js — 파이어베이스 연결층

   ES 모듈을 쓰지 않습니다. 모듈 방식은 파일을 직접 열었을 때(file://)
   브라우저가 막아 버리기 때문에, 어디서 열든 똑같이 붙도록
   compat SDK 를 필요할 때만 내려받아 씁니다.

   저장 구조 (Realtime Database)
     /photos/hall/{no}      { data, by, at }     사진 1장 (base64)
     /photos/memorial/{no}  { data, by, at }
     /qna/{pushId}          { name, body, at, answer, answeredAt }
   ========================================================= */
(function () {
  'use strict';

  var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
  var cfg = window.FIREBASE_CONFIG || {};
  /* 판정이 끝났음을 알립니다.
     main.js 보다 먼저 끝날 수도 있어서, 신호(이벤트)와 표시(플래그)를 함께 둡니다. */
  var done = function () {
    window.ONLINE_SETTLED = true;
    document.dispatchEvent(new CustomEvent('online-ready'));
  };

  /* 연결 정보가 없으면 바로 알립니다 (main.js 가 연습모드로 대신합니다) */
  if (!cfg.apiKey || !cfg.databaseURL) { done(); return; }

  /* 스크립트를 하나씩 순서대로 읽어 들입니다 */
  var loadScript = function (src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('내려받기 실패: ' + src)); };
      document.head.appendChild(s);
    });
  };

  loadScript(SDK + 'firebase-app-compat.js')
    .then(function () { return loadScript(SDK + 'firebase-auth-compat.js'); })
    .then(function () { return loadScript(SDK + 'firebase-database-compat.js'); })
    .then(function () { build(); })
    .catch(function (e) {
      console.warn('[online] 파이어베이스를 불러오지 못했습니다:', e.message);
      done();                       // 연습모드로 넘어갑니다
    });

  function build() {
    var app  = firebase.initializeApp(cfg);
    var auth = firebase.auth();
    var db   = firebase.database();

    var subs = {};
    var emit = function (name, v) {
      (subs[name] || []).forEach(function (f) {
        try { f(v); } catch (err) { console.error(err); }
      });
    };

    var state = { user: null, photos: { hall: {}, memorial: {} }, qna: [] };

    auth.onAuthStateChanged(function (user) {
      state.user = user;
      emit('auth', user);
      if (user) migrateLocal();        // 담당자로 들어오면 연습모드 자료를 올려 줍니다
    });

    ['hall', 'memorial'].forEach(function (kind) {
      db.ref('photos/' + kind).on('value', function (snap) {
        state.photos[kind] = snap.val() || {};
        emit('photos', state.photos);
      });
    });

    db.ref('qna').on('value', function (snap) {
      var raw = snap.val() || {};
      state.qna = Object.keys(raw)
        .map(function (id) {
          var o = raw[id]; o.id = id; return o;
        })
        .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
      emit('qna', state.qna);
    });

    var stamp = firebase.database.ServerValue.TIMESTAMP;

    var API = {
      enabled: true,
      mode: 'server',

      on: function (name, fn) {
        (subs[name] = subs[name] || []).push(fn);
        if (name === 'photos') fn(state.photos);
        if (name === 'qna' && state.qna.length) fn(state.qna);
        if (name === 'auth') fn(state.user);
      },

      isAdmin: function () { return !!state.user; },
      adminEmail: function () { return state.user ? state.user.email : null; },

      login: function (email, pw) { return auth.signInWithEmailAndPassword(email, pw); },
      logout: function () { return auth.signOut(); },

      photos: function () { return state.photos; },
      qna: function () { return state.qna; },

      savePhoto: function (kind, no, dataUrl) {
        return db.ref('photos/' + kind + '/' + no).set({
          data: dataUrl,
          by: state.user ? state.user.uid : null,
          at: stamp
        });
      },
      deletePhoto: function (kind, no) {
        return db.ref('photos/' + kind + '/' + no).remove();
      },

      ask: function (name, body) {
        return db.ref('qna').push({
          name: String(name || '').slice(0, 20),
          body: String(body || '').slice(0, 1000),
          at: stamp,
          answer: null
        });
      },
      answer: function (id, text) {
        return db.ref('qna/' + id).update({
          answer: String(text || '').slice(0, 2000),
          answeredAt: stamp
        });
      },
      removeQna: function (id) { return db.ref('qna/' + id).remove(); }
    };

    /* ── 연습모드에 쌓인 자료를 서버로 옮깁니다 ──────────
       한 번 옮기면 브라우저 쪽 자료는 지웁니다.
       사진은 담당자 권한이 있어야 하므로 로그인 시점에 실행합니다. */
    function migrateLocal() {
      var jobs = [];
      var moved = { photos: 0, qna: 0 };

      var photos = read('local-photos');
      if (photos) {
        ['hall', 'memorial'].forEach(function (kind) {
          Object.keys(photos[kind] || {}).forEach(function (no) {
            var p = photos[kind][no];
            if (p && p.data) { jobs.push(API.savePhoto(kind, no, p.data)); moved.photos++; }
          });
        });
      }

      var qna = read('local-qna');
      if (qna && qna.length) {
        qna.forEach(function (q) {
          jobs.push(db.ref('qna').push({
            name: q.name || '익명',
            body: q.body || '',
            at: q.at || Date.now(),
            answer: q.answer || null,
            answeredAt: q.answeredAt || null
          }));
          moved.qna++;
        });
      }

      if (!jobs.length) return;

      Promise.all(jobs).then(function () {
        try {
          localStorage.removeItem('local-photos');
          localStorage.removeItem('local-qna');
        } catch (e) { /* 무시 */ }
        console.info('[online] 연습모드 자료를 옮겼습니다 — 사진 ' +
                     moved.photos + '장, 글 ' + moved.qna + '건');
        document.dispatchEvent(new CustomEvent('online-migrated', { detail: moved }));
      }).catch(function (e) {
        console.warn('[online] 옮기지 못했습니다:', e.message);
      });
    }

    function read(key) {
      try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    }

    window.ONLINE = API;
    done();
  }
})();

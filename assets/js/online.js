/* =========================================================
   online.js — 파이어베이스 연결층

   이 파일만 바깥(파이어베이스)과 이야기합니다.
   화면을 그리는 일은 main.js 가 맡고, 둘은 window.ONLINE 으로만
   주고받습니다. 연결 정보가 비어 있으면 조용히 꺼진 채로 둡니다.

   저장 구조 (Realtime Database)
     /photos/hall/{no}      { data, by, at }     사진 1장 (base64)
     /photos/memorial/{no}  { data, by, at }
     /qna/{pushId}          { name, body, at, answer, answeredAt }
   ========================================================= */
import { initializeApp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getDatabase, ref, onValue, set, remove, push, update, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

var cfg = window.FIREBASE_CONFIG || {};
var ready = !!(cfg.apiKey && cfg.databaseURL);

/* 연결 정보가 없으면 '꺼진 상태'로 선언하고 끝냅니다.
   화면 쪽은 ONLINE.enabled 로 판단해 안내 문구만 바꿉니다. */
if (!ready) {
  window.ONLINE = {
    enabled: false,
    reason: "파이어베이스 연결 정보가 비어 있습니다. data/firebase-config.js 를 채워 주세요.",
    isAdmin: function () { return false; },
    on: function () {}
  };
  document.dispatchEvent(new CustomEvent('online-ready'));
} else {
  const app  = initializeApp(cfg);
  const auth = getAuth(app);
  const db   = getDatabase(app);

  /* 아주 작은 구독 장치 — 값이 바뀌면 등록된 함수들을 부릅니다 */
  const listeners = {};
  const emit = function (name, payload) {
    (listeners[name] || []).forEach(function (fn) {
      try { fn(payload); } catch (e) { console.error(e); }
    });
  };

  const state = { user: null, photos: { hall: {}, memorial: {} }, qna: [] };

  /* ── 로그인 상태 ──────────────────────────── */
  onAuthStateChanged(auth, function (user) {
    state.user = user;
    emit('auth', user);
  });

  /* ── 사진 ─────────────────────────────────── */
  ['hall', 'memorial'].forEach(function (kind) {
    onValue(ref(db, 'photos/' + kind), function (snap) {
      state.photos[kind] = snap.val() || {};
      emit('photos', state.photos);
    });
  });

  /* ── 상담 글 ──────────────────────────────── */
  onValue(ref(db, 'qna'), function (snap) {
    const raw = snap.val() || {};
    state.qna = Object.keys(raw)
      .map(function (id) { return Object.assign({ id: id }, raw[id]); })
      .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    emit('qna', state.qna);
  });

  window.ONLINE = {
    enabled: true,

    on: function (name, fn) {
      (listeners[name] = listeners[name] || []).push(fn);
      // 이미 들어와 있는 값이 있으면 바로 한 번 전달합니다
      if (name === 'photos') fn(state.photos);
      if (name === 'qna' && state.qna.length) fn(state.qna);
      if (name === 'auth') fn(state.user);
    },

    isAdmin: function () { return !!state.user; },
    adminEmail: function () { return state.user ? state.user.email : null; },

    login: function (email, pw) { return signInWithEmailAndPassword(auth, email, pw); },
    logout: function () { return signOut(auth); },

    photos: function () { return state.photos; },
    qna: function () { return state.qna; },

    /* 사진 올리기 / 지우기 — 담당자만 (규칙에서도 막습니다) */
    savePhoto: function (kind, no, dataUrl) {
      return set(ref(db, 'photos/' + kind + '/' + no), {
        data: dataUrl,
        by: state.user ? state.user.uid : null,
        at: serverTimestamp()
      });
    },
    deletePhoto: function (kind, no) {
      return remove(ref(db, 'photos/' + kind + '/' + no));
    },

    /* 질문 남기기 — 누구나 */
    ask: function (name, body) {
      return push(ref(db, 'qna'), {
        name: String(name || '').slice(0, 20),
        body: String(body || '').slice(0, 1000),
        at: serverTimestamp(),
        answer: null
      });
    },

    /* 답변 달기 / 글 지우기 — 담당자만 */
    answer: function (id, text) {
      return update(ref(db, 'qna/' + id), {
        answer: String(text || '').slice(0, 2000),
        answeredAt: serverTimestamp()
      });
    },
    removeQna: function (id) { return remove(ref(db, 'qna/' + id)); }
  };

  document.dispatchEvent(new CustomEvent('online-ready'));
}

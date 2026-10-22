window.HONOR = window.HONOR || {};
/* =========================================================
   firebase-config.js — 파이어베이스 연결 정보

   ⚠ 이 값을 채우기 전까지 온라인 기능(사진 업로드 · 상담창구)은
     꺼진 상태로 동작합니다. 나머지 화면은 그대로 작동합니다.

   채우는 법
     1) console.firebase.google.com 에서 프로젝트 생성
     2) 톱니바퀴 → 프로젝트 설정 → 내 앱 → 웹 앱(</>) 추가
     3) 화면에 나오는 firebaseConfig 값을 아래에 그대로 옮겨 적기
     4) 왼쪽 메뉴 Realtime Database → 데이터베이스 만들기
        (위치는 asia-southeast1 권장, 규칙은 '잠금 모드'로 시작)
     5) databaseURL 을 아래에 넣기

   ※ 이 값들은 웹에 공개되어도 되는 값입니다.
     실제 보안은 Realtime Database 규칙(database.rules.json)이 담당합니다.
   ========================================================= */
window.FIREBASE_CONFIG = {
  apiKey:            "",
  authDomain:        "",
  databaseURL:       "",
  projectId:         "",
  storageBucket:     "",
  messagingSenderId: "",
  appId:             ""
};

/* 담당자 계정 이메일.
   파이어베이스 Authentication → 이메일/비밀번호 로 이 계정을 하나 만들고,
   database.rules.json 의 ADMIN_UID 에 그 계정의 UID 를 넣습니다. */
window.ADMIN_EMAIL = "wks0627@chest.or.kr";

/* ── 사진 저장 한도 ────────────────────────────────────
   Realtime Database 무료 용량은 1GB 입니다.
   사진은 base64 문자열로 저장되어 원본보다 약 33% 커지므로
   아래 기준으로 강하게 줄여서 저장합니다.

   maxPx    : 가로·세로 중 긴 변의 최대 픽셀
   maxBytes : 압축 후 목표 용량 (이 아래로 떨어질 때까지 반복)
   minQuality / minPx : 더 줄일 수 없는 하한선

   기본값 기준 한 장 약 20~25KB → 300장(전당150 + 추모150) 약 8MB.
   1GB 의 1% 도 쓰지 않습니다.
   ──────────────────────────────────────────────────── */
window.PHOTO_LIMIT = {
  maxPx:      360,     // 명패 사진은 화면에서 132px 정도로 표시됩니다
  maxBytes:   26000,   // 약 25KB
  minQuality: 0.40,
  minPx:      180,
  startQuality: 0.72
};

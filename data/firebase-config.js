window.HONOR = window.HONOR || {};
/* =========================================================
   firebase-config.js — 파이어베이스 연결 정보

   프로젝트 : pknu2026-aebb7
   연동 완료 : 2026-10-22

   ※ 이 값들은 웹에 공개되어도 되는 값입니다.
     실제 보안은 Realtime Database 규칙(database.rules.json)이 담당합니다.
   ========================================================= */
window.FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDcgT061ujx5JSNJTdy_YKTv6YkklBjWNY",
  authDomain:        "pknu2026-aebb7.firebaseapp.com",
  databaseURL:       "https://pknu2026-aebb7-default-rtdb.firebaseio.com",
  projectId:         "pknu2026-aebb7",
  storageBucket:     "pknu2026-aebb7.firebasestorage.app",
  messagingSenderId: "547501370502",
  appId:             "1:547501370502:web:167449d0c21fec0c74b507"
};

/* 담당자 계정 이메일 (Authentication 에 등록된 계정) */
window.ADMIN_EMAIL = "wks0627@chest.or.kr";

/* ── 사진 저장 한도 ────────────────────────────────────
   Realtime Database 무료 용량은 1GB 입니다.
   사진은 base64 문자열로 저장되어 원본보다 약 33% 커지므로
   아래 기준으로 강하게 줄여서 저장합니다.

   기본값 기준 한 장 약 20~25KB → 300장 약 7MB.
   ──────────────────────────────────────────────────── */
window.PHOTO_LIMIT = {
  maxPx:      360,
  maxBytes:   26000,
  minQuality: 0.40,
  minPx:      180,
  startQuality: 0.72
};

window.HONOR = window.HONOR || {};
/* =========================================================
   covers.js — 메뉴별 대표 이미지

   사진은 회사 자산이며 편집 없이 원본 그대로 씁니다.
   (잘리지 않도록 contain 으로 두고 여백만 채웁니다)

   메뉴 키 : status | hall | memorial | desk | news | me
   바꾸려면 file 경로만 교체하세요. assets/img/menu/ 에 넣습니다.
   ========================================================= */
HONOR.covers = {
  status: {
    file: "assets/img/menu/status.webp",
    alt: "사랑의열매 아카이브 — 1998년, 척박한 땅에 심은 씨앗 하나",
    caption: "1998년 11월 13일, 사회복지공동모금법에 의해 새롭게 출범한 사회복지공동모금회"
  },
  news: {
    file: "assets/img/menu/news.jpg",
    alt: "사랑의열매 아카이브 북 Vol.1 — 마음과 마음, 시간과 시간이 만나는 곳",
    caption: "아카이브 북 Vol.1 · 마음과 마음, 시간과 시간이 만나는 곳"
  },
  desk: {
    file: "assets/img/menu/desk.jpg",
    alt: "나눔의 장면들을 담은 그림 — 손 위에 놓인 열매와 사람들",
    caption: "한 사람의 결심이 닿는 자리들"
  },
  hall: {
    file: "assets/img/hall-poster.jpg",
    alt: "울산박물관에 설치된 울산 아너 소사이어티 아너 명예의전당",
    caption: "울산박물관 1층 · 아너 명예의전당"
  }

  /* 아직 지정하지 않은 메뉴
     hall     — 울산박물관 명예의전당 사진을 따로 쓰고 있습니다
     memorial — 흰 국화를 코드로 그려 씁니다
     me       — assets/img/profile.jpg 를 넣으면 됩니다

     파일을 더 받으면 아래처럼 추가하세요.
     hall: { file: "assets/img/menu/hall.jpg", alt: "...", caption: "..." }
  */
};

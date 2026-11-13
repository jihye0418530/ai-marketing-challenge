/* =========================================================
   데이터 파일 — 점포·팀·성과 수치를 바꾸려면 이 파일만 수정하세요.
   상권 수치(AREAS)는 참가신청서(PPT)의 실제 분석값,
   점포·팀 이름과 성과(RESULTS)는 시연용 가상 예시입니다.
   ========================================================= */

const AREAS = {
  TS: {
    name: "송도 타임스페이스",
    type: "방문·목적형",
    headline: "소비가 특정 요일·시간대에 편중된다",
    stats: [
      { v: "0.54 · 0.44", l: "월요일·오전(9~12시) 전환지수" },
      { v: "60.9%", l: "학기 중 단골의 방학 이탈" },
      { v: "85.3%", l: "SNS로 접한 점포 5개 미만" }
    ],
    facts: [
      "업소당 매출은 연수구 평균의 1.1~3.4배(백만 원 제외)",
      "7개 업종 점포 수 1년간 187→175곳(-6.4%, 연수구 +1.5%)",
      "전환지수 1.0을 넘는 건 목~일요일, 낮 12시~밤 11시뿐",
      "월요일 전환지수 0.54, 오전 9~12시 0.44 — 사람은 와도 소비가 적음",
      "재학생 방문 목적의 95.1%가 식사·주류",
      "학기 중 단골의 60.9%가 방학에 이탈, 방학 중 '거의 안 감' 69.1%",
      "SNS로 접한 점포가 5개 미만인 학생 85.3%",
      "상권 주변 버스정류장 7개 — 접근성은 좋지만 상권 간 이동은 불편",
      "점주 인터뷰: 규제로 거리 홍보가 막혀 개별 점포 홍보에 한계"
    ],
    weakSlot: "월요일·평일 오전",
    strongSlot: "목~일 점심·저녁"
  },
  CP: {
    name: "송도 센트럴파크",
    type: "가족형·주말형",
    headline: "사람은 늘었는데 카페·주말에만 소비한다",
    stats: [
      { v: "74.6%", l: "카페 매출 비중 (6개 업종 64.2억 중)" },
      { v: "-29.2%", l: "카페 제외 매출 (전년 대비)" },
      { v: "+0.05", l: "유동인구↔매출 월별 상관" }
    ],
    facts: [
      "6개 업종 월평균 매출 64.2억 원 중 카페가 74.6%",
      "카페를 제외한 매출은 전년 대비 -29.2%",
      "일평균 유동인구 +14.0%지만 매출과의 월별 상관은 +0.05",
      "전환지수는 토·일요일이 가장 높고 평일은 대부분 1.0 아래",
      "카페 매출의 45.2%가 주말에 발생",
      "재학생 72.4%가 학기 중 주 1회 미만 방문, 방학 중 '거의 안 감' 78.9%",
      "SNS에서 본 점포가 1개 미만인 학생 51.2%",
      "상권 주변 버스정류장 8개"
    ],
    weakSlot: "평일",
    strongSlot: "토·일요일"
  }
};

const SURVEY = { n: 123, period: "2026.10.13~15", join: 77.2, joinN: 95 };

/* 참가 점포 20곳 (가상 예시). en/zh/ja는 다국어 문구용 메뉴 이름 */
const STORES = [
  { id: 1,  area: "TS", cat: "한식",      name: "화로담",          menu: "숯불 돼지갈비", en: "charcoal-grilled pork ribs", zh: "炭火猪排骨", ja: "炭火焼き豚カルビ", concern: "주말 저녁은 꽉 차는데 월·화요일 저녁이 비어요", team: "주말작전" },
  { id: 2,  area: "TS", cat: "한식",      name: "송도국밥연구소",  menu: "수육국밥",      en: "pork & rice soup", zh: "白切肉汤饭", ja: "スユク・クッパ", concern: "점심 직장인은 오는데 학생 손님이 거의 없어요", team: "런치타임" },
  { id: 3,  area: "TS", cat: "주점",      name: "달빛포차",        menu: "모둠전·막걸리", en: "Korean pancakes & makgeolli", zh: "韩式煎饼配米酒", ja: "チヂミとマッコリ", concern: "방학만 되면 매출이 절반으로 떨어져요", team: "방학구조대" },
  { id: 4,  area: "TS", cat: "주점",      name: "이자카야 우미",   menu: "꼬치·하이볼",   en: "yakitori & highballs", zh: "日式烤串和嗨棒", ja: "焼き鳥とハイボール", concern: "거리 홍보물을 못 붙여서 새 손님이 안 늘어요", team: "해시태그" },
  { id: 5,  area: "TS", cat: "일식",      name: "스시하루",        menu: "런치 오마카세", en: "lunch omakase", zh: "午间主厨精选寿司", ja: "ランチおまかせ", concern: "가격대가 있어서 학생들이 부담스러워해요", team: "데이터맛집" },
  { id: 6,  area: "TS", cat: "일식",      name: "라멘 토리",       menu: "토리파이탄 라멘", en: "creamy chicken ramen", zh: "浓厚鸡白汤拉面", ja: "鶏白湯ラーメン", concern: "유학생 손님이 많은데 메뉴판이 한국어뿐이에요", team: "골목번역단" },
  { id: 7,  area: "TS", cat: "양식",      name: "그릴앤탭",        menu: "수제버거·생맥주", en: "handmade burgers & draft beer", zh: "手工汉堡配生啤", ja: "クラフトバーガーと生ビール", concern: "오후 3~5시가 텅 비어요", team: "오전부활" },
  { id: 8,  area: "TS", cat: "양식",      name: "파스타 공방",     menu: "생면 파스타",   en: "fresh handmade pasta", zh: "手工鲜意面", ja: "生パスタ", concern: "인스타 계정은 있는데 올릴 게 없어요", team: "릴스메이커" },
  { id: 9,  area: "TS", cat: "한식",      name: "밥심식당",        menu: "제육 정식",     en: "spicy pork set meal", zh: "辣炒猪肉套餐", ja: "豚プルコギ定食", concern: "객단가가 낮아서 박리다매로는 버티기 힘들어요", team: "단골제조기" },
  { id: 10, area: "TS", cat: "주점",      name: "맥주창고",        menu: "수제맥주·감자튀김", en: "craft beer & fries", zh: "精酿啤酒配薯条", ja: "クラフトビールとポテト", concern: "월요일은 문을 열어도 손님이 없어요", team: "맛지도" },
  { id: 11, area: "TS", cat: "카페·디저트", name: "디저트랩 송도",  menu: "크로플·빙수",   en: "croffles & bingsu", zh: "可颂华夫和刨冰", ja: "クロッフルとかき氷", concern: "식사 후 2차로 오는 손님을 잡고 싶어요", team: "카피클럽" },
  { id: 12, area: "CP", cat: "카페·디저트", name: "파크사이드 브루", menu: "핸드드립·아인슈페너", en: "hand-drip coffee & Einspänner", zh: "手冲咖啡和维也纳咖啡", ja: "ハンドドリップとアインシュペナー", concern: "주말만 붐비고 평일 오후는 한산해요", team: "파크러너" },
  { id: 13, area: "CP", cat: "양식",      name: "피크닉 샌드위치", menu: "피크닉 박스",   en: "picnic box", zh: "野餐盒", ja: "ピクニックボックス", concern: "공원 손님은 많은데 우리 가게를 몰라요", team: "피크닉크루" },
  { id: 14, area: "CP", cat: "베이커리",  name: "호수빵집",        menu: "소금빵",        en: "salt bread", zh: "盐面包", ja: "塩パン", concern: "오전에 구운 빵이 저녁까지 남아요", team: "그린라이트" },
  { id: 15, area: "CP", cat: "브런치",    name: "그린볼 샐러드",   menu: "샐러드볼·브런치", en: "salad bowls & brunch", zh: "沙拉碗和早午餐", ja: "サラダボウルとブランチ", concern: "카페에 손님을 다 뺏기는 느낌이에요", team: "로컬픽" },
  { id: 16, area: "CP", cat: "카페·디저트", name: "센트럴 젤라또",  menu: "수제 젤라또",   en: "handmade gelato", zh: "手工意式冰淇淋", ja: "手作りジェラート", concern: "겨울·평일 매출이 너무 떨어져요", team: "하이라이트" },
  { id: 17, area: "CP", cat: "한식",      name: "공원앞 김밥",     menu: "참치김밥·라볶이", en: "tuna gimbap & rabokki", zh: "金枪鱼紫菜包饭和拉面炒年糕", ja: "ツナキンパとラポッキ", concern: "포장 손님은 있는데 재방문이 적어요", team: "숏폼공장" },
  { id: 18, area: "CP", cat: "베이커리",  name: "크루아상 하우스", menu: "크루아상",      en: "butter croissants", zh: "黄油可颂", ja: "バタークロワッサン", concern: "외국인 가족 손님에게 어떻게 알려야 할지 몰라요", team: "송도라이터" },
  { id: 19, area: "CP", cat: "카페·디저트", name: "티하우스 연",    menu: "수제 밀크티",   en: "homemade milk tea", zh: "手工奶茶", ja: "手作りミルクティー", concern: "큰 카페 사이에서 존재감이 없어요", team: "별점사냥" },
  { id: 20, area: "CP", cat: "한식",      name: "오후의 떡볶이",   menu: "로제 떡볶이",   en: "rosé tteokbokki", zh: "奶油辣炒年糕", ja: "ロゼトッポッキ", concern: "학생 손님이 오려면 뭘 해야 할지 모르겠어요", team: "쿠폰연구소" }
];

/* 8주차 중간 성과 (가상). 항목별 점수는 평가 배점 대비 */
const RESULTS = {
  week: 8, total: 12,
  weeklyCoupons: [48, 103, 162, 219, 251, 307, 352, 391],
  scores: {
    "주말작전":   { sales: 21.4, visit: 16.2, content: 15.8, owner: 13.5, sustain: 11.0, growth: 18.2 },
    "숏폼공장":   { sales: 22.8, visit: 15.1, content: 17.9, owner: 12.0, sustain: 10.5, growth: 21.4 },
    "골목번역단": { sales: 19.5, visit: 16.8, content: 17.2, owner: 13.8, sustain: 12.1, growth: 15.3 },
    "방학구조대": { sales: 20.2, visit: 14.4, content: 14.1, owner: 12.9, sustain: 12.8, growth: 16.9 },
    "피크닉크루": { sales: 18.7, visit: 17.5, content: 16.0, owner: 12.2, sustain: 10.2, growth: 14.1 },
    "런치타임":   { sales: 17.9, visit: 13.8, content: 15.2, owner: 13.0, sustain: 11.6, growth: 12.8 },
    "릴스메이커": { sales: 15.6, visit: 14.9, content: 18.6, owner: 11.4, sustain: 10.8, growth: 10.2 },
    "파크러너":   { sales: 18.1, visit: 13.2, content: 13.9, owner: 12.6, sustain: 11.9, growth: 13.5 },
    "데이터맛집": { sales: 16.4, visit: 12.7, content: 14.8, owner: 13.4, sustain: 12.4, growth: 11.1 },
    "해시태그":   { sales: 16.9, visit: 14.1, content: 15.5, owner: 11.0, sustain: 10.9, growth: 11.8 },
    "그린라이트": { sales: 17.2, visit: 12.4, content: 13.2, owner: 12.8, sustain: 11.8, growth: 12.3 },
    "로컬픽":     { sales: 15.1, visit: 13.6, content: 14.4, owner: 12.1, sustain: 11.3, growth: 9.6 },
    "하이라이트": { sales: 14.8, visit: 12.9, content: 15.9, owner: 11.7, sustain: 10.1, growth: 9.2 },
    "단골제조기": { sales: 16.0, visit: 12.1, content: 12.8, owner: 12.4, sustain: 12.0, growth: 10.7 },
    "카피클럽":   { sales: 14.2, visit: 13.3, content: 15.0, owner: 11.2, sustain: 10.6, growth: 8.4 },
    "오전부활":   { sales: 15.3, visit: 11.8, content: 13.1, owner: 11.9, sustain: 11.2, growth: 9.9 },
    "송도라이터": { sales: 13.6, visit: 12.6, content: 14.6, owner: 11.5, sustain: 10.4, growth: 7.6 },
    "별점사냥":   { sales: 13.9, visit: 12.2, content: 13.7, owner: 10.8, sustain: 10.0, growth: 7.9 },
    "맛지도":     { sales: 12.8, visit: 11.5, content: 12.9, owner: 11.1, sustain: 9.8,  growth: 6.5 },
    "쿠폰연구소": { sales: 12.5, visit: 11.9, content: 12.2, owner: 10.6, sustain: 9.5,  growth: 6.1 }
  }
};

const CRITERIA = [
  { key: "sales",   label: "점포 성과",  max: 30 },
  { key: "visit",   label: "고객 유입",  max: 20 },
  { key: "content", label: "콘텐츠",     max: 20 },
  { key: "owner",   label: "점주 만족",  max: 15 },
  { key: "sustain", label: "지속가능성", max: 15 }
];

/* 매칭 시연용 5팀 × 5점포 */
const MATCH_TEAMS = ["주말작전", "숏폼공장", "골목번역단", "방학구조대", "피크닉크루"];
const MATCH_STORES = ["화로담", "라멘 토리", "달빛포차", "호수빵집", "피크닉 샌드위치"];

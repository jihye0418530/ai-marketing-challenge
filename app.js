/* =========================================================
   산학상생 AI 마케팅 챌린지 — 화면 동작
   ========================================================= */

/* ---- 설정 ----
   AI_ENDPOINT를 비워두면 상권 데이터로 가이드 시트를 자동 생성합니다.
   Cloudflare Worker 등에 worker.js를 배포한 뒤 그 주소를 넣으면
   실제 Claude가 가이드 시트를 작성합니다. (README.md 참고)
   API 키는 절대 이 파일에 넣지 마세요. 누구나 볼 수 있습니다. */
const CONFIG = {
  AI_ENDPOINT: ""   // 예: "https://ai-guide.내계정.workers.dev"
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const storeByName = (n) => STORES.find((s) => s.name === n);
const storeByTeam = (t) => STORES.find((s) => s.team === t);

/* ================= 내비게이션 ================= */
(function nav() {
  const navEl = $("#nav");
  $("#navToggle").addEventListener("click", () => navEl.classList.toggle("open"));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => navEl.classList.remove("open")));

  const links = $$("#nav a");
  const ids = links.map((a) => a.getAttribute("href").slice(1));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
})();

/* ================= 툴팁 ================= */
const tip = $("#tooltip");
function showTip(html, x, y) {
  tip.innerHTML = html;
  tip.classList.add("show");
  const w = tip.offsetWidth;
  tip.style.left = Math.min(window.innerWidth - w - 10, Math.max(10, x - w / 2)) + "px";
  tip.style.top = (y - tip.offsetHeight - 12) + "px";
}
function hideTip() { tip.classList.remove("show"); }

/* ================= 1. 참가 점포 ================= */
const storeState = { area: "all", cat: "all" };

function renderStores() {
  const list = STORES.filter((s) =>
    (storeState.area === "all" || s.area === storeState.area) &&
    (storeState.cat === "all" || s.cat === storeState.cat));
  $("#storeCount").textContent = `${list.length}곳 표시`;
  $("#storeGrid").innerHTML = list.map((s) => `
    <article class="store" data-id="${s.id}" tabindex="0">
      <div class="store-top">
        <span class="area-chip ${s.area}">${s.area === "TS" ? "타임스페이스" : "센트럴파크"}</span>
        <span class="cat">${esc(s.cat)}</span>
      </div>
      <h4>${esc(s.name)}</h4>
      <p class="menu">${esc(s.menu)}</p>
      <div class="team"><span>담당 팀 <b>${esc(s.team)}</b></span><span class="go">상세 →</span></div>
    </article>`).join("");
}

function renderMix() {
  const counts = {};
  STORES.forEach((s) => { counts[s.cat] = (counts[s.cat] || 0) + 1; });
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  $("#catMix").innerHTML = `
    <div class="mix-title">업종 구성 <span>주황선 = 40% 상한 (8곳)</span></div>
    ${rows.map(([c, n]) => `
      <div class="mix-row">
        <span>${esc(c)}</span>
        <div class="mix-track"><div class="mix-fill" style="width:${(n / STORES.length) * 100}%"></div><div class="mix-cap" style="left:40%"></div></div>
        <span class="v">${n}곳 · ${Math.round((n / STORES.length) * 100)}%</span>
      </div>`).join("")}`;
}

function initStores() {
  const cats = [...new Set(STORES.map((s) => s.cat))];
  $("#catFilter").insertAdjacentHTML("beforeend", cats.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join(""));
  $("#catFilter").addEventListener("change", (e) => { storeState.cat = e.target.value; renderStores(); });
  $$("#storeFilters .seg button").forEach((b) => b.addEventListener("click", () => {
    $$("#storeFilters .seg button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    storeState.area = b.dataset.v;
    renderStores();
  }));
  const open = (el) => { const card = el.closest(".store"); if (card) openStoreModal(+card.dataset.id); };
  $("#storeGrid").addEventListener("click", (e) => open(e.target));
  $("#storeGrid").addEventListener("keydown", (e) => { if (e.key === "Enter") open(e.target); });
  renderStores();
  renderMix();
}

/* 점포 상세 모달 */
const modalBg = document.createElement("div");
modalBg.className = "modal-bg";
modalBg.innerHTML = `<div class="modal" role="dialog" aria-modal="true"></div>`;
document.body.appendChild(modalBg);
modalBg.addEventListener("click", (e) => { if (e.target === modalBg) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
function closeModal() { modalBg.classList.remove("show"); }

function openStoreModal(id) {
  const s = STORES.find((x) => x.id === id);
  const a = AREAS[s.area];
  const sc = RESULTS.scores[s.team];
  const total = sc ? CRITERIA.reduce((t, c) => t + sc[c.key], 0).toFixed(1) : "-";
  $(".modal", modalBg).innerHTML = `
    <span class="area-chip ${s.area}">${esc(a.name)}</span>
    <h3>${esc(s.name)}</h3>
    <p class="muted" style="margin:0">${esc(s.cat)} · ${esc(s.menu)}</p>
    <dl>
      <dt>상권 유형</dt><dd>${esc(a.type)} — ${esc(a.headline)}</dd>
      <dt>점주 고민</dt><dd>${esc(s.concern)}</dd>
      <dt>담당 팀</dt><dd><b>${esc(s.team)}</b> (4인)</dd>
      <dt>중간 점수</dt><dd>${total}점 · 기준선 대비 매출 ${sc ? "+" + sc.growth + "%" : "-"}</dd>
    </dl>
    <div class="btns">
      <button class="btn ghost" data-act="close">닫기</button>
      <button class="btn primary" data-act="guide">이 점포로 가이드 시트 만들기</button>
    </div>`;
  modalBg.classList.add("show");
  $('[data-act="close"]', modalBg).onclick = closeModal;
  $('[data-act="guide"]', modalBg).onclick = () => {
    closeModal();
    selectGuideStore(s.id);
    document.getElementById("guide").scrollIntoView();
  };
  $('[data-act="guide"]', modalBg).focus();
}

/* ================= 2. 양방향 선호 매칭 ================= */
const PRESET = {
  team: {
    "주말작전":   ["화로담", "달빛포차", "라멘 토리"],
    "숏폼공장":   ["화로담", "피크닉 샌드위치", "호수빵집"],
    "골목번역단": ["라멘 토리", "화로담", "달빛포차"],
    "방학구조대": ["달빛포차", "화로담", "호수빵집"],
    "피크닉크루": ["피크닉 샌드위치", "호수빵집", "라멘 토리"]
  },
  store: {
    "화로담":          ["방학구조대", "주말작전", "숏폼공장"],
    "라멘 토리":       ["골목번역단", "피크닉크루", "주말작전"],
    "달빛포차":        ["주말작전", "방학구조대", "골목번역단"],
    "호수빵집":        ["숏폼공장", "피크닉크루", "방학구조대"],
    "피크닉 샌드위치": ["숏폼공장", "피크닉크루", "골목번역단"]
  }
};
let prefs = JSON.parse(JSON.stringify(PRESET));
let matchRunning = false;

const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function randomPrefs() {
  prefs = { team: {}, store: {} };
  MATCH_TEAMS.forEach((t) => { prefs.team[t] = shuffle(MATCH_STORES).slice(0, 3); });
  MATCH_STORES.forEach((s) => { prefs.store[s] = shuffle(MATCH_TEAMS).slice(0, 3); });
}

function renderMatchBoard() {
  const node = (name, list, side) => `
    <div class="node" data-side="${side}" data-name="${esc(name)}">
      <div class="nm"><span>${esc(name)}</span><small class="muted st"></small></div>
      <div class="pref">${list.map((p, i) => `<span data-p="${esc(p)}">${i + 1}. ${esc(p)}</span>`).join("")}</div>
    </div>`;
  $("#teamSide").innerHTML = MATCH_TEAMS.map((t) => node(t, prefs.team[t], "team")).join("");
  $("#storeSide").innerHTML = MATCH_STORES.map((s) => node(s, prefs.store[s], "store")).join("");
  $("#matchLinks").innerHTML = "";
}

function nodeEl(side, name) { return $(`.node[data-side="${side}"][data-name="${CSS.escape(name)}"]`); }

function drawLinks(pairs) {
  const board = $(".match-board").getBoundingClientRect();
  const svg = $("#matchLinks");
  svg.setAttribute("viewBox", `0 0 ${board.width} ${board.height}`);
  svg.innerHTML = pairs.map(({ team, store, kind }) => {
    const a = nodeEl("team", team).getBoundingClientRect();
    const b = nodeEl("store", store).getBoundingClientRect();
    const x1 = a.right - board.left, y1 = a.top + a.height / 2 - board.top;
    const x2 = b.left - board.left, y2 = b.top + b.height / 2 - board.top;
    const mx = (x1 + x2) / 2;
    return `<path class="${kind}" d="M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}"/>`;
  }).join("");
}

/* 팀이 제안하는 Gale-Shapley 안정 매칭 → 남은 팀·점포는 운영위 조정 */
function stableMatch() {
  const steps = [];
  const next = Object.fromEntries(MATCH_TEAMS.map((t) => [t, 0]));
  const held = {};          // store -> team
  const free = [...MATCH_TEAMS];
  const rank = (s, t) => { const i = prefs.store[s].indexOf(t); return i < 0 ? 99 : i; };

  while (free.length) {
    const t = free.shift();
    const list = prefs.team[t];
    if (next[t] >= list.length) { steps.push({ type: "exhaust", team: t }); continue; }
    const s = list[next[t]++];
    const cur = held[s];
    if (rank(s, t) === 99) {
      steps.push({ type: "reject", team: t, store: s, why: `${s} 점주 지망에 없음` });
      free.unshift(t);
    } else if (!cur) {
      held[s] = t;
      steps.push({ type: "hold", team: t, store: s });
    } else if (rank(s, t) < rank(s, cur)) {
      held[s] = t;
      steps.push({ type: "swap", team: t, store: s, out: cur });
      free.unshift(cur);
    } else {
      steps.push({ type: "reject", team: t, store: s, why: `${s} 점주가 ${cur} 팀을 더 원함` });
      free.unshift(t);
    }
  }
  const matchedTeams = new Set(Object.values(held));
  const leftTeams = MATCH_TEAMS.filter((t) => !matchedTeams.has(t));
  const leftStores = MATCH_STORES.filter((s) => !held[s]);
  const adjust = leftTeams.map((t, i) => ({ team: t, store: leftStores[i] })).filter((p) => p.store);
  return { steps, held, adjust };
}

async function runMatch() {
  if (matchRunning) return;
  matchRunning = true;
  $("#matchBtn").disabled = $("#shuffleBtn").disabled = true;
  renderMatchBoard();
  const log = $("#matchLog");
  log.innerHTML = "";
  const say = (html, cls = "") => { log.insertAdjacentHTML("beforeend", `<p class="${cls}">${html}</p>`); log.scrollTop = log.scrollHeight; };
  const wait = (ms) => new Promise((r) => setTimeout(r, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms));
  const { steps, held, adjust } = stableMatch();
  const tentative = {};

  const paint = () => drawLinks(Object.entries(tentative).map(([s, t]) => ({ team: t, store: s, kind: "tent" })));

  for (const st of steps) {
    $$(".node").forEach((n) => n.classList.remove("active"));
    if (st.team) nodeEl("team", st.team)?.classList.add("active");
    if (st.store) nodeEl("store", st.store)?.classList.add("active");
    if (st.type === "hold") { tentative[st.store] = st.team; say(`<b>${esc(st.team)}</b> → ${esc(st.store)} 지원, 임시 배정`); }
    if (st.type === "swap") { tentative[st.store] = st.team; say(`<b>${esc(st.team)}</b> → ${esc(st.store)} 지원, 점주가 더 원해서 <b>${esc(st.out)}</b> 팀과 교체`, "rej"); }
    if (st.type === "reject") say(`<b>${esc(st.team)}</b> → ${esc(st.store)} 거절 (${esc(st.why)})`, "rej");
    if (st.type === "exhaust") say(`<b>${esc(st.team)}</b> 1~3지망 모두 소진 → 운영위 조정 대상`, "rej");
    paint();
    await wait(650);
  }

  $$(".node").forEach((n) => n.classList.remove("active"));
  const finals = Object.entries(held).map(([s, t]) => ({ team: t, store: s, kind: "final" }));
  const adj = adjust.map((p) => ({ ...p, kind: "adj" }));
  drawLinks([...finals, ...adj]);

  finals.forEach(({ team, store }) => {
    [["team", team, store], ["store", store, team]].forEach(([side, me, other]) => {
      const el = nodeEl(side, me);
      el.classList.add("done");
      const i = prefs[side][me].indexOf(other);
      $(".st", el).textContent = i >= 0 ? `${i + 1}지망` : "";
      $$(".pref span", el).forEach((sp) => sp.classList.toggle("hit", sp.dataset.p === other));
    });
  });
  adj.forEach(({ team, store }) => {
    nodeEl("team", team).classList.add("adjust");
    nodeEl("store", store).classList.add("adjust");
    $(".st", nodeEl("team", team)).textContent = "운영위 조정";
    $(".st", nodeEl("store", store)).textContent = "운영위 조정";
  });

  const firstPick = finals.filter((f) => prefs.team[f.team][0] === f.store).length;
  say(`✔ 안정 매칭 ${finals.length}쌍 완료 — 팀 1지망 성사 ${firstPick}쌍. 서로 더 원하는 짝으로 바꿀 수 있는 쌍이 없습니다.`, "ok");
  if (adj.length) say(`◐ 남은 ${adj.length}팀은 매칭데이에 운영위가 면담 후 배정합니다: ${adj.map((p) => `${esc(p.team)}–${esc(p.store)}`).join(", ")}`);

  matchRunning = false;
  $("#matchBtn").disabled = $("#shuffleBtn").disabled = false;
  $("#matchBtn").textContent = "다시 실행 ▶";
}

function initMatching() {
  renderMatchBoard();
  $("#matchBtn").addEventListener("click", runMatch);
  $("#shuffleBtn").addEventListener("click", () => {
    randomPrefs(); renderMatchBoard();
    $("#matchBtn").textContent = "매칭 실행 ▶";
    $("#matchLog").innerHTML = `<p class="muted">새 선호가 제출됐습니다. ‘매칭 실행’을 누르세요.</p>`;
  });
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!matchRunning && $(".node.done, .node.adjust")) runMatch(); }, 300); });
}

/* ================= 3. AI 가이드 시트 ================= */
const AREA_I18N = {
  TS: { en: "Songdo Timespace", zh: "松岛 Timespace", ja: "松島タイムスペース" },
  CP: { en: "Songdo Central Park", zh: "松岛中央公园", ja: "松島セントラルパーク" }
};

function selectGuideStore(id) {
  const s = STORES.find((x) => x.id === id);
  $("#gStore").value = id;
  $("#gName").value = s.name;
  $("#gMenu").value = `${s.cat} · ${s.menu}`;
  $("#gConcern").value = s.concern;
}

/* 상권 데이터 기반 규칙 생성 (AI_ENDPOINT가 없을 때) */
function buildLocalSheet(store, name, menuText, concern) {
  const a = AREAS[store.area];
  const menu = store.menu;
  const isTS = store.area === "TS";
  const drink = ["주점"].includes(store.cat);
  const cafe = ["카페·디저트", "베이커리", "브런치"].includes(store.cat);

  const strategies = isTS ? [
    {
      title: drink ? "월요일 ‘첫 잔 쿠폰’" : `${a.weakSlot} 학생 전용 ${menu} 쿠폰`,
      how: drink
        ? `월요일 저녁 인천대 학생증·QR 제시 시 첫 잔 제공. QR별로 사용 건수를 집계해 주차별 효과를 확인`
        : `월요일·오전처럼 비는 시간대에만 쓰는 QR 쿠폰을 배포하고, 점심 피크(12~14시)는 정상가 유지`,
      why: `월요일 전환지수 0.54, 오전 0.44 — 사람은 오지만 돈을 쓰지 않는 시간대`
    },
    {
      title: "주 3회 15초 릴스 + 다국어 버전",
      how: `${menu}의 조리·첫입 장면을 15초로 찍어 릴스·틱톡에 주 3회 업로드. 유학생 팀원이 영·중·일 자막 버전 제작`,
      why: `SNS로 접한 상권 점포가 5개 미만인 학생 85.3% — 알려지지 않은 게 먼저 문제`
    },
    {
      title: cafe ? "식사 후 2차 코스 제휴" : "방학 단골 스탬프 + 연계 코스",
      how: cafe
        ? `인근 식당 영수증 지참 시 디저트 할인 → ‘맛집→디저트→센트럴파크’ 3단계 코스로 묶어 홍보`
        : `학기 중 3회 방문 시 방학용 쿠폰 지급, ‘맛집→디저트 카페→센트럴파크 피크닉’ 코스에 포함`,
      why: `학기 중 단골의 60.9%가 방학에 이탈, 방학 중 ‘거의 안 감’ 69.1%`
    }
  ] : [
    {
      title: cafe ? "평일 오후 ‘산책 세트’" : `평일 공원 산책객용 ${menu} 테이크아웃 세트`,
      how: `평일 14~17시에만 쓰는 QR 쿠폰을 공원 입구 동선에 맞춰 SNS로 배포하고, 주말에는 정상가 유지`,
      why: `유동인구는 +14.0% 늘었지만 매출과의 상관은 +0.05 — 지나가기만 하는 사람이 많음`
    },
    {
      title: "‘카페 다음 코스’ 제안 콘텐츠",
      how: cafe
        ? `대형 카페와 겹치지 않는 대표 메뉴 하나(${menu})에 집중한 비교·추천 릴스 제작`
        : `“카페 말고 뭐 먹지?” 시리즈로 ${menu}를 공원 피크닉 메뉴로 소개, 카페 영수증 지참 할인`,
      why: `카페가 매출의 74.6%, 카페를 뺀 매출은 전년 대비 -29.2%`
    },
    {
      title: "외국인 가족 대상 다국어 홍보",
      how: `영·중·일 3개 언어 메뉴 카드와 숏폼 자막 제작, 구글 지도·샤오홍슈에 리뷰 이벤트`,
      why: `SNS에서 본 상권 점포가 1개 미만인 학생 51.2% — 인지도부터 확보 필요`
    }
  ];

  const hook = isTS ? `“월요일에 타임스페이스 오면 생기는 일”` : `“센트럴파크 산책 끝나고 어디 가?”`;
  const script = [
    { t: "0~3초", scene: `${menu} 클로즈업, 김·소리 강조`, caption: hook },
    { t: "3~8초", scene: `가게 입구 → 자리 → 메뉴가 나오는 장면 빠른 컷`, caption: `${name}, ${a.name}` },
    { t: "8~12초", scene: `학생 팀원이 첫입 먹고 리액션`, caption: isTS ? `인천대 학생 QR 쿠폰 쓰면 더 가볍게` : `평일 오후엔 산책 세트로` },
    { t: "12~15초", scene: `QR 코드 화면 + 위치 핀`, caption: `쿠폰은 프로필 링크에서 · 영/中/日 자막 버전 있음` }
  ];

  const i18n = AREA_I18N[store.area];
  const copies = {
    ko: `${name}의 ${menu}, ${isTS ? "월요일·오전엔" : "평일 오후엔"} 인천대 학생 쿠폰으로 더 가볍게! 📍${a.name}`,
    en: `Craving ${store.en}? Stop by ${name} at ${i18n.en} — show your INU student QR coupon for a special deal.`,
    zh: `想吃${store.zh}吗？来${i18n.zh}的「${name}」，出示仁川大学学生二维码优惠券即可享受专属优惠！`,
    ja: `${store.ja}が食べたくなったら${i18n.ja}の「${name}」へ。仁川大学の学生QRクーポンでお得に！`
  };

  return {
    summary: `${name}(${store.cat})은 ${a.type} 상권인 ${a.name}에 있습니다. ${a.headline}. 수요가 비는 시간은 <b>${a.weakSlot}</b>, 붐비는 시간은 ${a.strongSlot}입니다. 점주 고민 “${esc(concern)}”은 이 공백과 맞닿아 있어, 비는 시간대를 채우는 쪽으로 전략을 짰습니다.`,
    stats: a.stats,
    strategies, script, copies,
    hashtags: [`#${a.name.replace(/\s/g, "")}`, `#${name.replace(/\s/g, "")}`, `#${menu.replace(/[\s·]/g, "")}`, "#인천대", "#송도맛집", "#산학상생챌린지"]
  };
}

async function fetchAISheet(store, name, menuText, concern) {
  const a = AREAS[store.area];
  const res = await fetch(CONFIG.AI_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      store: { name, menu: menuText, category: store.cat, concern },
      area: { name: a.name, type: a.type, headline: a.headline, facts: a.facts },
      survey: SURVEY
    })
  });
  if (!res.ok) throw new Error("AI 응답 오류 " + res.status);
  const data = await res.json();
  data.summary = esc(data.summary);
  data.stats = data.stats?.length ? data.stats : a.stats;
  return data;
}

function renderSheet(d, name, area, source) {
  $("#sheet").innerHTML = `
    <div class="sheet-head">
      <div>
        <h3>${esc(name)} 가이드 시트</h3>
        <p>${esc(AREAS[area].name)} · ${source} · ${new Date().toLocaleDateString("ko-KR")}</p>
      </div>
      <button class="btn ghost sm" id="copySheet">텍스트 복사</button>
    </div>
    <h5>수요 공백 진단</h5>
    <div class="diag">${d.stats.map((s) => `<div><b>${esc(s.v)}</b><span>${esc(s.l)}</span></div>`).join("")}</div>
    <p class="diag-sum">${d.summary}</p>
    <h5>추천 전략 3가지</h5>
    <div class="strats">${d.strategies.map((s, i) => `
      <div class="strat"><i>전략 ${i + 1}</i><b>${esc(s.title)}</b><p>${esc(s.how)}</p><p class="why">근거: ${esc(s.why)}</p></div>`).join("")}</div>
    <h5>15초 숏폼 대본</h5>
    <table class="script"><thead><tr><th>구간</th><th>화면</th><th>자막</th></tr></thead><tbody>
      ${d.script.map((r) => `<tr><td>${esc(r.t)}</td><td>${esc(r.scene)}</td><td>${esc(r.caption)}</td></tr>`).join("")}
    </tbody></table>
    <h5>다국어 홍보 문구</h5>
    <div class="langs">
      ${[["ko", "한국어"], ["en", "English"], ["zh", "中文"], ["ja", "日本語"]].map(([k, l]) => `<div class="lang"><b>${l}</b><p>${esc(d.copies[k])}</p></div>`).join("")}
    </div>
    <div class="hashtags">${(d.hashtags || []).map((h) => `<span>${esc(h)}</span>`).join("")}</div>`;

  $("#copySheet").addEventListener("click", async (e) => {
    const text = $("#sheet").innerText.replace("텍스트 복사", "").trim();
    try { await navigator.clipboard.writeText(text); e.target.textContent = "복사됨 ✓"; }
    catch { e.target.textContent = "복사 실패 — 직접 선택해 주세요"; }
    setTimeout(() => (e.target.textContent = "텍스트 복사"), 2000);
  });
}

function initGuide() {
  $("#gStore").innerHTML = ["TS", "CP"].map((ar) => `
    <optgroup label="${AREAS[ar].name}">
      ${STORES.filter((s) => s.area === ar).map((s) => `<option value="${s.id}">${esc(s.name)} (${esc(s.cat)})</option>`).join("")}
    </optgroup>`).join("");
  $("#gStore").addEventListener("change", (e) => selectGuideStore(+e.target.value));
  selectGuideStore(STORES[0].id);
  if (CONFIG.AI_ENDPOINT) $("#guideMode").textContent = "실제 AI가 응답합니다";

  $("#guideForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const store = STORES.find((s) => s.id === +$("#gStore").value);
    const name = $("#gName").value.trim() || store.name;
    const menuText = $("#gMenu").value.trim();
    const concern = $("#gConcern").value.trim() || store.concern;
    const btn = $("#gBtn");
    btn.disabled = true; btn.textContent = "만드는 중…";
    $("#sheet").innerHTML = `<div class="loading"><div class="spinner"></div><b>${CONFIG.AI_ENDPOINT ? "Claude가 상권 데이터를 분석하고 있어요 (30초 안팎)" : "상권 데이터를 분석하고 있어요"}</b></div>`;
    try {
      let data, source;
      if (CONFIG.AI_ENDPOINT) {
        try { data = await fetchAISheet(store, name, menuText, concern); source = "Claude 생성"; }
        catch (err) { console.warn(err); data = buildLocalSheet(store, name, menuText, concern); source = "AI 연결 실패 — 데이터 기반 자동 생성"; }
      } else {
        await new Promise((r) => setTimeout(r, 900));
        data = buildLocalSheet(store, name, menuText, concern);
        source = "데이터 기반 자동 생성";
      }
      renderSheet(data, name, store.area, source);
    } finally {
      btn.disabled = false; btn.textContent = "가이드 시트 다시 만들기";
    }
  });
}

/* ================= 4. 성과 현황 ================= */
const teamTotal = (t) => CRITERIA.reduce((s, c) => s + RESULTS.scores[t][c.key], 0);
let rankArea = "all";

function renderKpis() {
  const w = RESULTS.weeklyCoupons;
  const sum = w.reduce((a, b) => a + b, 0);
  const growths = Object.values(RESULTS.scores).map((s) => s.growth);
  const avg = growths.reduce((a, b) => a + b, 0) / growths.length;
  const wow = ((w[w.length - 1] / w[w.length - 2] - 1) * 100).toFixed(1);
  const kpis = [
    { l: "누적 쿠폰·QR 사용", v: sum.toLocaleString() + "건", s: `이번 주 ${w[w.length - 1]}건 (전주 대비 +${wow}%)` },
    { l: "기준선 대비 평균 매출", v: "+" + avg.toFixed(1) + "%", s: `20개 점포 평균 · 최고 +${Math.max(...growths)}%` },
    { l: "제작 콘텐츠", v: "486건", s: "릴스·틱톡 312 · 다국어 74 · 기타 100" },
    { l: "점주 만족도", v: "4.4 / 5", s: "8주차 설문 20명 응답" }
  ];
  $("#kpis").innerHTML = kpis.map((k) => `<div class="kpi"><span>${k.l}</span><b>${k.v}</b><small>${k.s}</small></div>`).join("");
}

function renderRank() {
  const teams = Object.keys(RESULTS.scores)
    .filter((t) => rankArea === "all" || storeByTeam(t)?.area === rankArea)
    .sort((a, b) => teamTotal(b) - teamTotal(a));
  $("#rankList").innerHTML = teams.slice(0, 10).map((t, i) => {
    const s = storeByTeam(t);
    const tot = teamTotal(t);
    return `<li>
      <span class="no">${i + 1}</span>
      <span class="who2"><b>${esc(t)}</b><span>${esc(s.name)} · <span class="delta">매출 +${RESULTS.scores[t].growth}%</span></span></span>
      <div class="bar" title="${tot.toFixed(1)}점"><div style="width:${tot}%"></div></div>
      <span class="sc">${tot.toFixed(1)}</span>
    </li>`;
  }).join("");
}

function renderWeekChart() {
  const data = RESULTS.weeklyCoupons;
  const W = 520, H = 220, m = { t: 22, r: 8, b: 26, l: 36 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const max = 400;
  const step = iw / data.length;
  const bw = Math.min(34, step * 0.56);
  const y = (v) => m.t + ih - (v / max) * ih;
  const ticks = [0, 100, 200, 300, 400];
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="주차별 쿠폰 사용 건수: ${data.map((v, i) => `${i + 1}주 ${v}건`).join(", ")}">`;
  svg += `<g class="grid">${ticks.map((t) => `<line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/>`).join("")}</g>`;
  svg += `<g class="axis">${ticks.map((t) => `<text x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join("")}`;
  svg += data.map((_, i) => `<text x="${m.l + step * i + step / 2}" y="${H - 6}" text-anchor="middle">${i + 1}주</text>`).join("") + `</g>`;
  svg += data.map((v, i) => {
    const x = m.l + step * i + (step - bw) / 2;
    const h = ih * (v / max);
    const r = Math.min(4, h);
    const yy = y(v);
    const last = i === data.length - 1;
    // 위쪽 모서리만 4px 둥글게
    const d = `M${x},${m.t + ih} V${yy + r} Q${x},${yy} ${x + r},${yy} H${x + bw - r} Q${x + bw},${yy} ${x + bw},${yy + r} V${m.t + ih} Z`;
    return `<g data-i="${i}"><rect class="hit" x="${m.l + step * i}" y="${m.t}" width="${step}" height="${ih}"/><path class="bar${last ? " last" : ""}" d="${d}"/>${last ? `<text class="lbl" x="${x + bw / 2}" y="${yy - 6}" text-anchor="middle">${v}</text>` : ""}</g>`;
  }).join("");
  svg += `</svg>`;
  const box = $("#weekChart");
  box.innerHTML = svg;
  $$("g[data-i]", box).forEach((g) => {
    const i = +g.dataset.i;
    const move = (e) => {
      const prev = data[i - 1];
      const ch = prev ? ` · 전주 대비 ${data[i] >= prev ? "+" : ""}${data[i] - prev}건` : "";
      showTip(`<b>${i + 1}주차</b> ${data[i]}건${ch}`, e.clientX, e.clientY);
    };
    g.addEventListener("mousemove", move);
    g.addEventListener("mouseleave", hideTip);
  });
}

function renderTopBreakdown() {
  const top = Object.keys(RESULTS.scores).sort((a, b) => teamTotal(b) - teamTotal(a))[0];
  const sc = RESULTS.scores[top];
  const s = storeByTeam(top);
  $("#topBreakdown").innerHTML = `
    <div class="bd-head"><b>${esc(top)} · ${esc(s.name)}</b><span>${teamTotal(top).toFixed(1)}점 / 100</span></div>
    ${CRITERIA.map((c) => `
      <div class="bd-row">
        <span>${c.label}</span>
        <div class="bd-track"><div class="bd-fill" style="width:${(sc[c.key] / c.max) * 100}%"></div></div>
        <span class="v"><b>${sc[c.key]}</b> / ${c.max}</span>
      </div>`).join("")}
    <p class="note">점포 성과는 기준선 매출 대비 증감률(+${sc.growth}%)로 환산한 점수입니다. 막대는 각 항목 배점 대비 비율입니다.</p>`;
}

function initResults() {
  renderKpis();
  renderRank();
  renderWeekChart();
  renderTopBreakdown();
  $$("#rankFilter button").forEach((b) => b.addEventListener("click", () => {
    $$("#rankFilter button").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    rankArea = b.dataset.v;
    renderRank();
  }));
}

/* ================= 시작 ================= */
initStores();
initMatching();
initGuide();
initResults();

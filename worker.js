/* =========================================================
   (선택) 실제 Claude로 가이드 시트를 만드는 Cloudflare Worker
   - GitHub Pages는 정적 사이트라 API 키를 숨길 수 없어서,
     키는 이 Worker의 비밀 변수(ANTHROPIC_API_KEY)에만 넣습니다.
   - 배포 방법은 README.md의 "실제 AI 연결" 참고
   ========================================================= */

const ALLOWED_ORIGIN = "*"; // 배포 후 "https://내아이디.github.io"로 바꾸는 것을 권장

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return new Response("POST only", { status: 405, headers: cors });

    let body;
    try { body = await request.json(); } catch { return new Response("bad json", { status: 400, headers: cors }); }
    const { store = {}, area = {}, survey = {} } = body;
    const clip = (s, n) => String(s ?? "").slice(0, n);

    const prompt = `당신은 송도 상권 마케팅 컨설턴트입니다. 아래 점포와 상권 데이터를 보고, 인천대 학생 마케팅 팀이 첫 주에 받을 "AI 상권 가이드 시트"를 작성하세요.

[점포]
- 점포명: ${clip(store.name, 30)}
- 업종·대표 메뉴: ${clip(store.menu, 40)} (${clip(store.category, 20)})
- 점주의 고민: ${clip(store.concern, 120)}

[상권: ${clip(area.name, 30)} / ${clip(area.type, 20)}]
- 요약: ${clip(area.headline, 60)}
${(area.facts || []).slice(0, 12).map((f) => "- " + clip(f, 120)).join("\n")}
- 인천대 재학생 설문 ${survey.n || 123}명, 참여 의향 ${survey.join || 77.2}%

규칙:
- 근거에는 위 수치만 쓰고, 없는 수치를 지어내지 마세요.
- 학생 팀이 3개월 안에 실행할 수 있고 비용이 거의 들지 않는 전략만 제안하세요.
- 거리 홍보물은 규제로 어렵다는 점을 고려하세요.

아래 JSON 하나만 출력하세요. 다른 말은 쓰지 마세요.
{
  "summary": "수요 공백 진단 2~3문장",
  "stats": [{"v":"핵심 수치","l":"설명"}, ... 3개],
  "strategies": [{"title":"전략 이름","how":"실행 방법 1~2문장","why":"근거 수치"}, ... 3개],
  "script": [{"t":"0~3초","scene":"화면","caption":"자막"}, ... 4개, 합계 15초],
  "copies": {"ko":"한국어 문구","en":"English","zh":"中文","ja":"日本語"},
  "hashtags": ["#..." 5~6개]
}`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: env.MODEL || "claude-sonnet-5-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!r.ok) return new Response(JSON.stringify({ error: await r.text() }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });

    const out = await r.json();
    const text = (out.content || []).map((c) => c.text || "").join("");
    const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    try {
      JSON.parse(json);
      return new Response(json, { headers: { ...cors, "Content-Type": "application/json" } });
    } catch {
      return new Response(JSON.stringify({ error: "invalid model output" }), { status: 502, headers: { ...cors, "Content-Type": "application/json" } });
    }
  }
};

# 송도 산학상생 AI 마케팅 챌린지 — 대회 운영 플랫폼

인천대 학생 4인 팀과 송도 타임스페이스·센트럴파크 점포를 1:1로 매칭하는 상권 활성화 대회의 웹사이트입니다.
2026 Designing Incheon · 인천대학교 글로벌정경대학 · 뽀송뽀송

## 파일 구성

| 파일 | 내용 |
|---|---|
| `index.html` | 페이지 구조 (대회 안내 · 참가 점포 · 매칭 · AI 가이드 시트 · 성과 현황) |
| `style.css` | 디자인 (연두 테마 — 맨 위 `:root` 색상 변수만 바꾸면 전체 색이 바뀜) |
| `data.js` | 상권 수치, 점포 20곳, 팀 성과 데이터 — **내용 수정은 이 파일에서** |
| `app.js` | 필터, 매칭 알고리즘, 가이드 시트 생성, 차트 |
| `worker.js` | (선택) 실제 Claude 연결용 서버 코드 — GitHub Pages에는 영향 없음 |

## GitHub Pages로 배포하기

1. GitHub에서 새 저장소 생성 (예: `ai-marketing-challenge`, Public)
2. 이 폴더의 파일을 모두 업로드 (`Add file → Upload files`) 후 Commit
3. 저장소 `Settings → Pages` → Source: **Deploy from a branch**, Branch: **main / (root)** → Save
4. 1~2분 뒤 `https://내아이디.github.io/ai-marketing-challenge/` 에서 열림

> `index.html`이 저장소 최상위에 있어야 합니다. 폴더째 올려서 한 단계 안에 들어가면 주소 뒤에 폴더명이 붙습니다.

## 실제 AI 연결 (선택)

기본 상태에서는 AI 가이드 시트가 `data.js`의 상권 수치로 **자동 생성**됩니다. (인터넷·API 키 불필요)
실제 Claude가 쓰게 하려면:

1. [Cloudflare](https://dash.cloudflare.com) 가입 → Workers & Pages → Create Worker
2. `worker.js` 내용을 붙여넣고 Deploy
3. Worker의 Settings → Variables → **Secret** 으로 `ANTHROPIC_API_KEY` 추가 (Anthropic Console에서 발급)
4. 발급된 Worker 주소를 `app.js` 맨 위 `CONFIG.AI_ENDPOINT`에 입력 후 다시 커밋

⚠️ API 키를 `app.js`나 다른 파일에 직접 넣지 마세요. GitHub Pages의 코드는 누구나 볼 수 있습니다.
연결에 실패하면 자동으로 데이터 기반 생성으로 돌아갑니다.

## 데이터 안내

- **상권 수치**: 소상공인365 상권분석(2026.10.15 분석), 인천대 재학생 설문(n=123, 2026.10.13~15) — 참가신청서 실제 분석값
- **점포·팀 이름, 성과 수치**: 시연용 가상 예시

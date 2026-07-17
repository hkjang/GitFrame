# GitFrame × AI 에이전트 활용 가이드 🤖

> **이 문서는** GitFrame CLI와 AI 코딩 에이전트를 함께 사용하여, 로컬 웹 프로젝트의 데모 영상을 **자연어 대화만으로** 완전 자동 생성하는 방법을 안내합니다.

---

## 🧭 핵심 개념: AI 에이전트가 GitFrame을 대신 실행한다

GitFrame CLI는 모든 단계가 명령어 기반으로 이루어지기 때문에, 셸 실행 + 파일 읽기/쓰기 도구를 갖춘 AI 에이전트라면 사람 대신 전 과정을 수행할 수 있습니다.

```
사용자 (자연어 요청)
    ↓
AI 에이전트 (프로젝트 분석 → gitframe.yaml 작성 → demo.yaml 작성 → render 실행)
    ↓
GitFrame (빌드 → Playwright 녹화 → FFmpeg 렌더링)
    ↓
최종 결과물 (MP4 영상 + 자막 + HTML 리포트)
```

**사용자가 해야 할 일은 딱 하나:**
> *"이 프로젝트 데모 영상 만들어줘."*

---

## 🛠️ 지원 AI 에이전트 일람

현재 아래 에이전트들이 GitFrame 워크플로우를 자동화하는 데 사용 가능합니다.

| 에이전트 | 개발사 | 형태 | 셸 실행 | 파일 I/O | 권장도 |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **agy (Antigravity)** | Google DeepMind | CLI + IDE | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Claude Code** | Anthropic | CLI | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| **Codex CLI** | OpenAI | CLI | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Qwen Code** | Alibaba | CLI | ✅ | ✅ | ⭐⭐⭐⭐ |
| **OpenCode** | Community OSS | CLI (TUI) | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Cursor Agent** | Anysphere | IDE | ✅ | ✅ | ⭐⭐⭐ |
| **Windsurf Cascade** | Codeium | IDE | ✅ | ✅ | ⭐⭐⭐ |

---

## 🔧 사전 준비 (최초 1회)

AI 에이전트에게 GitFrame을 처음 맡기기 전에, 로컬 환경에 아래가 설치되어 있어야 합니다.

```bash
# 1. GitFrame 저장소 클론
git clone https://github.com/hkjang/GitFrame.git /path/to/GitFrame
cd /path/to/GitFrame

# 2. 의존성 설치 및 TypeScript 컴파일
npm install && npm run build

# 3. Playwright 브라우저 설치
npm run install-browsers

# 4. 시스템 라이브러리 설치 (Linux/WSL 필수)
npx playwright install-deps
sudo apt-get install -y fonts-nanum fonts-noto-color-emoji
```

---

## 💬 에이전트별 시작 방법 & 프롬프트 예시

---

### 1. 🔵 agy (Google Antigravity CLI)

**설치**
```bash
# Antigravity CLI는 Google 내부 배포 채널을 통해 제공됩니다.
# 설치 후 아래 명령으로 실행:
agy
```

**특징**
- Google DeepMind가 개발한 에이전트로, 셸 실행·파일 편집·웹 검색·이미지 생성을 단일 컨텍스트에서 처리
- Skills 시스템으로 커스텀 작업 흐름 정의 가능
- WSL/리눅스 환경에서의 라이브러리 경로 설정, 한글 폰트 트러블슈팅까지 자동으로 대응

**프롬프트 예시**
```
# 기본 요청
/mnt/d/project/my-webapp 프로젝트로 데모 영상 만들어줘.
GitFrame은 /mnt/d/project/GitFrame에 있어.

# 화면 지정 + 자막 요청
/mnt/d/project/admin-panel 프로젝트 영상 만들어줘.
대시보드, 사용자 목록, 통계 페이지 위주로 담고,
각 화면마다 한국어로 상세 자막 넣어줘.

# 영상 완성 후 GitHub 푸시
영상 만들고 https://github.com/myname/myrepo.git 에 커밋해서 올려줘.
```

---

### 2. 🟠 Claude Code (Anthropic)

**설치**
```bash
npm install -g @anthropic-ai/claude-code
claude
```

**특징**
- 터미널 네이티브 에이전트로 파일 읽기/쓰기, 셸 명령 실행을 자유롭게 수행
- 코드베이스 분석 능력이 뛰어나 라우트 자동 감지 정확도가 높음
- `--dangerously-skip-permissions` 옵션으로 승인 없이 자동 실행 가능 (주의)

**프롬프트 예시**
```
# 대화 시작 후 아래처럼 요청
/mnt/d/project/my-webapp 프로젝트로 GitFrame 데모 영상 만들어줘.
GitFrame 경로: /mnt/d/project/GitFrame
각 페이지에 10초씩 머물고, output 폴더에 저장해줘.

# 파이프라인 오류 발생 시 자동 재시도 요청
render 실행하다 오류 났어. 로그 확인하고 원인 파악 후 다시 시도해줘.
```

**자동화 스크립트 (비대화형)**
```bash
# 한 줄 명령으로 무인 실행
claude -p "
/mnt/d/project/my-webapp 프로젝트로 GitFrame 데모 영상 만들어줘.
GitFrame: /mnt/d/project/GitFrame, 출력: /mnt/d/project/my-webapp/output
" --dangerously-skip-permissions
```

---

### 3. 🟢 Codex CLI (OpenAI)

**설치**
```bash
npm install -g @openai/codex
codex
```

**특징**
- OpenAI o3/o4 기반으로 복잡한 멀티스텝 작업에 강함
- `--approval-mode full-auto` 옵션으로 모든 파일/셸 작업을 자동 승인
- 네트워크 요청 차단 샌드박스 모드 지원

**프롬프트 예시**
```
# Codex 실행 후
아래 프로젝트로 GitFrame 데모 영상 만들어줘:
- 프로젝트 경로: /mnt/d/project/my-webapp
- GitFrame 경로: /mnt/d/project/GitFrame
- 해상도: 1440x900
- 각 화면 10초, 주요 화면 위주로 18단계 구성해줘

# 자동화 모드
codex --approval-mode full-auto "
/mnt/d/project/my-webapp 로 GitFrame 데모 영상 만들어줘.
"
```

---

### 4. 🔴 Qwen Code (Alibaba)

**설치**
```bash
# Linux/macOS
curl -fsSL https://qwen-code-assets.oss-cn-hangzhou.aliyuncs.com/installation/install-qwen-standalone.sh | bash

# npm으로도 설치 가능
npm install -g qwen-code
qwen
```

**특징**
- 중국어/한국어 등 다국어 코드베이스 분석에 강점
- 75개 이상의 LLM 프로바이더 연결 지원 (OpenAI, Anthropic, Gemini, Qwen 호환 API)
- `@파일명` 문법으로 로컬 파일을 컨텍스트로 직접 참조 가능
- 헤드리스 모드(`-p` 플래그)로 CI/CD 파이프라인 내 무인 실행 지원

**프롬프트 예시**
```
# 대화 시작 후
/mnt/d/project/my-webapp 프로젝트로 GitFrame 데모 영상 만들어줘.
@/mnt/d/project/GitFrame/docs/gitframe_guide.md 참고해서 작업해줘.

# 헤드리스 무인 실행
qwen -p "/mnt/d/project/my-webapp 로 데모 영상 만들어줘. GitFrame: /mnt/d/project/GitFrame"
```

---

### 5. ⚫ OpenCode (오픈소스 커뮤니티)

**설치**
```bash
# 공식 설치 스크립트
curl -fsSL https://opencode.ai/install | bash

# 또는 npm
npm install -g opencode-ai
opencode
```

**특징**
- 완전 오픈소스 터미널 TUI 에이전트 (벤더 종속 없음)
- 75개 이상 LLM 프로바이더 지원 — Gemini, Claude, GPT, 로컬 Ollama 모두 연결 가능
- Agent Skills 시스템으로 `/review`, `/bugfix` 등 슬래시 명령 커스텀 가능
- VS Code, Zed, Neovim 확장 연동 지원

**프롬프트 예시**
```
# TUI 실행 후 채팅창에 입력
/mnt/d/project/my-webapp 프로젝트 데모 영상 만들어줘.
GitFrame 경로는 /mnt/d/project/GitFrame이야.
영상에 한글 자막 포함하고, output/ 폴더에 저장해줘.

# 단발성 명령
opencode run "프로젝트 /mnt/d/project/my-webapp 으로 GitFrame 데모 영상 만들어줘"
```

---

## 📋 공통 프롬프트 패턴 (에이전트 공통)

어떤 에이전트를 사용하든 아래 패턴을 기반으로 요청하면 됩니다.

### 기본 패턴
```
[프로젝트 경로]로 GitFrame 데모 영상 만들어줘.
GitFrame은 [GitFrame 경로]에 있어.
```

### 화면/시나리오 지정
```
[프로젝트 경로] 영상 만들어줘.
주요 화면: 대시보드, 사용자 관리, 설정, 통계
각 화면마다 10~15초씩 머물고, 로그인 화면은 제외해.
한글 자막은 각 단계를 상세히 설명해줘.
```

### 영상 스타일 설정
```
[프로젝트 경로] 영상 만들어줘.
- 인트로 타이틀: "My App Platform"
- 서브타이틀: "Powered by GitFrame"
- 해상도: 1440x900
- 총 영상 길이: 3분 이상
```

### 여러 프로젝트 일괄 처리
```
아래 3개 프로젝트 모두 영상 만들어줘:
1. /mnt/d/project/project-a
2. /mnt/d/project/project-b
3. /mnt/d/project/project-c
각각 output/ 폴더에 저장해줘.
```

### 영상 생성 후 GitHub 업로드
```
[프로젝트 경로] 영상 만들고,
GitFrame 저장소의 examples/demo-videos/ 폴더에 [이름]-demo.mp4 로 넣어서
https://github.com/[username]/GitFrame 에 푸시해줘.
```

### 오류 재시도
```
render 중 libnspr4.so 오류가 발생했어.
LD_LIBRARY_PATH=./lib/usr/lib/x86_64-linux-gnu 설정하고 다시 실행해줘.
```

```
영상에서 한글이 깨져 보여.
fonts-nanum 설치 확인하고, FFmpeg drawtext에 NanumGothic 폰트 하드코딩해서 재렌더링해줘.
```

---

## 🔄 AI 에이전트의 내부 작업 흐름

에이전트는 아래 순서로 작업을 자동 처리합니다.

```
1. 프로젝트 구조 분석
   ├── 언어/프레임워크 감지 (Go, Node.js, Python, Java, Docker Compose)
   ├── 라우트/페이지 목록 파악 (소스 코드 분석 또는 README 참조)
   └── 포트 번호 및 실행 명령 확인

2. .gitframe/ 설정 파일 생성
   ├── gitframe.yaml (언어, 빌드/실행 명령, 해상도, 인트로/아웃트로)
   └── demo.yaml (goto → pause → caption 기반 18단계 시나리오)

3. GitFrame render 파이프라인 실행
   ├── 격리된 /tmp/gitframe-* 임시 워크스페이스에 프로젝트 복사
   ├── go mod download / npm install / pip install 등 의존성 설치
   ├── 프로젝트 빌드 및 서버 구동 (백그라운드)
   ├── 헬스체크 — 포트가 열릴 때까지 polling 대기
   ├── Playwright 헤드리스 브라우저 시나리오 플레이백 + WebM 녹화
   └── FFmpeg: 인트로 생성 → WebM 트랜스코딩 → 자막 소성 → 아웃트로 병합

4. 결과물 확인 및 제공
   ├── output/demo.mp4 링크 제공
   ├── 오류 발생 시 로그 분석 → 자동 수정 → 재시도
   └── 성공 시 파일 크기/길이 등 요약 리포트 출력
```

---

## 💡 더 좋은 영상을 만드는 팁

### ⏱ 충분한 대기 시간 확보
SPA(React/Vue 등)는 화면 전환 후 데이터 로딩에 시간이 걸립니다.
```
각 페이지 전환 후 10~15초씩 머물러줘.
데이터 로딩이 완료된 상태를 녹화해야 해.
```

### 📏 3분 이상 분량 확보
```
영상이 3분 이상 되도록 페이지마다 10초씩 머물고,
화면이 충분하지 않으면 중요한 화면은 두 번 들러줘.
```

### 🗣 자막 상세 기술
```
각 단계마다 해당 화면이 무엇을 하는 화면인지
한국어로 상세하게 설명하는 자막을 써줘.
```

### 🔒 인증 없는 접근 설정
```
DB 연결이나 로그인 없이도 서버가 구동되도록
환경변수를 설정해줘. (예: AUTH_ENABLED=false)
```

---

## 📎 관련 링크

- 🏠 **GitFrame GitHub**: https://github.com/hkjang/GitFrame
- 📖 **상세 CLI 가이드**: [gitframe_guide.md](gitframe_guide.md)
- 🎬 **샘플 영상 모음**: [../examples/demo-videos/](../examples/demo-videos/README.md)
- 📄 **시나리오 예제**: [../examples/demo-scenario.yaml](../examples/demo-scenario.yaml)

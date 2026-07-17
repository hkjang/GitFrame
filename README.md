# GitFrame CLI 🎥

GitFrame은 웹 프로젝트를 자동으로 실행하고, 정의된 브라우저 시나리오(YAML)에 따라 웹 앱의 동작을 테스트하고 검증하며, 그 과정을 **데모 영상(MP4), 자막(SRT), 썸네일, 실행 로그 및 Playwright Trace** 등으로 자동 패키징해 주는 로컬 개발자용 CLI 도구입니다.

---

## 🛠️ 설치 및 설정 방법 (Installation)

1. **의존성 모듈 설치**:
   ```bash
   npm install
   ```

2. **Playwright 브라우저 바이너리 설치**:
   ```bash
   npm run install-browsers
   ```

3. **시스템 의존성 라이브러리 설치 (최초 1회)**:
   ```bash
   npx playwright install-deps
   ```

---

## 📂 최종 출력 아티팩트 목록 (Artifacts)
시나리오 성공 또는 실패 시 지정된 `--output` 디렉터리에 아래의 진단 데이터와 비디오 파일이 정밀하게 분리되어 출력됩니다.

| 출력 파일 | 설명 | 필수 여부 |
| :--- | :--- | :---: |
| **`demo.mp4`** | 최종 데모 영상 (인트로 + 브라우저 녹화 + 아웃트로 병합) | 성공시 필수 |
| **`raw.webm`** | 브라우저 원본 녹화 비디오 파일 | 필수 |
| **`thumbnail.png`** | 대표 썸네일 이미지 | 필수 |
| **`result.json`** | 실행 및 테스트 검증 상세 결과 리포트 | 필수 |
| **`scenario.json`** | 실행에 활용된 YAML 시나리오의 JSON 변환 구조 | 필수 |
| **`browser.log`** | 브라우저 콘솔 출력 및 네트워크 실패 통합 로그 | 필수 |
| **`runtime.log`** | 의존성 설치, 빌드 및 백그라운드 서버 구동 통합 로그 | 필수 |
| **`screenshots/`** | 시나리오 내 캡처(또는 실패 시점) 이미지 디렉터리 | 필수 |
| **`trace.zip`** | Playwright Trace Viewer 지원 추적 데이터 파일 | 필수 |

---

## 💻 CLI 명령어 체계 (Commands)

```text
gitframe
├── init
├── inspect
├── run
├── record
├── test
├── render
├── create
├── clean
└── doctor
```

### 1. `gitframe init`
프로젝트 디렉터리에 기본 설정 파일 및 디렉터리 구조를 생성합니다.
*   **생성 경로**: `.gitframe/gitframe.yaml`, `.gitframe/demo.yaml`, `.gitframe/assets/`

### 2. `gitframe inspect`
현재 프로젝트의 코드베이스 구조를 파싱하여 언어 유형(Node, Python, Go, Java, Docker Compose)과 추천 설치/실행 명령어 및 포트 후보를 출력합니다.

### 3. `gitframe run`
`gitframe.yaml` 설정을 기반으로 로컬 프로젝트 웹 서버를 백그라운드에 구동하고 포트가 정상 활성화될 때까지 모니터링합니다. 작업 종료(Ctrl+C) 시 포트 충돌을 막기 위해 모든 자식 프로세스를 일괄 회수합니다.

### 4. `gitframe record`
헤디드 브라우저를 열어 사용자가 수동으로 진행하는 클릭, 폼 입력, 스크롤 동작을 실시간 감지하여 `.gitframe/demo.yaml` 테스트 시나리오 파일로 변환 저장합니다.

### 5. `gitframe test`
작성된 데모 시나리오를 비디오 녹화/렌더링(FFmpeg) 과정 없이 순수하게 브라우저 상에서 실행하여 동작 여부를 빠르게 검증합니다. (개발 시 시나리오 검증용으로 적합)

### 6. `gitframe render`
격리된 작업 공간에서 빌드 및 실행을 전개하고, 성공적으로 검증된 시나리오에 따라 인트로/아웃트로를 결합한 최종 `demo.mp4` 영상과 자막을 렌더링합니다.

### 7. `gitframe create`
원격 깃 리포지토리 Shallow Clone부터 빌드, 구동, 플레이백, 비디오 렌더링까지 전체 단계를 한 번에 원스톱으로 처리합니다.

### 8. `gitframe clean`
기존 출력 결과물 폴더 및 OS 임시 디렉터리에 남아있는 `gitframe-*` 격리 작업공간을 모두 청소합니다.

### 9. `gitframe doctor`
로컬 시스템의 의존성 설치 상태(Git, Node.js, Playwright, FFmpeg, Docker) 및 구동 상태를 점검하여 진단 보고서를 출력합니다.

---

## 📝 시나리오 예제 및 스키마

자세한 시나리오 문법은 [examples/demo-scenario.yaml](file:///mnt/d/project/GitFrame/examples/demo-scenario.yaml)을 참고하시기 바랍니다.
*   **우선순위 선택자**: Test ID (`testId`) > Role (`role`, `name`) > Label (`label`) > Placeholder (`placeholder`) > Text (`text`) > CSS 순으로 locator를 지능적으로 선택합니다.

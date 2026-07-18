# Demo Videos 🎥

이 디렉터리에는 GitFrame CLI로 자동 생성된 실제 웹 프로젝트 데모 영상들이 포함되어 있습니다.
각 영상은 `gitframe render` 명령을 통해 **프로젝트 빌드 → Playwright 브라우저 자동화 → FFmpeg 비디오 병합** 전 과정이 완전히 자동화되어 생성되었습니다.

| 파일명 | 프로젝트 설명 | 해상도 | 분량 |
| :--- | :--- | :---: | :---: |
| `sqlon-demo.mp4` | SQLON Operations Platform (Go Web MCP Server) - AI Database 통합 운영 플랫폼 18개 화면 데모 | 1440×900 | 약 3분 |
| `jamypg-demo.mp4` | JAMYPG Operations Platform (Go Web MCP Server) - PostgreSQL NL2SQL 통합 운영 플랫폼 18개 화면 데모 | 1440×900 | 약 3분 |
| `vibe-coders-demo.mp4` | Vibe Coders Gateway (Go AI Coding Proxy Gateway) - AI 코딩 게이트웨이 운영 관리 18개 화면 데모 | 1440×900 | 약 3분 |
| `autoforge-demo.mp4` | AutoForge Control Panel (Node/React Platform) - 로보틱스 공정 제어 및 로드 맵 모니터링 데모 | 1440×900 | 약 2분 |
| `ageforge-demo.mp4` | AgeForge BioOS (Vite/React Platform) - 노화 디지털 트윈 및 프로토콜 관리 플랫폼 15개 화면 데모 | 1440×1400 | 약 2분 |


---

## 영상 생성에 사용된 설정 구조

각 프로젝트의 GitFrame 설정 파일(`gitframe.yaml`)과 시나리오 파일(`demo.yaml`)은 해당 프로젝트의 `.gitframe/` 폴더에서 확인할 수 있습니다.

```
각-프로젝트-루트/
└── .gitframe/
    ├── gitframe.yaml   # 빌드/실행 커맨드, 비디오 해상도, 인트로/아웃트로 설정
    └── demo.yaml       # Playwright 브라우저 자동화 시나리오 단계 정의
```

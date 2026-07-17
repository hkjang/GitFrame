import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { logger } from '../common/logger';
import { DEFAULT_CONFIG } from '../config/loader';

export function runInitCommand(): void {
  const rootDir = process.cwd();
  const configDir = path.join(rootDir, '.gitframe');
  const assetsDir = path.join(configDir, 'assets');

  logger.info(`Initializing GitFrame configuration in ${rootDir}...`);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    logger.info(`Created directory: ${configDir}`);
  }

  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    logger.info(`Created directory: ${assetsDir}`);
  }

  const gitframeYamlPath = path.join(configDir, 'gitframe.yaml');
  if (!fs.existsSync(gitframeYamlPath)) {
    const yamlString = yaml.dump(DEFAULT_CONFIG);
    fs.writeFileSync(gitframeYamlPath, yamlString, 'utf8');
    logger.info(`Created default config: ${gitframeYamlPath}`);
  } else {
    logger.info(`Config already exists: ${gitframeYamlPath}`);
  }

  const demoYamlPath = path.join(configDir, 'demo.yaml');
  if (!fs.existsSync(demoYamlPath)) {
    const sampleDemo = `start_url: "http://localhost:3000"
steps:
  - id: open-home
    action: goto
    url: "/"
    caption: "GitFrame 샘플 대시보드에 접속합니다"
    
  - id: wait-page
    action: pause
    milliseconds: 1000
    
  - id: verify-title
    action: assertVisible
    selector:
      role: "heading"
      name: "GitFrame Sample Form"
    caption: "대시보드 화면이 성공적으로 활성화되었는지 확인합니다"
    
  - id: enter-user
    action: fill
    selector:
      placeholder: "Enter username..."
    value: "DemoUser"
    caption: "사용자 이름 입력창에 'DemoUser'를 기입합니다"
    
  - id: enter-msg
    action: fill
    selector: "#message"
    value: "GitFrame CLI is executing this automated playback!"
    caption: "보낼 설명 메시지를 텍스트 필드에 작성합니다"
    
  - id: click-btn
    action: click
    selector:
      role: "button"
      name: "Submit Action"
    caption: "제출 버튼을 클릭하여 폼 데이터를 제출합니다"
    
  - id: wait-result
    action: waitFor
    selector: "#result-box"
    
  - id: check-success-text
    action: assertText
    selector: "#result-box"
    text: "Success!"
    caption: "화면에 정상 처리 완료 문구가 나타나는지 검증합니다"
    
  - id: final-screen
    action: screenshot
    name: "submit-screenshot"
    caption: "동작 완료 상태의 화면을 최종 캡처하여 저장합니다"
`;
    fs.writeFileSync(demoYamlPath, sampleDemo, 'utf8');
    logger.info(`Created sample scenario: ${demoYamlPath}`);
  } else {
    logger.info(`Scenario already exists: ${demoYamlPath}`);
  }

  logger.info('🎉 GitFrame initialization complete. You can customize the settings now!');
}

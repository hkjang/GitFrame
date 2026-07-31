/* GitFrame Landing Page Script
   Handles i18n (KO/EN), interactive tabs, copy clipboard, and FAQ toggles
*/

document.addEventListener('DOMContentLoaded', () => {
  // Translations Dictionary
  const translations = {
    ko: {
      badgeText: '🎬 개발자를 위한 자동 비디오 검증 CLI',
      heroTitle: '코드 실행부터 고화질 데모 영상 패키징까지 <span class="gradient-text">단 한 줄의 명령어로</span>',
      heroSubtitle: 'GitFrame은 웹 프로젝트를 자동으로 빌드·실행하고, YAML 시나리오로 Playwright 브라우저 동작을 검증한 뒤 MP4 영상, SRT 한글/영문 자막, HTML 진단 리포트로 자동 패키징하는 CLI 도구입니다.',
      btnQuickStart: '빠른 시작하기',
      btnWatchDemos: '데모 영상 둘러보기',
      btnGithub: 'GitHub 저장소',
      
      // Nav
      navFeatures: '핵심 기능',
      navPipeline: '작동 파이프라인',
      navDemos: '데모 영상',
      navQuickstart: '빠른 시작',
      navCli: '명령어',
      navFaq: 'FAQ',
      
      // Section Titles
      secFeaturesTitle: '왜 <span class="gradient-text">GitFrame</span>인가요?',
      secFeaturesDesc: '프로젝트 검증과 데모 영상 제작에 들어가는 귀중한 시간을 혁신적으로 줄여줍니다.',
      
      secPipelineTitle: '완전 자동화된 <span class="gradient-text">렌더링 파이프라인</span>',
      secPipelineDesc: '격리된 작업 공간에서 빌드부터 비디오 최종 합성까지 안전하고 완벽하게 처리됩니다.',
      
      secDemosTitle: '실제 생성된 <span class="gradient-text">데모 영상 사례</span>',
      secDemosDesc: '모든 영상은 화면 캡처 소프트웨어 없이 GitFrame CLI 명령어 하나로 자동 생성되었습니다.',
      
      secQuickstartTitle: '3분 만에 시작하는 <span class="gradient-text">GitFrame</span>',
      secQuickstartDesc: '기존 프로젝트에 바로 적용할 수 있는 쉬운 명령어와 YAML 설정 가이드.',
      
      secCliTitle: '직관적인 <span class="gradient-text">CLI 명령어 체계</span>',
      secCliDesc: '개발 흐름에 필요한 모든 동작을 간편하게 제어하세요.',
      
      secFaqTitle: '자주 묻는 <span class="gradient-text">질문 (FAQ)</span>',
      secFaqDesc: 'GitFrame의 활용법 및 기술 스펙에 대한 궁금증을 확인하세요.',
      
      // Contact Footer
      footerTagline: '웹 프로젝트 실행, E2E 검증, 데모 비디오 렌더링 풀 파이프라인 자동화 CLI',
      contactTitle: '문의 및 의견',
      contactDesc: '제품 문의, 협업 제안 및 기능 요청은 아래 이메일로 전달해 주세요.',
      emailLabel: '📧 이메일 문의:'
    },
    en: {
      badgeText: '🎬 Automated Video Verification CLI for Developers',
      heroTitle: 'From Code Execution to High-Def Demo Videos <span class="gradient-text">In a Single Command</span>',
      heroSubtitle: 'GitFrame automatically builds and executes web projects, verifies Playwright browser scenarios, and packages high-definition MP4 videos, SRT subtitles, and HTML diagnostic reports.',
      btnQuickStart: 'Get Started',
      btnWatchDemos: 'Explore Demos',
      btnGithub: 'GitHub Repo',
      
      // Nav
      navFeatures: 'Features',
      navPipeline: 'Pipeline',
      navDemos: 'Demo Videos',
      navQuickstart: 'Quick Start',
      navCli: 'CLI Commands',
      navFaq: 'FAQ',
      
      // Section Titles
      secFeaturesTitle: 'Why Choose <span class="gradient-text">GitFrame</span>?',
      secFeaturesDesc: 'Dramatically reduce the developer overhead for demo recording and E2E verification.',
      
      secPipelineTitle: 'Fully Automated <span class="gradient-text">Rendering Pipeline</span>',
      secPipelineDesc: 'Executed safely inside an isolated temporary sandbox from build to final video compositing.',
      
      secDemosTitle: 'Real-World <span class="gradient-text">Demo Showcases</span>',
      secDemosDesc: 'All videos were automatically rendered using a single GitFrame CLI command with zero screen capture software.',
      
      secQuickstartTitle: 'Get Started in <span class="gradient-text">3 Minutes</span>',
      secQuickstartDesc: 'Easy command initialization and straightforward YAML scenario configurations.',
      
      secCliTitle: 'Intuitive <span class="gradient-text">CLI Architecture</span>',
      secCliDesc: 'Control every stage of your development and recording workflow effortlessly.',
      
      secFaqTitle: 'Frequently Asked <span class="gradient-text">Questions</span>',
      secFaqDesc: 'Find answers about GitFrame capabilities, architecture, and system requirements.',
      
      // Contact Footer
      footerTagline: 'Automated web app execution, E2E browser testing, and demo video rendering CLI pipeline.',
      contactTitle: 'Contact & Support',
      contactDesc: 'For product inquiries, partnership proposals, or feature requests, feel free to email us.',
      emailLabel: '📧 Contact Email:'
    }
  };

  // Current Language State
  let currentLang = localStorage.getItem('gitframe_lang') || 'ko';

  function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('gitframe_lang', lang);

    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Update Text Elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });

    // Toggle KO / EN specific elements
    document.querySelectorAll('.lang-content-ko').forEach(el => {
      el.style.display = (lang === 'ko') ? '' : 'none';
    });
    document.querySelectorAll('.lang-content-en').forEach(el => {
      el.style.display = (lang === 'en') ? '' : 'none';
    });

    document.documentElement.lang = lang;
  }

  // Language Switch Button Events
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedLang = e.target.dataset.lang;
      updateLanguage(selectedLang);
    });
  });

  // Initial Language setup
  updateLanguage(currentLang);

  // Copy Code Snippets
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const textToCopy = targetId ? document.getElementById(targetId).innerText : btn.previousElementSibling.innerText;
      
      navigator.clipboard.writeText(textToCopy.trim()).then(() => {
        const originalText = btn.innerText;
        btn.innerText = (currentLang === 'ko') ? '복사됨!' : 'Copied!';
        btn.style.color = '#10B981';
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.color = '';
        }, 2000);
      });
    });
  });

  // Tabs System for Quick Start
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(`tab-${tabTarget}`);
      if (activePane) activePane.classList.add('active');
    });
  });

  // FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all
      faqItems.forEach(i => i.classList.remove('active'));
      
      // Open clicked if was not active
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
});

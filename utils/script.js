/* 
  script.js - 웹사이트의 동작을 담당하는 스크립트 파일입니다.
  주로 언어 변경(한국어/영어) 기능과 스크롤 애니메이션을 처리합니다.
*/


// ===========================================
// 0. 헤더/푸터 동적 로딩 (Dynamic Loading)
// ===========================================
async function loadComponents() {
    try {
        // 헤더 로드
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            const response = await fetch('Components/header.html');
            const text = await response.text();
            headerPlaceholder.innerHTML = text;
        }

        // 푸터 로드
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            const response = await fetch('Components/footer.html');
            const text = await response.text();
            footerPlaceholder.innerHTML = text;
        }

        // 로딩 완료 후 초기화 로직 실행
        initLanguage();
        setActiveNavLink();
        hideEmptyLinks();

    } catch (error) {
        console.error('Error loading components:', error);
    }
}

// ===========================================
// 1. 언어 변경 기능 (Korean / English Toggle)
// ===========================================
function initLanguage() {
    const langBtns = document.querySelectorAll('.lang-btn');
    const langElements = document.querySelectorAll('[data-lang-kr], [data-lang-en]');

    function setLanguage(lang) {
        langBtns.forEach(btn => {
            if (btn.dataset.lang === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        langElements.forEach(el => {
            // 네비게이션 링크는 텍스트만 변경 (href 유지)
            if (el.tagName === 'A' && el.classList.contains('nav-link')) {
                if (lang === 'kr') {
                    if (el.hasAttribute('data-lang-kr')) el.textContent = el.getAttribute('data-lang-kr');
                } else {
                    if (el.hasAttribute('data-lang-en')) el.textContent = el.getAttribute('data-lang-en');
                }
                return; // 네비게이션 링크는 여기서 처리 끝
            }

            // 일반 요소 처리
            if (lang === 'kr') {
                if (el.hasAttribute('data-lang-kr')) {
                    el.textContent = el.getAttribute('data-lang-kr');
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            } else {
                if (el.hasAttribute('data-lang-en')) {
                    el.textContent = el.getAttribute('data-lang-en');
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            }
        });

        document.querySelectorAll('.lang-kr').forEach(el => {
            el.style.display = (lang === 'kr') ? '' : 'none';
        });
        document.querySelectorAll('.lang-en').forEach(el => {
            el.style.display = (lang === 'en') ? '' : 'none';
        });

        localStorage.setItem('preferred-lang', lang);
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });

    const savedLang = localStorage.getItem('preferred-lang') || 'kr';
    setLanguage(savedLang);
}

// ===========================================
// 현재 페이지 네비게이션 하이라이트
// ===========================================
function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');
            // 드롭다운 메뉴의 경우 부모(출판)도 활성화
            const parentDropdown = link.closest('.dropdown');
            if (parentDropdown) {
                const parentLink = parentDropdown.querySelector('.nav-link');
                if (parentLink) parentLink.classList.add('active');
            }
        }
    });
}

// ===========================================
// 3. 소셜 링크 및 학술 링크 자동 숨김 (Hide Empty Links)
// ===========================================
function hideEmptyLinks() {
    const externalLinks = document.querySelectorAll('.social-links a, .academic-links a');
    externalLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.trim() === '') {
            link.style.display = 'none';
        }
    });
}

// ===========================================
// 2. 스크롤 시 페이드 인 애니메이션 (Fade In Animation)
// ===========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // 실행 시작
    loadComponents();
});

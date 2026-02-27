/* 
  script.js - 웹사이트의 동작을 담당하는 스크립트 파일입니다.
  주로 언어 변경(한국어/영어) 기능과 스크롤 애니메이션을 처리합니다.
*/

// [News] 최신 소식 페이지에 표시할 뉴스 개수 (0 = 제한 없음)
const LATEST_NEWS_COUNT = 6;

// Pagination Configuration
const ITEMS_PER_PAGE = 5;
let currentNewsRows = []; // Store news items for pagination
let currentProjectRows = []; // Store project items for pagination


// ===========================================
// 0. 헤더/푸터 동적 로딩 (Dynamic Loading)
// ===========================================
async function loadComponents() {
    try {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            const response = await fetch('components/header.html');
            if (!response.ok) {
                throw new Error(`Failed to load header: ${response.status} ${response.statusText}`);
            }
            const text = await response.text();
            headerPlaceholder.innerHTML = text;
        } else {
            console.error('Header placeholder not found!');
        }

        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            const response = await fetch('components/footer.html');
            if (!response.ok) {
                throw new Error(`Failed to load footer: ${response.status} ${response.statusText}`);
            }
            const text = await response.text();
            footerPlaceholder.innerHTML = text;
        } else {
            console.error('Footer placeholder not found!');
        }

        // 로딩 완료 후 초기화 로직 실행
        initLanguage();
        setActiveNavLink();
        hideEmptyLinks();
        initDropdownToggle();
        initScrollTopButton();

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
        // 토글 버튼 애니메이션
        document.querySelectorAll('.lang-toggle').forEach(container => {
            container.classList.toggle('en-active', lang === 'en');
        });
        langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));

        // 내용 즉시 교체
        langElements.forEach(el => {
            const text = el.getAttribute(lang === 'kr' ? 'data-lang-kr' : 'data-lang-en');
            if (text) {
                if (el.tagName === 'A' && el.classList.contains('nav-link')) {
                    el.textContent = text;
                } else {
                    el.textContent = text;
                    el.style.display = '';
                }
            } else if (!el.classList.contains('nav-link')) {
                el.style.display = 'none';
            }
        });

        document.querySelectorAll('.lang-kr').forEach(el => el.style.display = (lang === 'kr' ? '' : 'none'));
        document.querySelectorAll('.lang-en').forEach(el => el.style.display = (lang === 'en' ? '' : 'none'));

        localStorage.setItem('preferred-lang', lang);

        const pageType = document.body.getAttribute('data-page-type');
        if (pageType) {
            // Member pages
            if (['students', 'alumni', 'supporters'].includes(pageType)) {
                renderMemberContent(pageType);
            }
            // News pages & Home page (for Recent News)
            else if (['news-latest', 'news-research', 'news-other'].includes(pageType)) {
                loadNews(pageType);
            }
            else if (pageType === 'home') {
                loadNews('home');
            }
            // Publication pages
            else if (pageType === 'publications') {
                loadPublications();
            }
            // Project pages
            else if (pageType === 'project') {
                loadProject();
            }
        }
    }

    // 전체 토글 컨테이너 클릭 시 스왑 (어느 버튼을 눌러도, 같은 언어를 눌러도 변경)
    document.querySelectorAll('.lang-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentLang = localStorage.getItem('preferred-lang') || 'kr';
            const nextLang = currentLang === 'kr' ? 'en' : 'kr';
            setLanguage(nextLang);
        });
    });

    const savedLang = localStorage.getItem('preferred-lang') || 'kr';
    setLanguage(savedLang);
}

// Helper: 요소의 텍스트를 현재 언어 설정에 맞게 업데이트
function updateElementText(el) {
    const currentLang = localStorage.getItem('preferred-lang') || 'kr';
    const isKr = currentLang === 'kr';
    if (isKr && el.hasAttribute('data-lang-kr')) {
        el.textContent = el.getAttribute('data-lang-kr');
    } else if (!isKr && el.hasAttribute('data-lang-en')) {
        el.textContent = el.getAttribute('data-lang-en');
    }
}

// ===========================================
// 현재 페이지 네비게이션 하이라이트
// ===========================================
function setActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    // 헤더 안의 모든 링크(메인 및 서브)를 탐색
    const allLinks = document.querySelectorAll('.header-nav a');

    allLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (linkPath === currentPath) {
            link.classList.add('active');

            // 만약 현재 링크가 드롭다운 내부에 있다면, 부모 메인 메뉴도 활성화
            const dropdown = link.closest('.dropdown');
            if (dropdown) {
                const parentNavLink = dropdown.querySelector('.nav-link');
                if (parentNavLink) parentNavLink.classList.add('active');
            }
        }
    });
}

// ===========================================
// 3.1. 드롭다운 토글 기능 (Dropdown Click Toggle)
// ===========================================
function initDropdownToggle() {
    const dropdowns = document.querySelectorAll('.dropdown');
    const header = document.querySelector('.header');

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        if (!link) return;

        link.addEventListener('click', (e) => {
            if (!dropdown.classList.contains('active')) {
                e.preventDefault();

                // 다른 열려있는 드롭다운 닫기
                dropdowns.forEach(d => d.classList.remove('active'));

                dropdown.classList.add('active');
                header.classList.add('submenu-active');
            } else {
                e.preventDefault();
                dropdown.classList.remove('active');
                header.classList.remove('submenu-active');
            }
        });
    });

    // 외부 클릭 시 드롭다운 닫기
    window.addEventListener('click', (e) => {
        // .dropdown 클래스 내부 클릭이 아니면서, .lang-toggle(언어 전환) 클릭도 아닐 때만 닫음
        if (!e.target.closest('.dropdown') && !e.target.closest('.lang-toggle')) {
            dropdowns.forEach(d => d.classList.remove('active'));
            header.classList.remove('submenu-active');
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



// ===========================================
// [Main Entry Point] DOMContentLoaded
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // 0. 헤더/푸터 로드 (가장 먼저 실행) - loadComponents() 내부에서 언어 설정 등 초기화
    loadComponents();

    // 1. 스크롤 애니메이션 옵저버 등록 (.fade-in 클래스 요소들)
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // 2. 페이지 타입에 따른 데이터 로딩 분기 (data-page-type 속성 확인)
    const pageType = document.body.getAttribute('data-page-type');
    if (pageType) {
        // [출판물 페이지] Publications
        if (pageType === 'publications') {
            loadPublications();
        }
        // [구성원 페이지] Professor(없음), Students, Alumni, Supporters
        else if (['students', 'alumni', 'supporters'].includes(pageType)) {
            loadMembers(pageType);
        }
        // [소식 페이지] Latest, Research, Other
        else if (['news-latest', 'news-research', 'news-other'].includes(pageType)) {
            loadNews(pageType);
        }
        // [프로젝트 페이지] Project (Unified Ongoing/Previous)
        else if (pageType === 'project') {
            loadProject();
        }
        // [메인 페이지] Home (Recent News 4 items)
        else if (pageType === 'home') {
            loadNews('home');
        }
    }
});

// ===========================================
// Scroll To Top Button
// ===========================================
function initScrollTopButton() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
}

window.scrollToTop = function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};


// ===========================================
// Project Loading
// ===========================================
let currentProjectFilter = 'All'; // 전역으로 필터 상태 관리

async function loadProject(pageNum = 1, shouldScroll = false, filterCategory = currentProjectFilter) {
    try {
        currentProjectFilter = filterCategory; // 상태 업데이트
        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const container = document.getElementById('news-list');
        const filterContainer = document.getElementById('project-filters');
        if (!container) return;

        if (currentProjectRows.length === 0) {
            const response = await fetch('data/project.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const text = await response.text();
            currentProjectRows = parseCSV(text);
        }

        const rows = currentProjectRows;
        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        const isKr = currentLang === 'kr';

        // Render Filter Buttons
        if (filterContainer) {
            renderProjectFilters(filterContainer, isKr);
        }

        let filteredRows = [];
        const currentYear = new Date().getFullYear();

        if (currentProjectFilter === 'All') {
            filteredRows = rows;
        } else if (currentProjectFilter === 'Ongoing') {
            filteredRows = rows.filter(r => {
                const endStr = r.end ? r.end.trim() : '';
                if (endStr === '') return true; // Empty end date means ongoing
                const endYear = parseInt(endStr.split(/[.-]/)[0], 10);
                return !isNaN(endYear) && endYear >= currentYear;
            });
        } else if (currentProjectFilter === 'Previous') {
            filteredRows = rows.filter(r => {
                const endStr = r.end ? r.end.trim() : '';
                if (endStr === '') return false; // Empty means ongoing, not previous
                const endYear = parseInt(endStr.split(/[.-]/)[0], 10);
                return !isNaN(endYear) && endYear < currentYear;
            });
        }

        if (filteredRows.length === 0) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
                ${isKr ? '해당 필터에 등록된 프로젝트가 없습니다.' : 'No projects found for this category.'}
            </p>`;
            return;
        }

        // Sort logic: 
        // 1. Ongoing (`end` is empty) comes first
        // 2. Then sort by `start` date descending
        filteredRows.sort((a, b) => {
            const aOngoing = !a.end || a.end.trim() === '';
            const bOngoing = !b.end || b.end.trim() === '';

            if (aOngoing && !bOngoing) return -1;
            if (!aOngoing && bOngoing) return 1;

            // If both are ongoing or both are previous, sort by start date
            return new Date(b.start) - new Date(a.start);
        });

        // Pagination logic
        const totalItems = filteredRows.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
        const pagedRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        container.innerHTML = '';

        // Pagination (Top)
        const topPag = document.createElement('div');
        renderPagination(topPag, totalPages, pageNum, (newPage) => loadProject(newPage, true));
        container.appendChild(topPag);

        // Content
        const contentArea = document.createElement('div');
        renderProjectPage(pagedRows, contentArea, isKr, true);
        container.appendChild(contentArea);

        // Pagination (Bottom)
        const bottomPag = document.createElement('div');
        renderPagination(bottomPag, totalPages, pageNum, (newPage) => loadProject(newPage, true));
        container.appendChild(bottomPag);

    } catch (error) {
        console.error('Error loading project:', error);
        const container = document.getElementById('news-list');
        if (container) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">Error loading projects.</p>`;
        }
    }
}

function renderProjectFilters(container, isKr) {
    const filters = [
        { id: 'All', labelKr: '전체', labelEn: 'All' },
        { id: 'Ongoing', labelKr: '진행 중', labelEn: 'Ongoing' },
        { id: 'Previous', labelKr: '종료', labelEn: 'Previous' }
    ];

    let html = '';
    filters.forEach(f => {
        const isActive = currentProjectFilter === f.id ? 'active' : '';
        const label = isKr ? f.labelKr : f.labelEn;
        html += `<button class="pub-filter-btn ${isActive}" onclick="loadProject(1, false, '${f.id}')">${label}</button>`;
    });
    container.innerHTML = html;
}

// ===========================================
// Pagination UI Renderer
// ===========================================
function renderPagination(target, totalPages, currentPage, onPageChange) {
    if (!target) return;
    if (totalPages < 1) {
        target.innerHTML = '';
        return;
    }

    let html = `<div class="pagination-container">`;

    // 1. Left Side: Jump to First (<<) and Step Previous (<)
    html += `<div class="pagination-side">
        <button class="pagination-btn pagination-arrow" ${currentPage === 1 ? 'disabled' : ''} data-page="1" title="Jump to First">
            <i class="ri-arrow-left-double-line"></i>
        </button>
        <button class="pagination-btn pagination-arrow" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}" title="Previous Page">
            <i class="ri-arrow-left-s-line"></i>
        </button>
    </div>`;

    // 2. Center: Status Indicator (X / Y)
    html += `<span class="pagination-status">${currentPage} / ${totalPages}</span>`;

    // 3. Right Side: Step Next (>) and Jump to Last (>>)
    html += `<div class="pagination-side">
        <button class="pagination-btn pagination-arrow" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}" title="Next Page">
            <i class="ri-arrow-right-s-line"></i>
        </button>
        <button class="pagination-btn pagination-arrow" ${currentPage === totalPages ? 'disabled' : ''} data-page="${totalPages}" title="Jump to Last">
            <i class="ri-arrow-right-double-line"></i>
        </button>
    </div>`;

    html += `</div>`;
    target.innerHTML = html;

    // Attach Event Listeners
    target.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.disabled) return;
            const page = parseInt(btn.getAttribute('data-page'));
            if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                onPageChange(page);
            }
        });
    });

    // Store current pagination context for keyboard navigation
    window.currentPagination = { totalPages, currentPage, onPageChange };
}

// Global Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (!window.currentPagination) return;
    const { totalPages, currentPage, onPageChange } = window.currentPagination;

    if (e.key === 'ArrowLeft' && currentPage > 1) {
        onPageChange(currentPage - 1);
    } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        onPageChange(currentPage + 1);
    }
});

// ===========================================
// News Loading
// ===========================================
// ===========================================
// News Loading & Modal
// ===========================================
async function loadNews(pageType, pageNum = 1, shouldScroll = false) {
    try {
        if (shouldScroll) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        if (currentNewsRows.length === 0) {
            const response = await fetch('data/news.csv');
            const text = await response.text();
            currentNewsRows = parseCSV(text);
        }

        const rows = currentNewsRows;
        const container = document.getElementById('news-list');
        if (!container && pageType !== 'home') return;

        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        const isKr = currentLang === 'kr';

        let filteredRows = [];
        let targetContainer = container;

        if (pageType === 'news-latest') {
            filteredRows = rows;
        } else if (pageType === 'news-research') {
            filteredRows = rows.filter(r => r.type && r.type.toLowerCase() === 'research');
        } else if (pageType === 'news-other') {
            filteredRows = rows.filter(r => r.type && r.type.toLowerCase() === 'other');
        } else if (pageType === 'home') {
            targetContainer = document.getElementById('recent-news-list');
            if (!targetContainer) return;
            filteredRows = rows;
        } else {
            filteredRows = rows;
        }

        if (filteredRows.length === 0) {
            targetContainer.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
                ${isKr ? '등록된 소식이 없습니다.' : 'No news found.'}
            </p>`;
            return;
        }

        filteredRows.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (pageType === 'home' || pageType === 'news-latest') {
            const limit = pageType === 'home' ? 3 : (LATEST_NEWS_COUNT > 0 ? LATEST_NEWS_COUNT : 20);
            filteredRows = filteredRows.slice(0, limit);
            renderNewsPage(filteredRows, targetContainer, isKr, pageType !== 'home');
            return;
        }

        const totalItems = filteredRows.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
        const pagedRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        targetContainer.innerHTML = '';

        const topPag = document.createElement('div');
        renderPagination(topPag, totalPages, pageNum, (newPage) => loadNews(pageType, newPage, true));
        targetContainer.appendChild(topPag);

        const contentArea = document.createElement('div');
        renderNewsPage(pagedRows, contentArea, isKr, true);
        targetContainer.appendChild(contentArea);

        const bottomPag = document.createElement('div');
        renderPagination(bottomPag, totalPages, pageNum, (newPage) => loadNews(pageType, newPage, true));
        targetContainer.appendChild(bottomPag);

    } catch (error) {
        console.error('Error loading news:', error);
        const container = document.getElementById('news-list');
        if (container) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">Error loading news.</p>`;
        }
    }
}

function renderNewsPage(rows, container, isKr, useWrapper = true) {
    let html = '';
    if (useWrapper) {
        html += '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    }

    rows.forEach(item => {
        const title = isKr && item.title_kr ? item.title_kr : item.title_en;
        const summary = isKr && item.sum_kr ? item.sum_kr : item.sum_en;

        const btnText = isKr ? '자세히 보기' : 'Read More';
        const link = item.link && item.link !== '#' ? item.link : '';
        let clickAction = '';
        let additionalClass = '';

        if (!link) {
            additionalClass = ' disabled';
        } else {
            clickAction = `onclick="openNewsModal('${link}')"`;
        }

        const defaultThumb = 'asset/default-thumb.png';
        const thumbSrc = item.thumbnail && item.thumbnail.trim() !== '' ? item.thumbnail : defaultThumb;

        html += `
        <div class="publication-card">
            <div class="pub-card-layout">
                <div class="pub-img-wrapper">
                    <img src="${thumbSrc}" onerror="this.onerror=null; this.src='${defaultThumb}';" alt="Thumbnail">
                </div>
                <div class="pub-content">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${title}</h3>
                    <p style=" margin-bottom: 0.5rem; font-size: 0.95rem;">
                        ${summary.replace(/\\n|\n/g, '<br>')}
                    </p>
                    <p style="color: var(--color-text-muted); font-weight: 500; font-size: 0.9rem;">
                        ${item.date}
                    </p>
                    <a href="#" ${clickAction} class="cv-btn${additionalClass}" style="margin-top: 1rem; font-size: 0.85rem; padding: 0.3rem 1rem;">${btnText}</a>
                </div>
            </div>
        </div>
        `;
    });

    if (useWrapper) {
        html += '</div>';
    }
    container.innerHTML = html;
}

function renderProjectPage(rows, container, isKr, useWrapper = true) {
    let html = '';
    if (useWrapper) {
        html += '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    }

    rows.forEach(item => {
        const title = isKr && item.title_kr ? item.title_kr : item.title_en;
        const summary = isKr && item.sum_kr ? item.sum_kr : item.sum_en;

        const btnText = isKr ? '자세히 보기' : 'Read More';
        const link = item.link && item.link !== '#' ? item.link : '';
        let clickAction = '';
        let additionalClass = '';

        if (!link) {
            additionalClass = ' disabled';
        } else {
            clickAction = `onclick="openNewsModal('${link}')"`; // We reuse the news modal since the rendering is identical
        }

        const defaultThumb = 'asset/default-thumb.png';
        const thumbSrc = item.thumbnail && item.thumbnail.trim() !== '' ? item.thumbnail : defaultThumb;

        // Date Handling: start ~ end (Year only)
        const startStr = item.start ? item.start.trim().split('.')[0].split('-')[0] : '';
        const endStr = item.end ? item.end.trim().split('.')[0].split('-')[0] : '';
        const presentStr = isKr ? '현재' : 'Present';
        const dateDisplay = endStr === '' ? `${startStr} ~ ${presentStr}` : `${startStr} ~ ${endStr}`;

        html += `
        <div class="publication-card">
            <div class="pub-card-layout">
                <div class="pub-img-wrapper">
                    <img src="${thumbSrc}" onerror="this.onerror=null; this.src='${defaultThumb}';" alt="Thumbnail">
                </div>
                <div class="pub-content">
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${title}</h3>
                    <p style=" margin-bottom: 0.5rem; font-size: 0.95rem;">
                        ${summary.replace(/\\n|\n/g, '<br>')}
                    </p>
                    <p style="color: var(--color-text-muted); font-weight: 500; font-size: 0.9rem;">
                        ${dateDisplay}
                    </p>
                    <a href="#" ${clickAction} class="cv-btn${additionalClass}" style="margin-top: 1rem; font-size: 0.85rem; padding: 0.3rem 1rem;">${btnText}</a>
                </div>
            </div>
        </div>
        `;
    });

    if (useWrapper) {
        html += '</div>';
    }
    container.innerHTML = html;
}

// Modal Functions
// Helper: Fetch and Render Markdown (Bilingual Support)
async function fetchAndRenderMarkdown(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load content');
        const text = await response.text();

        // Language parsing
        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        let contentToRender = text;

        const krMarker = '<!-- KR -->';
        const enMarker = '<!-- EN -->';

        const krStart = text.indexOf(krMarker);
        const enStart = text.indexOf(enMarker);

        if (krStart !== -1 && enStart !== -1) {
            const parts = text.split(enMarker);
            const krPart = parts[0].replace(krMarker, '');
            const enPart = parts[1] || '';
            contentToRender = currentLang === 'kr' ? krPart : enPart;
        }

        if (typeof marked !== 'undefined') {
            return marked.parse(contentToRender, { breaks: true });
        } else {
            console.warn('Marked.js not found. Rendering raw text.');
            return `<pre style="white-space: pre-wrap; font-family: inherit;">${contentToRender}</pre>`;
        }
    } catch (error) {
        console.error('Error fetching markdown:', error);
        throw error;
    }
}

window.openNewsModal = async function (url) {
    // If no URL, do nothing (disabled button case)
    if (!url || url.trim() === '') return;

    // 1. External Link Check
    if (url.startsWith('http') || url.startsWith('https')) {
        window.open(url, '_blank');
        return;
    }

    const modal = document.getElementById('news-modal');
    const modalBody = document.getElementById('news-modal-body');
    if (!modal || !modalBody) return;

    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    modalBody.innerHTML = '<p>Loading...</p>';

    try {
        const html = await fetchAndRenderMarkdown(url);
        modalBody.innerHTML = html;
    } catch (error) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem 0; color: var(--color-text-muted);">
                <p style="margin-bottom: 0.5rem;">Content not found.</p>
                <p>내용을 찾을 수 없습니다.</p>
            </div>
        `;
    }
};

window.closeNewsModal = function () {
    const modal = document.getElementById('news-modal');
    if (modal) {
        modal.classList.remove('active');
        // Wait for transition to finish before hiding
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scroll
        }, 300);
    }
};

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const newsModal = document.getElementById('news-modal');
    if (newsModal && e.target === newsModal) {
        closeNewsModal();
    }
    const cvModal = document.getElementById('cv-modal');
    if (cvModal && e.target === cvModal) {
        closeCVModal();
    }
});

// ===========================================
// CV Modal Functions
// ===========================================
function initCVModal() {
    if (document.getElementById('cv-modal')) return;

    const modalHtml = `
    <div id="cv-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-title">CV</span>
                <button class="modal-close" onclick="closeCVModal()">&times;</button>
            </div>
            <div id="cv-modal-body" style="padding: 2.5rem; overflow-y: auto; flex-grow: 1;">
                <!-- Content -->
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openCVModal = async function (url) {
    // If no URL (disabled button case), do nothing
    if (!url || url.trim() === '') return;

    initCVModal(); // Ensure modal exists

    const modal = document.getElementById('cv-modal');
    const modalBody = document.getElementById('cv-modal-body');

    if (!modal || !modalBody) return;

    modal.style.display = 'flex';
    void modal.offsetWidth; // Force reflow
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Handle External Link (Should ideally be handled by onclick in HTML, but for safety)
    if (url.startsWith('http')) {
        window.open(url, '_blank');
        closeCVModal();
        return;
    }

    // Load Markdown
    modalBody.innerHTML = '<p>Loading...</p>';

    try {
        const html = await fetchAndRenderMarkdown(url);
        modalBody.innerHTML = html;
    } catch (error) {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem 0; color: var(--color-text-muted);">
                <p style="margin-bottom: 0.5rem;">Content not found.</p>
                <p>내용을 찾을 수 없습니다.</p>
            </div>
        `;
    }
};

window.closeCVModal = function () {
    const modal = document.getElementById('cv-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
};

// ===========================================
// 4. CSV 기반 출판물 동적 로딩 (CSV Loading)
// ===========================================
let currentPubFilter = 'All'; // 전역으로 필터 상태 관리

async function loadPublications(pageNum = 1, scrollToTop = false, filterCategory = currentPubFilter) {
    try {
        currentPubFilter = filterCategory; // 상태 업데이트
        const response = await fetch('data/publications.csv');
        const text = await response.text();
        const rows = parseCSV(text);

        const container = document.getElementById('publication-list');
        const filterContainer = document.getElementById('publication-filters');
        if (!container) return; // 현재 페이지에 해당 리스트가 없으면 종료

        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        const isKr = currentLang === 'kr';

        // 0. Render Filter Buttons
        if (filterContainer) {
            renderPublicationFilters(filterContainer, isKr);
        }

        // 1. Filter out empty rows & apply Category Filter, then sort descending by year
        let filteredData = rows.filter(r => r.year && r.year.trim() !== '');

        if (currentPubFilter !== 'All') {
            filteredData = filteredData.filter(r =>
                r.type && r.type.toLowerCase() === currentPubFilter.toLowerCase()
            );
        }

        filteredData.sort((a, b) => b.year - a.year);

        // 2. Pagination Logic
        if (filteredData.length === 0) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
                ${isKr ? '해당 분류에 등록된 논문이 없습니다.' : 'No publications found for this category.'}
            </p>`;
            return;
        }

        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (pageNum - 1) * ITEMS_PER_PAGE;
        const pagedRows = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

        // 3. Render HTML
        container.innerHTML = '';

        const topPag = document.createElement('div');
        renderPagination(topPag, totalPages, pageNum, (newPage) => loadPublications(newPage, true));
        container.appendChild(topPag);

        const contentArea = document.createElement('div');
        renderNormalPage(pagedRows, contentArea, isKr);
        container.appendChild(contentArea);

        const bottomPag = document.createElement('div');
        renderPagination(bottomPag, totalPages, pageNum, (newPage) => loadPublications(newPage, true));
        container.appendChild(bottomPag);

        // Scroll to top behavior
        if (scrollToTop) {
            try {
                // Find nearest section wrapping the list, or fallback to body
                let scrollTarget = container.closest('section') || document.body;

                // If the section is very close to top, just scroll to window top
                const rect = scrollTarget.getBoundingClientRect();
                const absoluteTop = rect.top + window.scrollY;

                if (absoluteTop < 150) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    // Subtract a bit so header doesn't cover the title
                    window.scrollTo({
                        top: absoluteTop - 80,
                        behavior: 'smooth'
                    });
                }
            } catch (e) {
                // Safe fallback
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

    } catch (error) {
        console.error('Error loading publications:', error);
        const container = document.getElementById('publication-list');
        if (container) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">Error loading data.</p>`;
        }
    }
}

function renderPublicationFilters(container, isKr) {
    const filters = [
        { id: 'All', labelKr: '전체', labelEn: 'All' },
        { id: 'Conference', labelKr: '학회', labelEn: 'Conference' },
        { id: 'Journal', labelKr: '저널', labelEn: 'Journal' }
    ];

    let html = '';
    filters.forEach(f => {
        const isActive = currentPubFilter === f.id ? 'active' : '';
        const label = isKr ? f.labelKr : f.labelEn;
        html += `<button class="pub-filter-btn ${isActive}" onclick="loadPublications(1, false, '${f.id}')">${label}</button>`;
    });

    container.innerHTML = html;
}

function renderNormalPage(rows, container, isKr) {
    if (rows.length === 0) {
        container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
            ${isKr ? '등록된 논문이 없습니다.' : 'No publications found.'}
        </p>`;
        return;
    }

    let html = '<div style="display: flex; flex-direction: column; gap: 1rem;">';
    rows.forEach(item => {
        html += createPublicationCard(item);
    });
    html += '</div>';

    container.innerHTML = html;
}



function createPublicationCard(item) {
    // 강조 저자 처리 (**K. Kim**)
    let authors = item.authors.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 링크 버튼 처리
    let linksHtml = '';
    if (item.link && item.link !== '#' && item.link.trim() !== '') {
        linksHtml += `<a href="${item.link}" class="icon-link" aria-label="PDF" target="_blank"><i class="ri-links-line"></i></a>`;
    }
    if (item.bibtex && item.bibtex.trim() !== '') {
        // BibTeX는 data 속성에 저장하고 클릭 시 읽어옴 (따옴표/줄바꿈 방지)
        const safeBibtex = item.bibtex.replace(/"/g, '&quot;');
        linksHtml += `<button class="icon-btn bibtex-copy-btn" data-bibtex="${safeBibtex}" onclick="copyBibtex(this)" aria-label="Copy BibTeX"><i class="ri-double-quotes-l"></i></button>`;
    }

    const defaultThumb = 'asset/default-thumb.png';
    const thumbSrc = item.thumbnail && item.thumbnail.trim() !== '' ? item.thumbnail : defaultThumb;

    return `
    <div class="publication-card">
        <div class="pub-card-layout">
            <div class="pub-img-wrapper">
                <img src="${thumbSrc}" onerror="this.onerror=null; this.src='${defaultThumb}';" alt="Thumbnail">
            </div>
            <div class="pub-content">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${item.title}</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 0.5rem; font-size: 0.95rem;">
                    ${authors}
                </p>
                <p style="color: var(--color-accent); font-weight: 500; font-size: 0.9rem;">
                    ${item.venue}, ${item.year} ${item.status ? `[${item.status}]` : ''}
                </p>
                <div class="pub-links" style="margin-top: 0.5rem;">
                    ${linksHtml}
                </div>
            </div>
        </div>
    </div>
    `;
}

function createSimpleListItem(item) {
    let authors = item.authors.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    let linksHtml = '';

    // Link icon
    if (item.link && item.link !== '#' && item.link.trim() !== '') {
        linksHtml += `<a href="${item.link}" class="icon-link" aria-label="Link" style="color: var(--color-text-muted); margin-left: 0.5rem; text-decoration: none;"><i class="ri-links-line"></i></a>`;
    }

    // BibTeX copy button
    if (item.bibtex && item.bibtex.trim() !== '') {
        const safeBibtex = item.bibtex.replace(/"/g, '&quot;');
        linksHtml += `<button class="icon-btn bibtex-copy-btn" data-bibtex="${safeBibtex}" onclick="copyBibtex(this)" aria-label="Copy BibTeX" style="margin-left: 0.5rem; font-size: 1rem;"><i class="ri-double-quotes-l"></i></button>`;
    }

    return `
    <li style="margin-bottom: 1.5rem;">
        ${authors}.
        <strong>${item.title}</strong>
        <em>${item.venue}</em>, ${item.year}.
        ${linksHtml}
    </li>
    `;
}

// 멀티라인 및 이스케이프 따옴표를 완벽히 지원하는 CSV 파서
function parseCSV(text) {
    const result = [];
    let row = [];
    let currentVal = '';
    let inQuotes = false;

    // 줄바꿈 정규화
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') { // 이스케이프된 따옴표 ("") 처리
                currentVal += '"';
                i++;
            } else {
                inQuotes = !inQuotes; // 열리고 닫히는 일반 따옴표
            }
        } else if (char === ',' && !inQuotes) {
            row.push(currentVal.trim());
            currentVal = '';
        } else if (char === '\n' && !inQuotes) {
            row.push(currentVal.trim());
            if (row.join('').trim() !== '') {
                result.push(row);
            }
            row = [];
            currentVal = '';
        } else {
            currentVal += char;
        }
    }

    row.push(currentVal.trim());
    if (row.join('').trim() !== '') {
        result.push(row);
    }

    if (result.length === 0) return [];

    const headers = result[0];
    const data = [];

    for (let i = 1; i < result.length; i++) {
        const rowData = {};
        for (let j = 0; j < headers.length; j++) {
            rowData[headers[j]] = result[i][j] || '';
        }
        data.push(rowData);
    }
    return data;
}

// BibTeX 복사 기능
function copyBibtex(btn) {
    const bibtex = btn.getAttribute('data-bibtex');
    navigator.clipboard.writeText(bibtex).then(() => {
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="ri-check-line"></i>';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 1500);
    }).catch(err => {
        console.error('Failed to copy BibTeX: ', err);
    });
}

// ===========================================
// 5. CSV 기반 멤버 동적 로딩 (Members Loading)
// ===========================================
// 전역 변수로 멤버 데이터 저장
let allMemberRows = [];

async function loadMembers(pageType) {
    try {
        const response = await fetch('./data/members.csv');
        const text = await response.text();
        allMemberRows = parseCSV(text); // 데이터 저장

        // 초기 렌더링
        renderMemberContent(pageType);

    } catch (error) {
        console.error('Error loading members:', error);
    }
}

function renderMemberContent(pageType) {
    const container = document.getElementById('member-list');
    if (!container) return;

    // 현재 언어 확인
    const currentLang = localStorage.getItem('preferred-lang') || 'kr';
    const isKr = currentLang === 'kr';

    if (allMemberRows.length === 0) {
        container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
            ${isKr ? '등록된 구성원이 없습니다.' : 'No members found.'}
        </p>`;
        return;
    }

    if (pageType === 'students') {
        renderStudentsPage(allMemberRows, container, isKr);
    } else if (pageType === 'alumni') {
        renderAlumniPage(allMemberRows, container, isKr);
    } else if (pageType === 'supporters') {
        renderSupportersPage(allMemberRows, container, isKr);
    }

    // 결과가 비어있는지 확인 (필터링 후 아무것도 없는 경우)
    if (container.innerHTML.trim() === '') {
        container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
            ${isKr ? '해당하는 구성원이 없습니다.' : 'No members found for this category.'}
        </p>`;
    }
}

function renderStudentsPage(rows, container, isKr) {
    const postDocs = rows.filter(r => r.Type === 'Post-Doc');
    const phds = rows.filter(r => r.Type === 'Ph.D.');
    const masters = rows.filter(r => r.Type === 'M.S.');
    const undergrads = rows.filter(r => r.Type === 'Undergraduate');
    const interns = rows.filter(r => r.Type === 'Intern');
    const externals = rows.filter(r => r.Type === 'External Researcher');

    let html = '';

    if (postDocs.length > 0) html += createMemberSection(isKr ? '박사 후과정' : 'Post-Doc', postDocs, isKr, 'grid');
    if (phds.length > 0) html += createMemberSection(isKr ? '박사 과정' : 'Ph.D. Students', phds, isKr, 'grid');
    if (masters.length > 0) html += createMemberSection(isKr ? '석사 과정' : "Master's Students", masters, isKr, 'grid');
    if (undergrads.length > 0) html += createMemberSection(isKr ? '학부 연구생' : 'Undergraduate Students', undergrads, isKr, 'grid');
    if (interns.length > 0) html += createMemberSection(isKr ? '연구 인턴' : 'Research Interns', interns, isKr, 'grid');
    if (externals.length > 0) html += createMemberSection(isKr ? '외부 연구원' : 'External Researchers', externals, isKr, 'grid');

    container.innerHTML = html;
}

function renderAlumniPage(rows, container, isKr) {
    const phdAlumni = rows.filter(r => r.Type === 'Alumni-Ph.D.');
    const msAlumni = rows.filter(r => r.Type === 'Alumni-M.S.');
    const underAlumni = rows.filter(r => r.Type === 'Alumni-Undergraduate');
    const internAlumni = rows.filter(r => r.Type === 'Alumni-Intern');

    let html = '';

    if (phdAlumni.length > 0) html += createMemberSection(isKr ? '졸업생 (박사)' : 'Alumni (Ph.D.)', phdAlumni, isKr, 'grid cols-4', true);
    if (msAlumni.length > 0) html += createMemberSection(isKr ? '졸업생 (석사)' : 'Alumni (M.S.)', msAlumni, isKr, 'grid cols-4', true);
    if (underAlumni.length > 0) html += createMemberSection(isKr ? '졸업생 (학부)' : 'Alumni (Undergraduate)', underAlumni, isKr, 'grid cols-4', true);
    if (internAlumni.length > 0) html += createMemberSection(isKr ? '수료생 (연구 인턴)' : 'Alumni (Research Interns)', internAlumni, isKr, 'grid cols-4', true);

    container.innerHTML = html;
}

function renderSupportersPage(rows, container, isKr) {
    const supporters = rows.filter(r => r.Type === 'Supporter');
    let html = '';
    if (supporters.length > 0) {
        // Supporters도 Students처럼 Ghost-Grid(grid) 적용
        html += createMemberGrid(supporters, isKr, 'grid', false);
    }
    container.innerHTML = html;
}

function createMemberSection(title, members, isKr, gridClass, isAlumni = false) {
    return `
        <h3 style="margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem;">
            ${title}
        </h3>
        ${createMemberGrid(members, isKr, gridClass, isAlumni)}
    `;
}

function createMemberGrid(members, isKr, gridClass, isAlumni) {
    const gridHtml = members.map(member => createMemberCard(member, isKr, isAlumni)).join('');
    return `<div class="${gridClass}">${gridHtml}</div>`;
}

function createMemberCard(member, isKr, isAlumni) {
    const name = isKr && member.name_kr ? member.name_kr : member.name_en;

    // 1. Image Handling
    const unknownImage = 'data/members/unknown.png';
    let imageSrc = member.image && member.image.trim() !== '' ? member.image : unknownImage;

    // Fallback for image loading error (handled via onerror attribute)
    let imageHtml = '';
    if (!isAlumni) {
        imageHtml = `<img src="${imageSrc}" alt="${name}" 
            onerror="this.onerror=null; this.src='${unknownImage}';"
            style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; background: #cbd5e1; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">`;
    }

    // 2. Link Grouping
    const socialMap = [
        { key: 'website', icon: 'fas fa-home' },
        { key: 'github', icon: 'fab fa-github' },
        { key: 'linkedin', icon: 'fab fa-linkedin' },
        { key: 'instagram', icon: 'fab fa-instagram' },
        { key: 'facebook', icon: 'fab fa-facebook' },
        { key: 'thread', icon: 'fab fa-threads' }
    ];

    const academicMap = [
        { key: 'google scholar', icon: 'fas fa-graduation-cap', label: 'Google Scholar' },
        { key: 'dblp', icon: 'fas fa-book', label: 'DBLP' },
        { key: 'orcid', icon: 'fab fa-orcid', label: 'ORCID' }
    ];

    // Helper to generate social icon links (Icon only)
    function generateSocialLinks(map) {
        return map.filter(l => member[l.key]).map(l => {
            const url = member[l.key].startsWith('http') ? member[l.key] : `https://${member[l.key]}`;
            return `<a href="${url}" target="_blank" style="color: var(--color-text-muted); font-size: 1.1rem; transition: color 0.2s;" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text-muted)'"><i class="${l.icon}"></i></a>`;
        }).join('');
    }

    // Helper to generate academic links (Icon + Text, Pill style)
    function generateAcademicLinks(map) {
        return map.filter(l => member[l.key]).map(l => {
            const url = member[l.key].startsWith('http') ? member[l.key] : `https://${member[l.key]}`;
            return `<a href="${url}" target="_blank" class="academic-link-item"><i class="${l.icon}"></i> ${l.label}</a>`;
        }).join('');
    }

    const socialHtml = generateSocialLinks(socialMap);
    const academicHtml = generateAcademicLinks(academicMap);

    // 3. Email Handling
    let emailHtml = '';
    if (member.email) {
        let emailLink = member.email.startsWith('mailto:') ? member.email : `mailto:${member.email}`;
        emailHtml = `
            <a href="${emailLink}" style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 0.5rem; text-decoration: none;" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text-muted)'">
                <i class="fas fa-envelope"></i> <span>${member.email}</span>
            </a>
        `;
    }

    // Combine Links (Email -> Social -> Academic)
    let linksSection = '';

    // For Alumni, keep it simple (Icon only for academic links too? Or text? User said "like professor", usually means Text)
    // But Alumni cards are smaller. Let's use simpler icons for Alumni to fit 4 per row, unless user asks otherwise.
    // User said "Students' academic links should be like Professor". Implicitly Alumni might stay simple?
    // Let's apply the text style to Students/Supporters only for now as they have more space.

    if (isAlumni) {
        // Re-generate academic links as icons for Alumni to save space (Grid 4)
        const academicHtmlAlumni = academicMap.filter(l => member[l.key]).map(l => {
            const url = member[l.key].startsWith('http') ? member[l.key] : `https://${member[l.key]}`;
            return `<a href="${url}" target="_blank" style="color: var(--color-text-muted); font-size: 1.1rem; transition: color 0.2s;" onmouseover="this.style.color='var(--color-accent)'" onmouseout="this.style.color='var(--color-text-muted)'"><i class="${l.icon}"></i></a>`;
        }).join('');

        linksSection = `
            <div style="display: flex; gap: 0.8rem; justify-content: center; margin-top: auto; padding-top: 1rem;">
                ${member.email ? `<a href="mailto:${member.email}" style="color: var(--color-text-muted);"><i class="fas fa-envelope"></i></a>` : ''}
                ${socialHtml}
                ${academicHtmlAlumni}
            </div>
        `;

        return `
        <div class="card" style="text-align: center; padding: 1.5rem;">
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${name} <span style="font-weight: normal; font-size: 0.9rem;">(${member.year})</span></h3>
            <p style="color: var(--color-accent); font-weight: 500; font-size: 0.95rem; margin-bottom: 0.5rem;">${member.current || ''}</p>
            ${linksSection}
            ${(function () {
                const cvLink = member.cv ? member.cv.trim() : '';
                let onClick = '';
                let additionalClass = '';

                if (!cvLink) {
                    additionalClass = ' disabled';
                } else if (cvLink.startsWith('http')) {
                    onClick = `onclick="window.open('${cvLink}', '_blank'); return false;"`;
                } else {
                    onClick = `onclick="openCVModal('${cvLink}')"`;
                }

                return `<a href="#" ${onClick} class="cv-btn${additionalClass}" style="margin-top: 0.5rem; padding: 0.3rem 1rem; font-size: 0.85rem;">CV</a>`;
            })()}
        </div>
        `;
    } else {
        // For Students/Supporters: Use Text style for Academic Links
        // We need inline CSS for the pill style or reuse .academic-links from CSS
        // style.css already has .academic-links a { ... pill style ... }
        // We should wrap it in <div class="academic-links">

        return `
        <div class="card" style="text-align: center; padding: 2rem 1.5rem; display: flex; flex-direction: column; align-items: center; height: 100%;">
            ${imageHtml}
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${name}</h3>
            
            <p style="color: var(--color-accent); font-weight: 600; font-size: 0.95rem; margin-bottom: ${member.intro_en ? '0.75rem' : '1.5rem'};">
                ${isKr && member.interest_kr ? member.interest_kr : member.interest_en || ''}
            </p>
            
            <p style="color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.5rem; flex-grow: 1;">
                ${(isKr && member.intro_kr ? member.intro_kr : member.intro_en || '').replace(/\\n|\n/g, '<br>')}
            </p>

            <div style="width: 100%; border-top: 1px solid #e2e8f0; padding-top: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                ${emailHtml}
                
                ${socialHtml ? `<div class="social-links justify-center" style="margin-bottom: ${academicHtml ? '0.5rem' : '0'};">${socialHtml}</div>` : ''}
                
                ${academicHtml ? `<div class="academic-links justify-center" style="gap: 0.5rem; flex-wrap: wrap;">${academicHtml}</div>` : ''}

                ${/* CV Button Logic */''}
                ${(function () {

                const cvLink = member.cv ? member.cv.trim() : '';
                let onClick = '';
                let additionalClass = '';

                if (!cvLink) {
                    additionalClass = ' disabled';
                } else if (cvLink.startsWith('http')) {
                    // External link -> Open in new tab directly
                    onClick = `onclick="window.open('${cvLink}', '_blank'); return false;"`;
                } else {
                    // Internal md -> Open Modal
                    onClick = `onclick="openCVModal('${cvLink}')"`;
                }

                return `<a href="#" ${onClick} class="cv-btn${additionalClass}">CV</a>`;
            })()}
            </div>
        </div>
        `;
    }
}

/* 
  script.js - 웹사이트의 동작을 담당하는 스크립트 파일입니다.
  주로 언어 변경(한국어/영어) 기능과 스크롤 애니메이션을 처리합니다.
*/

// ===========================================
// CONFIGURATION
// ===========================================
// 여기서 "Former" (이전 논문)와 "Current" (최신 논문)을 나누는 기준 연도를 설정하세요.
// 예: 2020으로 설정하면, 2020년 포함 이후는 최신, 2019년 이전은 Former로 분류됩니다.
const RECENT_THRESHOLD_YEAR = 2020;

// [News] 최신 소식 페이지에 표시할 뉴스 개수 (0 = 제한 없음)
const LATEST_NEWS_COUNT = 20;


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
            else if (['conference', 'journal', 'former'].includes(pageType)) {
                loadPublications(pageType);
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
        // [출판물 페이지] Conference, Journal, Former
        if (['conference', 'journal', 'former'].includes(pageType)) {
            loadPublications(pageType);
        }
        // [구성원 페이지] Professor(없음), Students, Alumni, Supporters
        else if (['students', 'alumni', 'supporters'].includes(pageType)) {
            loadMembers(pageType);
        }
        // [소식 페이지] Latest, Research, Other
        else if (['news-latest', 'news-research', 'news-other'].includes(pageType)) {
            loadNews(pageType);
        }
        // [메인 페이지] Home (Recent News 4 items)
        else if (pageType === 'home') {
            loadNews('home');
        }
    }
});

// ===========================================
// News Loading
// ===========================================
// ===========================================
// News Loading & Modal
// ===========================================
async function loadNews(pageType) {
    try {
        const response = await fetch('data/news.csv');
        const text = await response.text();
        const rows = parseCSV(text);

        const container = document.getElementById('news-list');
        // For 'home' page, we use 'recent-news-list', so 'news-list' might be null.
        if (!container && pageType !== 'home') return;

        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        const isKr = currentLang === 'kr';

        // Filter based on pageType
        let filteredRows = [];
        let targetContainer = container;

        if (pageType === 'news-latest') {
            // Latest shows all news items regardless of type
            filteredRows = rows;
        } else if (pageType === 'news-research') {
            filteredRows = rows.filter(r => r.type && r.type.toLowerCase() === 'research');
        } else if (pageType === 'news-other') {
            filteredRows = rows.filter(r => r.type && r.type.toLowerCase() === 'other');
        } else if (pageType === 'home') {
            // Home page: Show all news, but limited to 4 items
            // But we need to target a different container
            targetContainer = document.getElementById('recent-news-list');
            if (!targetContainer) return; // Should not happen if HTML is correct
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

        // Sort by date descending (assuming format YYYY.MM.DD)
        filteredRows.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Limit the number of items for 'news-latest' if LATEST_NEWS_COUNT is set
        if (pageType === 'news-latest' && typeof LATEST_NEWS_COUNT !== 'undefined' && LATEST_NEWS_COUNT > 0) {
            filteredRows = filteredRows.slice(0, LATEST_NEWS_COUNT);
        }

        if (pageType === 'home') {
            filteredRows = filteredRows.slice(0, 3);
            renderNewsPage(filteredRows, targetContainer, isKr, false); // No wrapper for home (Grid)
        } else {
            renderNewsPage(filteredRows, targetContainer, isKr, true); // Use wrapper for others (Flex Column)
        }

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

        let clickAction = '';
        let cursorStyle = '';
        // Always enable pointer and click, passing empty string if no link
        clickAction = `onclick="openNewsModal('${item.link && item.link !== '#' ? item.link : ''}')"`;
        cursorStyle = 'cursor: pointer;';

        html += `
        <div class="publication-card" ${clickAction} style="${cursorStyle}">
            <div class="pub-content">
                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${title}</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 0.5rem; font-size: 0.95rem;">
                    ${summary}
                </p>
                <p style="color: var(--color-accent); font-weight: 500; font-size: 0.9rem;">
                    ${item.date}
                </p>
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
window.openNewsModal = async function (url) {
    const modal = document.getElementById('news-modal');
    const modalBody = document.getElementById('news-modal-body');
    if (!modal || !modalBody) return;

    // Correct order for opening: display flex -> reflow -> active class
    modal.style.display = 'flex';
    // Force reflow
    void modal.offsetWidth;
    modal.classList.add('active');

    // Disable body scroll
    document.body.style.overflow = 'hidden';

    // Handle empty URL (No attached content)
    if (!url || url.trim() === '') {
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem 0; color: var(--color-text-muted);">
                <p style="margin-bottom: 0.5rem; font-weight: 500; font-size: 1.1rem;">No detailed content.</p>
                <p>상세 내용이 없습니다.</p>
            </div>
        `;
        return;
    }

    // Show loading state for actual fetches

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load content');
        const text = await response.text();

        // Language parsing
        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        let contentToRender = '';

        // Split by markers <!-- KR --> and <!-- EN -->
        const krMarker = '<!-- KR -->';
        const enMarker = '<!-- EN -->';

        const krStart = text.indexOf(krMarker);
        const enStart = text.indexOf(enMarker);

        if (krStart !== -1 && enStart !== -1) {
            if (currentLang === 'kr') {
                // Get content between KR and EN (or end)
                let end = enStart > krStart ? enStart : text.length;
                // Careful if EN comes before KR, but usually KR first. 
                // Let's handle generic case:

                // Simple parsing: split by markers
                // Assuming standard format: <!-- KR --> content <!-- EN --> content
                const parts = text.split(enMarker);
                const krPart = parts[0].replace(krMarker, '');
                const enPart = parts[1] || '';

                contentToRender = currentLang === 'kr' ? krPart : enPart;

            } else {
                const parts = text.split(enMarker);
                contentToRender = parts[1] || parts[0]; // Fallback if no EN?
            }
        } else {
            // No markers found, just render whole text
            contentToRender = text;
        }

        // Render Markdown
        modalBody.innerHTML = marked.parse(contentToRender);

    } catch (error) {
        console.error('Error fetching markdown:', error);
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 2rem 0; color: var(--color-text-muted);">
                <p style="margin-bottom: 0.5rem;">Content not found.</p>
                <p>내용을 찾을 수 없습니다.</p>
            </div>
        `;
        console.log("Failed to load news content. Please check if the markdown file exists.");
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
    const modal = document.getElementById('news-modal');
    if (e.target === modal) {
        closeNewsModal();
    }
});

// ===========================================
// 4. CSV 기반 출판물 동적 로딩 (CSV Loading)
// ===========================================
// CSV 파싱 함수 (공통 사용)
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    // 정규식을 사용하여 CSV 파싱 (따옴표 안에 있는 쉼표 처리)
    // 예: "Kim, Kisub", "Title" -> 쉼표로 분리되지 않도록
    const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g;
    // 간단한 구현: 쉼표로 나누되, 따옴표 안의 쉼표는 무시
    // 하지만 복잡한 CSV는 라이브러리 사용하는 게 좋음. 
    // 여기서는 간단히 커스텀 파서 구현

    for (let i = 1; i < lines.length; i++) {
        // 빈 줄 무시
        if (lines[i].trim() === '') continue;

        const row = {};
        let currentLine = lines[i];
        let values = [];
        let inQuote = false;
        let currentValue = '';

        for (let j = 0; j < currentLine.length; j++) {
            const char = currentLine[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim()); // 마지막 값

        // 따옴표 제거 및 데이터 매핑
        values = values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        result.push(row);
    }
    return result;
}

async function loadPublications(pageType) {
    try {
        const response = await fetch('data/publications.csv');
        const text = await response.text();
        const rows = parseCSV(text);

        const container = document.getElementById('publication-list');
        if (!container) return; // Should not happen

        // 현재 언어 확인 (제목/내용에 언어별 분기가 필요하다면 사용)
        // 출판물은 보통 영어 원문 위주이므로 그대로 출력하지만, 
        // 필요 시 rows를 가공하거나 UI 텍스트(년도 등)를 한글로 바꿀 수 있음.
        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        const isKr = currentLang === 'kr';

        // 1. Filter by Type
        let filteredRows = [];
        if (pageType === 'conference') {
            filteredRows = rows.filter(r => r.type === 'Conference' && r.year >= RECENT_THRESHOLD_YEAR);
        } else if (pageType === 'journal') {
            filteredRows = rows.filter(r => r.type === 'Journal' && r.year >= RECENT_THRESHOLD_YEAR);
        } else if (pageType === 'former') {
            // Former는 Conference/Journal 구분 없이 예전 것 모두? 
            // 아니면 탭이 따로? 보통 Former Publications는 모든 타입의 예전 논문.
            filteredRows = rows.filter(r => r.year < RECENT_THRESHOLD_YEAR);
        }

        if (filteredRows.length === 0) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
                ${isKr ? '등록된 논문이 없습니다.' : 'No publications found.'}
            </p>`;
            return;
        }

        // 2. Sort by Year (Descending)
        // filteredRows.sort((a, b) => b.year - a.year); // 단순 연도 비교
        // 같은 연도 내에서도 최신순 정렬이 필요하다면 추가 로직 필요 (현재 데이터는 연도만 있음)
        // CSV 순서를 믿거나, 연도 역순 정렬.
        filteredRows.sort((a, b) => {
            // 연도가 [Just Accepted] 같은 텍스트를 포함할 수 있으므로 숫자만 추출해서 비교
            const yearA = parseInt(a.year.toString().match(/\d+/)[0]);
            const yearB = parseInt(b.year.toString().match(/\d+/)[0]);
            return yearB - yearA;
        });


        // 3. Render
        let html = '';
        filteredRows.forEach(item => {
            // 강조 처리 (저자명에서 K. Kim, Kisub Kim 등 볼드 처리) - HTML 태그가 CSV에 포함되어 있다고 가정, 아니면 여기서 처리
            // 예: "K. Kim**" -> "<b>K. Kim</b>" (이미 CSV에 별표 등으로 표시되어 있다면 변환)
            // 여기서는 CSV 데이터가 clean하다고 가정하고, ** 표시를 <b>로 변환하는 간단한 포매터 적용
            const authors = item.authors.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/K\. Kim/g, '<b>K. Kim</b>')
                .replace(/Kisub Kim/g, '<b>Kisub Kim</b>');

            // 링크들 처리
            let linksHtml = '';
            if (item.link && item.link.trim() !== '' && item.link !== '#') {
                linksHtml += `<a href="${item.link}" target="_blank" class="text-link">[Paper]</a>`;
            }
            if (item.code && item.code.trim() !== '') {
                linksHtml += ` <a href="${item.code}" target="_blank" class="text-link">[Code]</a>`;
            }
            if (item.bibtex && item.bibtex.trim() !== '') {
                // BibTeX 모달이나 토글 기능이 필요할 수 있음. 지금은 간단히 표시 안 하거나, 별도 구현.
                // 일단은 생략하거나, 필요한 경우 추가.
            }

            // Status Badge (Just Accepted, Under Review etc.)
            let statusBadge = '';
            if (item.status && item.status.trim() !== '') {
                // 스타일링을 위해 클래스 추가 가능
                statusBadge = `<span class="status-badge">${item.status}</span>`;
            }

            // Venue formatting
            // const venue = `<i>${item.venue}</i>`;

            html += `
            <div class="publication-card">
                <div class="pub-year">${item.year}</div>
                <div class="pub-content">
                    <h3>${item.title} ${statusBadge}</h3>
                    <p class="authors">${authors}</p>
                    <p class="venue"><i>${item.venue}</i></p>
                    <div class="links">
                        ${linksHtml}
                    </div>
                </div>
            </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading publications:', error);
    }
}

// ===========================================
// 5. CSV 기반 멤버 동적 로딩 (Members Loading)
// ===========================================
// 전역 변수로 멤버 데이터 저장
let allMemberRows = [];

async function loadMembers(pageType) {
    try {
        const response = await fetch('data/members.csv');
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

    let html = '';

    if (postDocs.length > 0) html += createMemberSection(isKr ? '박사 후과정' : 'Post-Doc', postDocs, isKr, 'grid');
    if (phds.length > 0) html += createMemberSection(isKr ? '박사 과정' : 'Ph.D. Students', phds, isKr, 'grid');
    if (masters.length > 0) html += createMemberSection(isKr ? '석사 과정' : "Master's Students", masters, isKr, 'grid');
    if (undergrads.length > 0) html += createMemberSection(isKr ? '학부 연구생' : 'Undergraduate Students', undergrads, isKr, 'grid');
    if (interns.length > 0) html += createMemberSection(isKr ? '연구 인턴' : 'Research Interns', interns, isKr, 'grid');

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
        </div>
        `;
    } else {
        // Students & Supporters
        linksSection = `
            <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid #f1f5f9; width: 100%;">
                ${emailHtml}
                <div style="display: flex; gap: 0.8rem; margin-bottom: 0.8rem;">
                    ${socialHtml}
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${academicHtml}
                </div>
            </div>
        `;

        return `
        <div class="card">
            ${imageHtml}
            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
                <h3 style="font-size: 1.25rem; margin-bottom: 0.2rem;">${name}</h3>
                <p style="color: var(--color-accent); font-weight: 500; margin-bottom: 0.5rem;">${member.role_en || ''}</p>
                <p style="font-size: 0.95rem; color: #475569; margin-bottom: 1rem; line-height: 1.5;">${isKr && member.intro_kr ? member.intro_kr : member.intro_en}</p>
                
                ${linksSection}
            </div>
        </div>
        `;
    }
}

/* 
  script.js - 웹사이트의 동작을 담당하는 스크립트 파일입니다.
  주로 언어 변경(한국어/영어) 기능과 스크롤 애니메이션을 처리합니다.
*/


// ===========================================
// 0. 헤더/푸터 동적 로딩 (Dynamic Loading)
// ===========================================
async function loadComponents() {
    console.log('loadComponents started'); // Debug
    try {
        // 헤더 로드
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            console.log('Fetching header...'); // Debug
            const response = await fetch('components/header.html');
            const text = await response.text();
            headerPlaceholder.innerHTML = text;
        }

        // 푸터 로드
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            const response = await fetch('components/footer.html');
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

    // 페이지별 출판물 로드 (data-page-type 속성 확인)
    const pageType = document.body.getAttribute('data-page-type');
    if (pageType) {
        if (['conference', 'journal', 'former'].includes(pageType)) {
            loadPublications(pageType);
        } else if (['students', 'alumni', 'supporters'].includes(pageType)) {
            loadMembers(pageType);
        }
    }
});

// ===========================================
// 4. CSV 기반 출판물 동적 로딩 (CSV Loading)
// ===========================================
// ... (loadPublications and helpers remain unchanged) ...

// ===========================================
// 5. CSV 기반 멤버 동적 로딩 (Members Loading)
// ===========================================
async function loadMembers(pageType) {
    try {
        const response = await fetch('data/members.csv');
        const text = await response.text();
        const rows = parseCSV(text);

        const container = document.getElementById('member-list');
        if (!container) return;

        // 현재 언어 확인
        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        const isKr = currentLang === 'kr';

        if (pageType === 'students') {
            renderStudentsPage(rows, container, isKr);
        } else if (pageType === 'alumni') {
            renderAlumniPage(rows, container, isKr);
        } else if (pageType === 'supporters') {
            renderSupportersPage(rows, container, isKr);
        }
    } catch (error) {
        console.error('Error loading members:', error);
    }
}

function renderStudentsPage(rows, container, isKr) {
    const postDocs = rows.filter(r => r.Type === 'Post-Doc');
    const phds = rows.filter(r => r.Type === 'Ph.D.');
    const masters = rows.filter(r => r.Type === 'M.S.');
    const undergrads = rows.filter(r => r.Type === 'Undergraduate');

    let html = '';

    if (postDocs.length > 0) html += createMemberSection(isKr ? '박사 후과정' : 'Post-Doc', postDocs, isKr, 'grid-3');
    if (phds.length > 0) html += createMemberSection(isKr ? '박사 과정' : 'Ph.D. Students', phds, isKr, 'grid-3');
    if (masters.length > 0) html += createMemberSection(isKr ? '석사 과정' : "Master's Students", masters, isKr, 'grid-3');
    if (undergrads.length > 0) html += createMemberSection(isKr ? '학부 연구생' : 'Undergraduate Interns', undergrads, isKr, 'grid-3');

    container.innerHTML = html;
}

function renderAlumniPage(rows, container, isKr) {
    const phdAlumni = rows.filter(r => r.Type === 'Alumni-Ph.D.');
    const msAlumni = rows.filter(r => r.Type === 'Alumni-M.S.');
    const underAlumni = rows.filter(r => r.Type === 'Alumni-Undergraduate');

    let html = '';

    if (phdAlumni.length > 0) html += createMemberSection('Ph.D.', phdAlumni, isKr, 'grid-4', true);
    if (msAlumni.length > 0) html += createMemberSection('M.S.', msAlumni, isKr, 'grid-4', true);
    if (underAlumni.length > 0) html += createMemberSection('B.S.', underAlumni, isKr, 'grid-4', true);

    container.innerHTML = html;
}

function renderSupportersPage(rows, container, isKr) {
    const supporters = rows.filter(r => r.Type === 'Supporter');
    let html = '';
    if (supporters.length > 0) {
        // Supporters use grid-3 similar to students
        html += createMemberGrid(supporters, isKr, 'grid-3', false);
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

    // Links
    let linksHtml = '';
    const linkMap = [
        { key: 'email', icon: 'fas fa-envelope' },
        { key: 'website', icon: 'fas fa-home' },
        { key: 'github', icon: 'fab fa-github' },
        { key: 'linkedin', icon: 'fab fa-linkedin' },
        { key: 'instagram', icon: 'fab fa-instagram' },
        { key: 'facebook', icon: 'fab fa-facebook' },
        { key: 'thread', icon: 'fab fa-threads' },
        { key: 'google scholar', icon: 'fas fa-graduation-cap' },
        { key: 'dblp', icon: 'fas fa-book' },
        { key: 'orcid', icon: 'fab fa-orcid' }
    ];

    // Social & Academic Links merged for simplicity or separated if needed
    // User asked for "Links" at the bottom.
    let activeLinks = [];
    linkMap.forEach(l => {
        if (member[l.key]) {
            let label = ''; // No text label for most, just icon
            activeLinks.push(`<a href="${member[l.key].startsWith('http') || l.key === 'email' ? '' : 'https://'}${l.key === 'email' ? 'mailto:' : ''}${member[l.key]}" target="_blank" style="color: var(--color-text-muted); font-size: 1.1rem;"><i class="${l.icon}"></i></a>`);
        }
    });

    const linksContainer = activeLinks.length > 0 ? `<div style="display: flex; gap: 0.8rem; justify-content: center; margin-top: auto; padding-top: 1rem;">${activeLinks.join('')}</div>` : '';


    if (isAlumni) {
        // Alumni Layout: Name (Year), Current (Orange), Links. Max 4 per row.
        return `
        <div class="card" style="text-align: center; padding: 1.5rem;">
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${name} <span style="font-weight: normal; font-size: 0.9rem;">(${member.year})</span></h3>
            <p style="color: var(--color-accent); font-weight: 500; font-size: 0.95rem; margin-bottom: 0.5rem;">${member.current || ''}</p>
            ${linksContainer}
        </div>
        `;
    } else {
        // Student Layout: Image, Name, Interest (Orange), Intro, Links. Max 3 per row.
        // Image handling
        let imageHtml = '';
        if (member.image && member.image.trim() !== '') {
            imageHtml = `<img src="${member.image}" alt="${name}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem; background: #cbd5e1;">`;
        } else {
            imageHtml = `<div style="width: 120px; height: 120px; background: #cbd5e1; border-radius: 50%; margin-bottom: 1rem; display: inline-block;"></div>`;
        }

        const interest = isKr && member.interest_kr ? member.interest_kr : member.interest_en;
        const intro = isKr && member.intro_kr ? member.intro_kr : member.intro_en;

        return `
        <div class="card" style="text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center; height: 100%;">
            ${imageHtml}
            <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${name}</h3>
            <p style="color: var(--color-accent); font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">${interest || ''}</p>
            <p style="color: var(--color-text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; flex-grow: 1;">
                ${intro || ''}
            </p>
            ${linksContainer}
        </div>
        `;
    }
}

// ===========================================
// 4. CSV 기반 출판물 동적 로딩 (CSV Loading)
// ===========================================
async function loadPublications(pageType) {
    try {
        const response = await fetch('data/publications.csv');
        const text = await response.text();
        const rows = parseCSV(text);

        const container = document.getElementById('publication-list');
        if (!container) return;

        // 데이터 필터링
        let filteredData = [];
        const currentYear = new Date().getFullYear();

        if (pageType === 'conference') {
            filteredData = rows.filter(row => row.type === 'Conference' && parseInt(row.year) >= 2020);
        } else if (pageType === 'journal') {
            filteredData = rows.filter(row => row.type === 'Journal' && parseInt(row.year) >= 2020);
        } else if (pageType === 'former') {
            filteredData = rows.filter(row => parseInt(row.year) <= 2019);
        }

        // 연도별 그룹화
        const groupedByYear = {};
        filteredData.forEach(item => {
            if (!groupedByYear[item.year]) groupedByYear[item.year] = [];
            groupedByYear[item.year].push(item);
        });

        // 연도 내림차순 정렬
        const years = Object.keys(groupedByYear).sort((a, b) => b - a);

        let html = '';
        years.forEach(year => {
            // 연도 헤더 (Former 페이지는 디자인이 다를 수 있음)
            if (pageType === 'former') {
                // Former 페이지는 연도별 헤더 없이 리스트로 나열하거나, 
                // 기존 디자인에 맞춰 연도 헤더를 추가할 수 있습니다.
                // 여기서는 기존 'Conference (~2019)' 헤더 아래 연도별로 묶지 않고 플랫하게 보여주기도 하지만,
                // 데이터가 많으므로 연도별로 보여주는 것이 좋습니다.
                // 다만 사용자의 요청에 따라 'Conference'와 'Journal' 섹션이 분리되어 있었습니다.
                // Former 페이지는 별도 처리가 필요할 수 있습니다.
            } else {
                // html += `<h2 style="border-bottom: 2px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1.5rem; margin-top: 3rem;">${year}</h2>`;
            }
        });

        // Former 페이지의 경우 Conference/Journal 섹션 분리가 필요합니다.
        if (pageType === 'former') {
            renderFormerPage(filteredData, container);
        } else {
            renderNormalPage(years, groupedByYear, container);
        }

    } catch (error) {
        console.error('Error loading publications:', error);
    }
}

function renderNormalPage(years, groupedByYear, container) {
    let html = '';
    years.forEach(year => {
        // 연도 헤더?? 필요없으면 제거 가능, 하지만 보통 연도별 구분이 깔끔함.
        // 사용자의 기존 디자인에는 연도 헤더가 없었고 2025, 2024 주석만 있었음.
        // 하지만 자동화된 리스트는 연도 헤더가 있는 게 보기 좋습니다.
        // 우선 기존 디자인처럼 카드만 나열하되, 최신순이므로 자연스럽게 정렬됩니다.

        groupedByYear[year].forEach(item => {
            html += createPublicationCard(item);
        });
    });
    container.innerHTML = `<div style="display: flex; flex-direction: column; gap: 1rem;">${html}</div>`;
}

function renderFormerPage(data, container) {
    // Conference (~2019)와 Journal (~2019) 분리 필요
    const confData = data.filter(row => row.type === 'Conference').sort((a, b) => b.year - a.year);
    const jourData = data.filter(row => row.type === 'Journal').sort((a, b) => b.year - a.year);

    let html = '';

    // Conference Section
    html += `
        <div style="margin-bottom: 4rem;">
            <h2 style="border-bottom: 2px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
                Conference (~2019)
            </h2>
            <ul class="simple-list" style="list-style: none; padding: 0;">
                ${confData.map(item => createSimpleListItem(item)).join('')}
            </ul>
        </div>
    `;

    // Journal Section
    html += `
        <div style="margin-bottom: 3rem;">
            <h2 style="border-bottom: 2px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
                Journal (~2019)
            </h2>
            <ul class="simple-list" style="list-style: none; padding: 0;">
                ${jourData.map(item => createSimpleListItem(item)).join('')}
            </ul>
        </div>
    `;

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
        // BibTeX는 아이콘 클릭 시 복사
        // safeBibtex: 따옴표 escape
        const safeBibtex = item.bibtex.replace(/"/g, '&quot;');
        linksHtml += `<button class="icon-btn" onclick="copyBibtex(this, '${safeBibtex}')" aria-label="Copy BibTeX"><i class="ri-double-quotes-l"></i></button>`;
    }

    return `
    <div class="card" style="padding: 1.5rem; flex-direction: row; align-items: flex-start; gap: 1rem;">
        <div style="flex: 1;">
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${item.title}</h3>
            <p style="color: var(--color-text-muted); margin-bottom: 0.5rem; font-size: 0.95rem;">
                ${authors}
            </p>
            <p style="color: var(--color-accent); font-weight: 500; font-size: 0.9rem;">
                ${item.venue}, ${item.year} ${item.status ? `[${item.status}]` : ''}
            </p>
        </div>
        ${linksHtml}
    </div>
    `;
}

function createSimpleListItem(item) {
    let authors = item.authors.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    let linksHtml = '';
    if (item.link && item.link !== '#' && item.link.trim() !== '') {
        linksHtml += `<a href="${item.link}" class="icon-link" aria-label="Link" style="color: var(--color-text-muted); margin-left: 0.5rem; text-decoration: none;"><i class="ri-links-line"></i></a>`;
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

// 간단한 CSV 파서 (따옴표 처리 포함)
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const row = {};
        const values = [];
        let currentVal = '';
        let inQuotes = false;

        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentVal.trim());
                currentVal = '';
            } else {
                currentVal += char;
            }
        }
        values.push(currentVal.trim());

        headers.forEach((header, index) => {
            // 따옴표 제거
            let val = values[index] || '';
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.substring(1, val.length - 1);
            }
            row[header] = val;
        });
        result.push(row);
    }
    return result;
}

// BibTeX 복사 기능
window.copyBibtex = function (btn, text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("BibTeX Copied!");
    });
};

function showToast(message) {
    // Toast 요소가 없으면 생성
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.className = "toast show";
    setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
}

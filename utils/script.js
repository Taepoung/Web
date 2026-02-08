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

        // 멤버 페이지가 활성화된 경우, 언어 변경 시 카드 내용 다시 렌더링
        const pageType = document.body.getAttribute('data-page-type');
        if (pageType && ['students', 'alumni', 'supporters'].includes(pageType)) {
            renderMemberContent(pageType);
        }
    }

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
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
    // 0. 헤더/푸터 로드 (가장 먼저 실행)
    loadComponents();

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
    if (!container || allMemberRows.length === 0) return;

    // 현재 언어 확인
    const currentLang = localStorage.getItem('preferred-lang') || 'kr';
    const isKr = currentLang === 'kr';

    if (pageType === 'students') {
        renderStudentsPage(allMemberRows, container, isKr);
    } else if (pageType === 'alumni') {
        renderAlumniPage(allMemberRows, container, isKr);
    } else if (pageType === 'supporters') {
        renderSupportersPage(allMemberRows, container, isKr);
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
                ${isKr && member.intro_kr ? member.intro_kr : member.intro_en || ''}
            </p>

            <div style="width: 100%; border-top: 1px solid #e2e8f0; padding-top: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                ${emailHtml}
                
                ${socialHtml ? `<div class="social-links justify-center" style="margin-bottom: ${academicHtml ? '0.5rem' : '0'};">${socialHtml}</div>` : ''}
                
                ${academicHtml ? `<div class="academic-links justify-center" style="gap: 0.5rem; flex-wrap: wrap;">${academicHtml}</div>` : ''}
            </div>
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
        // const currentYear = new Date().getFullYear(); // 사용하지 않음

        if (pageType === 'conference') {
            filteredData = rows.filter(row => row.type === 'Conference' && parseInt(row.year) >= RECENT_THRESHOLD_YEAR);
        } else if (pageType === 'journal') {
            filteredData = rows.filter(row => row.type === 'Journal' && parseInt(row.year) >= RECENT_THRESHOLD_YEAR);
        } else if (pageType === 'former') {
            filteredData = rows.filter(row => parseInt(row.year) < RECENT_THRESHOLD_YEAR);
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
            // 헤더 연도 동적 업데이트 (Conference/Journal)
            if (pageType === 'conference') {
                const header = document.getElementById('conference-header');
                if (header) {
                    header.setAttribute('data-lang-kr', `컨퍼런스 (${RECENT_THRESHOLD_YEAR}~)`);
                    header.setAttribute('data-lang-en', `Conference (${RECENT_THRESHOLD_YEAR}~)`);
                    updateElementText(header);
                }
            } else if (pageType === 'journal') {
                const header = document.getElementById('journal-header');
                if (header) {
                    header.setAttribute('data-lang-kr', `저널 (${RECENT_THRESHOLD_YEAR}~)`);
                    header.setAttribute('data-lang-en', `Journal (${RECENT_THRESHOLD_YEAR}~)`);
                    updateElementText(header);
                }
            }

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

    const formerYear = RECENT_THRESHOLD_YEAR - 1;

    // Update Intro Text
    const formerIntro = document.getElementById('former-intro-text');
    if (formerIntro) {
        formerIntro.setAttribute('data-lang-kr', `${formerYear}년 이하의 출판물 목록입니다.`);
        formerIntro.setAttribute('data-lang-en', `List of publications up to ${formerYear}.`);

        // 현재 언어에 맞게 텍스트 즉시 업데이트
        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        formerIntro.textContent = (currentLang === 'kr')
            ? `${formerYear}년 이하의 출판물 목록입니다.`
            : `List of publications up to ${formerYear}.`;
    }

    let html = '';

    // Conference Section
    html += `
        <div style="margin-bottom: 4rem;">
            <h2 style="border-bottom: 2px solid var(--color-border); padding-bottom: 0.5rem; margin-bottom: 1.5rem;">
                Conference (~${formerYear})
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
                Journal (~${formerYear})
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

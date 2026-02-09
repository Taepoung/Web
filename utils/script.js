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
        if (pageType && ['students', 'alumni', 'supporters'].includes(pageType)) {
            renderMemberContent(pageType);
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

        // 현재 언어 확인
        const currentLang = localStorage.getItem('preferred-lang') || 'kr';
        const isKr = currentLang === 'kr';

        // 데이터 필터링
        let filteredData = [];

        if (pageType === 'conference') {
            filteredData = rows.filter(row => row.type === 'Conference' && parseInt(row.year) >= RECENT_THRESHOLD_YEAR);
        } else if (pageType === 'journal') {
            filteredData = rows.filter(row => row.type === 'Journal' && parseInt(row.year) >= RECENT_THRESHOLD_YEAR);
        } else if (pageType === 'former') {
            filteredData = rows.filter(row => parseInt(row.year) < RECENT_THRESHOLD_YEAR);
        }

        if (filteredData.length === 0) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
                ${isKr ? '등록된 논문이 없습니다.' : 'No publications found.'}
            </p>`;
            return;
        }

        // 연도별 그룹화
        const groupedByYear = {};
        filteredData.forEach(item => {
            if (!groupedByYear[item.year]) groupedByYear[item.year] = [];
            groupedByYear[item.year].push(item);
        });

        // 연도 내림차순 정렬
        const years = Object.keys(groupedByYear).sort((a, b) => b - a);

        // Former 페이지의 경우 Conference/Journal 섹션 분리가 필요합니다.
        if (pageType === 'former') {
            renderFormerPage(filteredData, container, isKr);
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

            renderNormalPage(years, groupedByYear, container, isKr);
        }

    } catch (error) {
        console.error('Error loading publications:', error);
        const container = document.getElementById('publication-list');
        if (container) {
            container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">Error loading data.</p>`;
        }
    }
}

function renderNormalPage(years, groupedByYear, container, isKr) {
    let html = '';
    years.forEach(year => {
        groupedByYear[year].forEach(item => {
            html += createPublicationCard(item);
        });
    });

    if (html === '') {
        container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
            ${isKr ? '등록된 논문이 없습니다.' : 'No publications found.'}
        </p>`;
    } else {
        container.innerHTML = `<div style="display: flex; flex-direction: column; gap: 1rem;">${html}</div>`;
    }
}

function renderFormerPage(data, container, isKr) {
    const confData = data.filter(row => row.type === 'Conference').sort((a, b) => b.year - a.year);
    const jourData = data.filter(row => row.type === 'Journal').sort((a, b) => b.year - a.year);

    const formerYear = RECENT_THRESHOLD_YEAR - 1;

    // Update Intro Text
    const formerIntro = document.getElementById('former-intro-text');
    if (formerIntro) {
        formerIntro.setAttribute('data-lang-kr', `${formerYear}년 이하의 출판물 목록입니다.`);
        formerIntro.setAttribute('data-lang-en', `List of publications up to ${formerYear}.`);
        updateElementText(formerIntro);
    }

    if (confData.length === 0 && jourData.length === 0) {
        container.innerHTML = `<p style="color: var(--color-text-muted); text-align: center; padding: 3rem 0;">
            ${isKr ? '보관된 논문이 없습니다.' : 'No archived publications found.'}
        </p>`;
        return;
    }

    let html = '';

    // Conference Section
    if (confData.length > 0) {
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
    }

    // Journal Section
    if (jourData.length > 0) {
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
    }

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

    return `
    <div class="publication-card">
        <div class="pub-content">
            <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${item.title}</h3>
            <p style="color: var(--color-text-muted); margin-bottom: 0.5rem; font-size: 0.95rem;">
                ${authors}
            </p>
            <p style="color: var(--color-accent); font-weight: 500; font-size: 0.9rem;">
                ${item.venue}, ${item.year} ${item.status ? `[${item.status}]` : ''}
            </p>
        </div>
        <div class="pub-links">
            ${linksHtml}
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
window.copyBibtex = function (btn) {
    const bibtex = btn.getAttribute('data-bibtex');
    if (!bibtex) return;

    navigator.clipboard.writeText(bibtex).then(() => {
        showToast("BibTeX Copied!");
    }).catch(err => {
        console.error('Copy failed:', err);
        // Fallback or Alert
        alert("Copy failed. Please copy manually.");
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

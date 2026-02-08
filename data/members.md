# Laboratory Members Guide (구성원 관리 가이드)

This document explains how to manage laboratory members using the `data/members.csv` file.
이 문서는 `data/members.csv` 파일을 사용하여 연구실 구성원을 관리하는 방법을 설명합니다.

---

## Data Structure (데이터 구조)

The `members.csv` file uses the following columns. Please ensure you maintain the header row.
`members.csv` 파일은 다음 열을 사용합니다. 헤더 행을 반드시 유지해 주세요.

| Column (열) | Description (KR) | Description (EN) | Example (예시) |
| :--- | :--- | :--- | :--- |
| **Type** | 구성원 유형 (Post-Doc, Ph.D., M.S., Undergraduate, Intern, Alumni-Ph.D., Alumni-M.S., Alumni-Undergraduate, Alumni-Intern, Supporter) | Member Category | `Ph.D.` |
| **image** | 프로필 사진 경로 | Profile image path | `data/members/kim.jpg` |
| **name_kr** | 한국어 이름 (Alumni는 생략 가능) | Korean Name | `김철수` |
| **name_en** | 영어 이름 | English Name | `Chulsoo Kim` |
| **interest_kr** | 연구 관심사 (한국어) | Research Interests (KR) | `소프트웨어 공학; AI` |
| **interest_en** | 연구 관심사 (영어) | Research Interests (EN) | `Software Engineering; AI` |
| **intro_kr** | 소개글 (한국어) | Short Bio (KR) | `안녕하세요. AI를 연구합니다.` |
| **intro_en** | 소개글 (영어) | Short Bio (EN) | `Hello. I research AI.` |
| **email** | 이메일 주소 | Email address | `user@dgist.ac.kr` |
| **website** | 개인 홈페이지 URL | Personal website | `https://myhome.com` |
| **github** | GitHub 아이디 또는 URL | GitHub handle or URL | `mygithub` |
| **linkedin** | LinkedIn 아이디 또는 URL | LinkedIn handle or URL | `mylinkedin` |
| **instagram** | 인스타그램 아이디 | Instagram handle | `myinsta` |
| **facebook** | 페이스북 아이디 | Facebook handle | `myfb` |
| **thread** | 스레드 아이디 | Thread handle | `mythread` |
| **google scholar** | 구글 스콜라 URL | Google Scholar URL | `https://scholar...` |
| **dblp** | DBLP URL | DBLP URL | `https://dblp...` |
| **orcid** | ORCID URL | ORCID URL | `https://orcid...` |
| **current** | (Alumni 전용) 현재 소속 | (Alumni only) Current affiliation | `Naver` |
| **year** | (Alumni 전용) 졸업/수료 연도 | (Alumni only) Year of graduation | `2024` |

---

## Rules & Tips (주의사항 및 팁)

1.  **CSV Formatting (파일 형식)**:
    -   Use commas (`,`) to separate columns.
    -   If a value contains a comma, wrap the entire value in double quotes (`"`).
    -   열 구분은 쉼표(`,`)를 사용합니다.
    -   값 안에 쉼표가 포함된 경우 전체를 큰따옴표(`"`)로 감싸주세요.

2.  **Images (이미지)**:
    -   Recommended size: Square (1:1), e.g., 400x400px.
    -   Place image files in `data/members/`.
    -   권장 사이즈: 정비율 (1:1), 예: 400x400px.
    -   이미지 파일은 `data/members/` 폴더에 넣어주세요.

3.  **Bilingual Support (다국어 지원)**:
    -   Fill both `_kr` and `_en` columns for better user experience.
    -   사용자 경험을 위해 `_kr`과 `_en` 열을 모두 채워주는 것이 좋습니다.

4.  **Alumni Layout (졸업생 레이아웃)**:
    -   Alumni members use a simpler horizontal card layout (Grid-4) compared to current members (Grid-3).
    -   졸업생은 재학생(Grid-3)보다 간단한 가로형 카드 레이아웃(Grid-4)을 사용합니다.

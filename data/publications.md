# Publications Guide (논문 관리 가이드)

This document explains how to manage laboratory publications using the `data/publications.csv` file.
이 문서는 `data/publications.csv` 파일을 사용하여 연구실 출판물(논문)을 관리하는 방법을 설명합니다.

---

## Data Structure (데이터 구조)

The `publications.csv` file uses the following columns. Please ensure you maintain the header row.
`publications.csv` 파일은 다음 열을 사용합니다. 헤더 행을 반드시 유지해 주세요.

| Column (열) | Description (KR) | Description (EN) | Example (예시) |
| :--- | :--- | :--- | :--- |
| **type** | 구분 (Conference, Journal) | Publication Type | `Journal` |
| **year** | 출판 연도 | Publication Year | `2025` |
| **title** | 논문 제목 | Paper Title | `Learning to Represent Code Changes` |
| **authors** | 저자 목록 (`**K. Kim**` 형식으로 강조 가능) | Author list (Highlight with `**Name**`) | `X. Tang, **K. Kim**, ...` |
| **venue** | 학회/저널 이름 | Conference/Journal Name | `ICSE`, `TOSEM` |
| **status** | 상태 (Just Accepted, Under Review 등 - 생략 시 연도만 표시) | Publication Status | `Just Accepted` |
| **link** | 논문 링크 (PDF 또는 웹페이지) - 없을 시 `#` 입력 | Paper URL (or `#` if none) | `https://arxiv.org/...` |
| **bibtex** | BibTeX 정보 (개행 문자는 `\n` 사용) | BibTeX entry (Use `\n` for new lines) | `@article{...}` |
| **note** | 추가 비고 (특이사항 기재 시 사용) | Additional notes | `Best Paper Award` |
| **thumbnail** | 썸네일 이미지 파일 경로. (비워두면 기본 이미지 적용, 4:3 비율 권장) | Thumbnail image path | `asset/pub1.png` |

---

## Rules & Tips (주의사항 및 팁)

1.  **CSV Formatting (파일 형식)**:
    -   Use commas (`,`) to separate columns.
    -   If a value contains a comma or multi-line text (like BibTeX), wrap the entire value in double quotes (`"`).
    -   열 구분은 쉼표(`,`)를 사용합니다.
    -   값 안에 쉼표나 여러 줄 텍스트(BibTeX 등)가 포함된 경우 전체를 큰따옴표(`"`)로 감싸주세요.

2.  **BibTeX and New Lines (BibTeX와 개행)**:
    -   When entering BibTeX, use `\n` to represent line breaks within the string.
    -   BibTeX 입력 시, 문자열 내부의 줄바꿈은 `\n` 문자로 표현해 주세요.

3.  **Author Highlights (저자 강조)**:
    -   Wrap author names in double asterisks (e.g., `**K. Kim**`) to display them in bold on the website.
    -   저자 이름을 위첨자나 강조하고 싶을 때 `**이름**` 형식을 사용하면 웹사이트에서 굵게 표시됩니다.

4.  **Threshold Year (정렬 및 분류)**:
    -   Publications are automatically categorized into "Conference", "Journal", and "Former" based on the `RECENT_THRESHOLD_YEAR` (currently set in `utils/script.js`).
    -   논문은 `utils/script.js`에 설정된 기준 연도에 따라 자동으로 최신 학회/저널 및 보관소(Former)로 분류됩니다.

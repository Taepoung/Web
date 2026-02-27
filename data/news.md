
# News Data Documentation (`data/news.csv`)

이 문서는 웹사이트의 소식(News) 페이지에 사용되는 데이터 파일(`data/news.csv`)과 마크다운 컨텐츠 파일의 구조를 설명합니다.

## 1. `data/news.csv` 구조

`news.csv` 파일은 소식 목록을 정의하며, 다음과 같은 컬럼으로 구성됩니다.

| 컬럼명 (Column) | 설명 (Description) | 예시 (Example) |
| :--- | :--- | :--- |
| **type** | 소식의 종류 (대소문자 구분 없음) | `Research`, `Other` |
| **date** | 날짜 (내림차순 정렬에 사용) | `2024.03.01` |
| **title_kr** | 한국어 제목 | `비대면 연구실 운영 시작` |
| **title_en** | 영어 제목 | `Remote Lab Operation Started` |
| **sum_kr** | 한국어 요약 (카드에 표시됨) | `연구실이 비대면 체제로 전환되었습니다.` |
| **sum_en** | 영어 요약 (카드에 표시됨) | `The lab has switched to remote operation mode.` |
| **link** | 마크다운 파일 경로 | `data/news/sample.md` |
| **thumbnail** | 썸네일 이미지 경로 (비워두면 기본 이미지 사용, 4:3 비율 권장) | `asset/news1.png` |

### 주요 사항
- **type**: 현재 `Research`와 `Other` 두 가지 타입을 지원합니다.
    - `Research`: 연구 관련 소식 (News_Research.html)
    - `Other`: 기타 소식 (News_Other.html)
    - **최신 소식(News.html)** 페이지에는 `type`과 상관없이 모든 소식이 날짜순으로 표시됩니다.
- **link**: 소식의 상세 내용을 담고 있는 마크다운(`.md`) 파일의 상대 경로를 입력합니다.

### 팁 (Tip)
- **여러 줄 텍스트 입력**: `sum_kr`이나 `sum_en` (요약문) 필드에서 실제 줄바꿈(엔터키)이 필요한 경우, 전체 텍스트를 큰따옴표(`"`)로 감싼 후 실제 줄바꿈을 입력하거나 `\n` 문자를 사용하면 사이트 상에서 정상 작동합니다.

---

## 2. 마크다운 파일 구조 (`data/news/*.md`)

소식의 상세 내용은 마크다운 파일로 작성하며, 한국어와 영어를 하나의 파일에 모두 포함합니다.
`<!-- KR -->`와 `<!-- EN -->` 주석을 사용하여 언어 구역을 구분합니다.

### 작성 예시

```markdown
<!-- KR -->
# 비대면 연구실 운영 시작

2024년 3월 1일부터 우리 연구실은 전면 비대면 체제로 전환합니다.
연구원들의 편의와 효율적인 연구 활동을 위해 결정되었습니다.

- **기간**: 2024.03.01 ~ 별도 공지 시까지
- **방법**: Zoom 및 Slack 활용

<!-- EN -->
# Remote Lab Operation Started

Starting from March 1, 2024, our lab will switch to a fully remote operation mode.
This decision was made to ensure the convenience and efficiency of our researchers.

- **Period**: 2024.03.01 ~ Until further notice
- **Method**: Using Zoom and Slack
```

### 주의 사항
- `<!-- KR -->` 태그 아래에 한국어 내용을 작성하세요.
- `<!-- EN -->` 태그 아래에 영어 내용을 작성하세요.
- 태그는 정확히 위와 같은 형식이어야 스크립트가 올바르게 인식합니다.

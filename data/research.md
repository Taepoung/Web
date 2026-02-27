# Research CSV Documentation

이 파일(`data/research.csv`)은 연구실의 연구 프로젝트 목록(진행 중 및 완료)을 관리하는 데이터 파일입니다.
웹사이트의 `Research_ongoing.html` 및 `Research_previous.html` 페이지에서 이 파일을 읽어와 내용을 표시합니다.

## 파일 위치
`data/research.csv`

## 컬럼 구조 (Columns)
CSV 파일은 쉼표(`,`)로 구분되며, 다음 순서대로 데이터를 입력해야 합니다.
데이터에 쉼표가 포함될 경우 반드시 큰따옴표(`"`)로 감싸주세요. (예: `"Hello, World"`)

| 컬럼명 (Header) | 설명 (Description) | 예시 (Example) | 필수 여부 |
| :--- | :--- | :--- | :--- |
| **status** | 연구 상태를 지정합니다. `Ongoing` 또는 `Previous` 중 하나여야 합니다. | `Ongoing`, `Previous` | **필수** |
| **date** | 연구 시작일 또는 종료일 (정렬 기준). `YYYY.MM.DD` 형식을 권장합니다. | `2024.01.01` | **필수** |
| **title_kr** | 연구 제목 (한국어) | `LLM 기반 자동화` | **필수** |
| **title_en** | 연구 제목 (영어) | `LLM-based Automation` | **필수** |
| **sum_kr** | 연구 요약 설명 (한국어) | `이 연구는...` | **필수** |
| **sum_en** | 연구 요약 설명 (영어) | `This research...` | **필수** |
| **link** | '자세히 보기' 버튼 클릭 시 이동할 경로입니다. <br> - **내부 파일:** `data/research/파일명.md` <br> - **외부 링크:** `https://...` <br> - **없음:** 빈칸으로 두면 버튼이 비활성화됩니다. | `data/research/sample.md` | 선택 |
| **thumbnail** | 썸네일 이미지 파일 경로. <br> (비워두면 기본 이미지 적용, 4:3 비율 권장) | `asset/research1.png` | 선택 |

## 작성 예시
```csv
status,date,title_kr,title_en,sum_kr,sum_en,link,thumbnail
Ongoing,2024.01.01,"LLM 연구","LLM Research","설명입니다.","Description here.",data/research/sample_ongoing.md,
Previous,2023.12.31,"보안 분석","Security Analysis","완료된 연구입니다.","Finished research.",,
Previous,2023.01.01,"외부 링크","External Link","구글로 연결됩니다.","Links to Google.","https://google.com",
```

## 주의사항
1. **Status 구분:** 대소문자를 구분하지 않으나, 가독성을 위해 `Ongoing`, `Previous`로 표기하는 것을 권장합니다.
2. **따옴표 사용:** 제목이나 설명에 `쉼표(,)` 또는 **여러 줄 텍스트(실제 엔터키 줄바꿈)** 가 들어간다면 반드시 해당 필드를 큰따옴표(`"`)로 감싸야 오류가 발생하지 않습니다. 여러 줄을 입력할 때에도 큰따옴표로 묶어 두면 정상적으로 웹페이지에 표시됩니다.
3. **인코딩:** 한글이 깨지지 않도록 **UTF-8** 인코딩으로 저장해야 합니다.

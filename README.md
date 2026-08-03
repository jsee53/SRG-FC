# SRG-FC

새릉골 풋살 동호회(SAE REUNG GOL FC) 멤버 실력 랭킹 & 팀 짜기 사이트. React + Vite로 만든 정적 사이트로, 서버 없이 GitHub Pages에서 호스팅됩니다.

🔗 **https://jsee53.github.io/SRG-FC/**

## 로컬에서 실행하기

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

## 멤버 정보 수정하기

`src/data/members.js` 파일 하나만 편집하면 됩니다. 멤버 배열에 아래와 같은 형태로 추가/수정하세요.

```js
{
  id: 6,
  name: '홍길동',
  number: 11,      // 등번호 없으면 null
  birthYear: 1999,  // 한국식 나이로 자동 계산되어 표시됨 (src/utils/age.js)
  positions: ['MF', 'FW'], // GK | DF | MF | FW, 여러 포지션 겸임 가능
  tier: 'B',       // S | A | B | C | D
  rank: 1,         // 같은 티어 안에서의 등수 (낮을수록 상위)
  photo: '',       // 이미지 URL, 없으면 이니셜 아바타로 자동 표시
  intro: '한 줄 소개',
  stats: { passing: 75, dribbling: 65, physical: 60, defense: 50, stamina: 70, finishing: 60 }, // 0~99
}
```

전체 순위는 티어(S~D) → 같은 티어 내 rank 순으로 정렬됩니다 (`src/utils/tier.js`). OVR은 6개 스탯의 단순 평균(포지션 가중치 없음)으로 계산되어 카드/상세보기와 팀 짜기 밸런싱에 쓰입니다 (`src/utils/calcOvr.js`).

## 팀 짜기

"팀 짜기" 탭에서 참석자를 클릭으로 담고, 로스터에 없는 용병은 인원수+티어만 선택해 추가할 수 있습니다. 팀 수(2/3)를 고르면 총 참석 인원을 능력치 기준으로 최대한 균등하게 자동 배분합니다. 결과가 마음에 안 들면 "다시 나누기"로 재계산할 수 있습니다.

## 엠블럼 이미지 넣기

`public/emblem.jpg` 파일을 추가하면 헤더에 자동으로 표시됩니다.

## 배포

`main`, `jsee53` 브랜치에 push하면 GitHub Actions가 자동으로 빌드하고 GitHub Pages에 배포합니다 (`.github/workflows/deploy.yml`). 저장소 Settings > Pages에서 Source가 "GitHub Actions"로 설정되어 있어야 합니다.

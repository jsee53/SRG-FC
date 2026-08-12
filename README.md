# SRG-FC

새릉골 풋살 동호회(SAE REUNG GOL FC) 멤버 실력 랭킹 & 팀 짜기 사이트. React + Vite로 만든 정적 사이트로, 서버 없이 GitHub Pages에서 호스팅됩니다.

🔗 **https://jsee53.github.io/SRG-FC/**

## 로컬에서 실행하기

```bash
npm install
cp .env.example .env   # Supabase URL/anon key 채우기
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

## Supabase 설정 (최초 1회)

멤버 데이터는 이제 Supabase(Postgres) DB에서 관리됩니다.

1. https://supabase.com 에서 새 프로젝트 생성
2. 대시보드 **SQL Editor**에서 `supabase/schema.sql` 내용을 그대로 실행 (테이블 생성 + RLS 정책 + 기존 26명 데이터 이전)
3. `Settings > API`에서 `Project URL`, `anon public key`를 `.env`에 채우기 (`.env.example` 참고)
4. `Authentication > Users`에서 관리자 계정을 이메일/비밀번호로 직접 추가 후, `schema.sql` 맨 아래 안내대로 `admin_users` 테이블에 그 유저를 등록
5. GitHub Actions로 배포하려면 저장소 **Settings > Secrets and variables > Actions**에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록 (Vercel이면 프로젝트 Environment Variables에 동일하게 등록)

## 멤버 정보 수정하기

이제 파일을 직접 고치는 대신, **사이트에서 관리자로 로그인**한 뒤 멤버 상세보기의 "수정" 버튼으로 편집합니다. 로그인은 헤더의 "관리자" 버튼에서 할 수 있고, 로그인 없이 둘러보는 건 그대로 열려있습니다.

전체 순위는 티어(S~D) → 같은 티어 내 rank 순으로 정렬됩니다 (`src/utils/tier.js`). OVR은 6개 스탯의 단순 평균(포지션 가중치 없음)으로 계산되어 카드/상세보기와 팀 짜기 밸런싱에 쓰입니다 (`src/utils/calcOvr.js`).

## 팀 짜기

"팀 짜기" 탭에서 참석자를 클릭으로 담고, 로스터에 없는 용병은 인원수+티어만 선택해 추가할 수 있습니다. 팀 수(2/3)를 고르면 총 참석 인원을 능력치 기준으로 최대한 균등하게 자동 배분합니다. 결과가 마음에 안 들면 "다시 나누기"로 재계산할 수 있습니다.

## 엠블럼 이미지 넣기

`public/emblem.jpg` 파일을 추가하면 헤더에 자동으로 표시됩니다.

## 배포

`main`, `jsee53` 브랜치에 push하면 GitHub Actions가 자동으로 빌드하고 GitHub Pages에 배포합니다 (`.github/workflows/deploy.yml`). 저장소 Settings > Pages에서 Source가 "GitHub Actions"로 설정되어 있어야 합니다.

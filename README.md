# SRG-FC

풋살 동호회 회원들이 실제로 쓰고 있는 랭킹 · 경기 일정 · 팀 편성 웹앱입니다.
매주 경기 전에 손으로 팀을 나누던 일을 자동화하려고 시작했고, 지금은 회원 관리, 게시판, 일정, POM 투표까지 동호회 운영에 필요한 기능을 한곳에 모았습니다.

**https://jsee53.github.io/SRG-FC/**

> 저장소의 `supabase/seed.sql`에 들어 있는 회원 데이터는 모두 가상의 이름과 값입니다.

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Supabase (PostgreSQL, Auth, Row Level Security, RPC) |
| 배포 | GitHub Actions → GitHub Pages, PWA (홈 화면 설치) |
| 도구 | oxlint |

별도 API 서버 없이, 권한 검사는 Postgres RLS 정책과 `security definer` 함수에서 처리합니다.

## 주요 기능

- **랭킹**: 6개 능력치(패스/드리블/피지컬/수비/활동량/슛) 레이더 차트와 종합 점수(OVR) 순위, 이름순/참석률순 정렬
- **팀 짜기**: 참석자를 고르면 능력치 기준으로 2~3팀 자동 편성, 용병은 등급만 입력해서 추가
- **경기 일정**: 일정 등록, 참석자 관리, 일정 하나에 여러 경기(1경기/2경기…)를 두고 경기별로 팀 저장
- **POM 투표**: 경기가 끝나면 같은 팀 참석자끼리만 1인 1표로 투표, 집계 결과는 회원 상세에 누적
- **게시판**: 글/댓글/좋아요, 공지 고정
- **회원/권한**: 이메일 가입 후 본인 이름을 골라 멤버와 연결, 관리자가 일정·공지·능력치 수정 권한을 계정별로 부여
- **관리자 도구**: 평등 모드(S급 외 능력치 숨김), 팀 고정 배정, 점검 모드

## 구현하면서 신경 쓴 부분

### 팀 편성 알고리즘 (`src/utils/teamBuilder.js`)

단순히 점수 합만 맞추면 매번 같은 조합이 나오고, 비슷한 유형의 선수가 한 팀에 몰리는 문제가 있었습니다.

1. 관리자가 고정 배정한 인원을 먼저 넣습니다. 고정 배정이 현재 팀 수를 넘는 팀 번호를 가리키면 전체를 무시합니다.
2. S급은 실력 대신 **팀별 인원 수**부터 맞춰 한 팀에 몰리지 않게 합니다.
3. 나머지는 점수 높은 순으로, 현재 총점이 가장 낮은 팀에 배정합니다. 이때 총점 차이가 허용 범위 안인 팀들은 동등하게 봅니다.
4. 동등한 후보가 여럿이면 선수의 **특기 스탯 벡터**(본인 평균 대비 초과분)와 팀에 쌓인 스탯 합을 내적해서, 겹치는 유형이 가장 적은 팀을 고릅니다. 드리블/슛형 선수끼리 한 팀에 모이지 않게 하기 위해서입니다.
5. 그래도 같으면 무작위로 골라 "다시 나누기"를 누를 때마다 다른 조합이 나오게 했습니다.

### 권한과 데이터 보호 (`supabase/migrations`)

- 모든 테이블에 RLS를 걸고, 관리자/일정 관리자/공지 관리자/능력치 관리자를 별도 테이블로 분리했습니다.
- 본인 정보 수정, 멤버 연결, 능력치 수정, 투표처럼 범위가 좁은 쓰기는 `security definer` 함수로만 허용해서 다른 컬럼을 함께 바꿀 수 없게 했습니다.
- 경기 성사 여부는 참석 집계에 쓰이기 때문에, RLS의 `with check`로는 막을 수 없는 "변경 전/후 값 비교"를 트리거로 처리했습니다.
- 작성자 이메일이 anon 키로 조회되던 문제를 발견해 컬럼 단위 권한으로 막았고, 그 때문에 `count(*)` 집계가 깨지는 부작용이 생겨 이메일을 관리자 전용 테이블로 분리했습니다. (`015`, `016` 마이그레이션)
- POM 1인 1표 기준을 계정 id에서 경기 참석자 id로 바꿔, 계정 연결을 끊었다 다시 연결하는 방식의 중복 투표를 막았습니다.

### 모바일 사용성

휴대폰 접속을 기준으로 만들었습니다.

- 바텀시트 당겨서 닫기, 탭 좌우 스와이프. 인앱 브라우저에서 `touchend` 없이 `touchcancel`로 끝나는 경우까지 처리
- 모달이 열려 있을 때 뒤 페이지 스크롤 잠금, 입력창 포커스 시 자동 확대 방지
- PWA로 설치했을 때 초기 로딩 실패 자동 재시도, 백그라운드 복귀 시 데이터 새로고침

## 프로젝트 구조

```
src/
  pages/        탭 단위 화면 (랭킹, 팀 짜기, 게시판, 일정, 내 정보, 관리자)
  components/   카드, 모달, 폼 등 UI 컴포넌트
  hooks/        Supabase 데이터 조회/수정 훅 (useMembers, useEvents, usePosts ...)
  utils/        팀 편성, 등급/정렬, 시간 처리 등 순수 함수
supabase/
  migrations/   스키마 변경 이력 (번호 순서대로 실행)
  seed.sql      가상 샘플 데이터
```

## 로컬 실행

```bash
npm install
cp .env.example .env   # Supabase URL / anon key 입력
npm run dev            # http://localhost:5271
```

### Supabase 설정

1. Supabase 프로젝트를 만들고 SQL Editor에서 `supabase/migrations/*.sql`을 번호 순서대로 실행합니다.
2. 샘플 데이터가 필요하면 `supabase/seed.sql`을 실행합니다.
3. `Settings > API`의 Project URL, anon key를 `.env`에 넣습니다.
4. `Authentication > Users`에서 관리자 계정을 만든 뒤 UUID를 등록합니다.
   ```sql
   insert into admin_users (user_id) values ('<관리자 UUID>');
   ```
5. GitHub Actions 배포를 쓰려면 저장소 Secrets에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록합니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions가 빌드 후 GitHub Pages에 배포합니다. (`.github/workflows/deploy.yml`)

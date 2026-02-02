# PLANNINGO

친구들과 함께 여행 계획을 세우고 공유하는 웹 애플리케이션입니다.

## 주요 기능

### 인증
- 이메일 로그인/회원가입
- 소셜 로그인 (카카오, Google)
- 사용자 프로필 관리

### 여행 관리
- **여행 생성**: 제목, 여행지, 날짜, 예산 설정
- **초대 코드**: 6자리 코드로 친구 초대
- **공유 링크**: Web Share API로 간편 공유
- **멤버 관리**: 방장, 관리자, 멤버 역할

### 일정 탭
- 날짜별 일정 목록 (Day 1, Day 2...)
- 드래그 앤 드롭으로 순서 변경
- 시작/종료 시간, 메모 추가
- 장소 연결 기능

### 지출 탭
- 카테고리별 지출 관리 (식비, 교통, 숙박 등)
- 멤버별 지출 내역
- 자동 정산 계산 (누가 누구에게 얼마를 보내야 하는지)
- 지출 참여자 선택

### 체크리스트 탭
- 공유/개인 체크리스트 구분
- 추천 체크리스트 템플릿
- 항목 완료 체크 및 삭제

### 장소 탭
- 카테고리별 장소 저장 (음식점, 카페, 관광지 등)
- 주소, 전화번호, 웹사이트 저장
- 카카오맵/구글맵 연동

### 실시간 동기화
- Supabase Realtime으로 실시간 업데이트
- 다른 멤버의 변경사항 즉시 반영

### 알림 시스템
- 여행 초대, 일정 변경, 지출 추가 등 알림
- 읽음/안읽음 관리
- 알림 삭제

### 프로필
- 여행 통계 (전체, 진행중, 완료)
- "프링" 캐릭터 인사말
- 로그아웃

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase
- **State Management**: Zustand, TanStack Query
- **Drag & Drop**: @dnd-kit
- **i18n**: next-intl (한국어, English)
- **PWA**: @ducanh2912/next-pwa
- **Form**: react-hook-form + Zod

## 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/moinji/planningo.git
cd planningo
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env.local`을 생성하고 필요한 값을 입력합니다:

```bash
cp .env.example .env.local
```

필요한 환경 변수:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `NEXT_PUBLIC_KAKAO_MAP_API_KEY`: 카카오맵 API 키 (선택)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API 키 (선택)

### 4. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 파일의 내용을 실행합니다.
3. Authentication 설정에서 Email과 OAuth 제공자(Kakao, Google)를 활성화합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인할 수 있습니다.

## 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router 페이지
│   ├── (app)/          # 인증 필요 페이지 (여행, 프로필 등)
│   ├── (auth)/         # 인증 페이지 (로그인, 회원가입)
│   └── auth/           # OAuth 콜백
├── components/         # React 컴포넌트
│   ├── ui/            # 기본 UI 컴포넌트 (Button, Card, Modal 등)
│   ├── layout/        # 레이아웃 컴포넌트 (Header, BottomNav)
│   ├── common/        # 공통 컴포넌트 (EmptyState, LoadingScreen)
│   └── trip/          # 여행 관련 컴포넌트 (탭, 모달)
├── hooks/              # Custom React Hooks
│   ├── use-auth.ts    # 인증 관련
│   ├── use-trips.ts   # 여행 CRUD
│   ├── use-schedules.ts # 일정 CRUD
│   ├── use-expenses.ts  # 지출 CRUD + 정산 계산
│   ├── use-checklists.ts # 체크리스트 CRUD
│   ├── use-places.ts  # 장소 CRUD
│   ├── use-notifications.ts # 알림
│   └── use-realtime.ts # 실시간 동기화
├── lib/                # 유틸리티 및 라이브러리 설정
│   ├── supabase/      # Supabase 클라이언트
│   └── validations/   # Zod 스키마
├── stores/             # Zustand 상태 관리
├── types/              # TypeScript 타입 정의
└── i18n/               # 다국어 지원
```

## 라이센스

이 프로젝트는 개인 프로젝트입니다.

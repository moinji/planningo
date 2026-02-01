# PLANNINGO 기획서

> 친구들과 함께 여행 계획을 짜는 협업 플랫폼

---

## 1. 프로젝트 개요

### 1.1 프로젝트명
**PLANNINGO** (플래닝고)

### 1.2 컨셉
- 플라밍고(Flamingo)에서 영감을 받은 여행 계획 서비스
- "Plan + Flamingo" = 함께 계획하는 즐거움
- 귀여운 플라밍고 캐릭터 **"프링"** 과 함께하는 여행 플래닝

### 1.3 핵심 가치
- **협업**: 친구들과 실시간으로 함께 계획
- **간편함**: 복잡한 여행 계획을 쉽고 재미있게
- **공정함**: 투명한 예산 관리와 정산

---

## 2. 타겟 사용자

### 2.1 주요 타겟
- 친구들과 함께 여행을 계획하는 20-30대
- 국내/해외 여행을 모두 계획하는 사용자
- 여행 계획 시 의견 조율이 어려웠던 그룹

### 2.2 사용 시나리오
1. 여행 주최자가 새 여행을 생성
2. 초대 링크로 친구들 초대
3. 함께 일정 편집, 장소 투표, 예산 관리
4. 여행 중/후 정산 및 리캡

---

## 3. 핵심 기능

### 3.1 MVP (1차 개발)

#### 3.1.1 회원 관리
- **로그인 방식**: 이메일 + 소셜(카카오, 구글)
- **비밀번호 정책**: 8자 이상 + 영문/숫자 포함
- **세션 만료**: 7일
- **프로필**: 닉네임, 프로필 이미지
- **언어 설정**: 한국어 / English
- **계정 삭제**: 개인정보 삭제, 여행 데이터는 익명화 처리

#### 3.1.2 여행 생성 & 관리
- **필수 입력**: 여행 제목만 (나머지는 선택)
- 날짜 범위, 목적지는 나중에 설정 가능
- **초대 링크** 생성 및 공유 (7일 후 만료)
- **카카오톡 공유**: OG 태그로 미리보기 지원 (여행명, 날짜, 이미지)
- 참여자 역할: 방장(관리자) / 멤버
- 인원 제한: 없음
- **여행 복사**: 지난 여행을 템플릿으로 새 여행 생성 가능
- **여행 공개 범위**: 멤버만 / 링크로 조회 가능 (여행별 선택)
- **여행 상태**: 종료일 기준 자동 완료 처리, 날짜 변경 시 재계산
- **여행 삭제**: 여행명 직접 입력 후 삭제 (실수 방지)
- **여행 검색**: 여행명으로 검색 가능
- **URL 구조**: `/trip/[id]-[제목]` 형식

#### 3.1.3 멤버 관리
- **방장 권한**: 멤버 강퇴 가능
- **방장 위임**: 방장 탈퇴 시 가장 먼저 참여한 멤버에게 자동 이전
- 데이터 보관: 영구 보관 (사용자가 직접 삭제 전까지)

#### 3.1.4 일정 관리
- **일정 단위 선택** (여행 생성 시):
  - 시간대별 (오전/점심/오후/저녁)
  - 정확한 시간 (10:00~12:00)
  - 자유 나열 (순서만)
- **일정 뷰**: 리스트 뷰 / 캘린더 뷰 (사용자가 전환 가능)
- **드래그 앤 드롭**: 같은 날짜 내 순서 변경 + 다른 날짜로 이동 가능
- **일정 충돌**: 같은 시간대에 여러 일정 등록 시 "후보 1, 후보 2" 형태로 표시
- **일정 복사/붙여넣기**: 비슷한 일정 빠르게 추가
- **사진/메모 첨부**: 일정마다 사진, 메모 추가 가능
- **예상 비용**: 일정별 예상 비용 입력 가능
- **사진 용량**: 사용자 선택 (자동 압축 2MB / 원본 5MB)
- **이미지 썸네일**: 자동 생성
- **실시간 동기화**: Supabase Realtime으로 즉시 반영
- **휴지통**: 삭제된 일정 30일간 보관, 복구 가능
- **여행 내 검색**: 일정명, 장소명으로 검색

#### 3.1.5 지도 & 장소
- **별도 지도 탭**으로 분리
- **국내**: 카카오맵 API
- **해외**: Google Maps API
- 장소 검색 및 저장
- **장소 카테고리**: API 기본 카테고리 + 사용자 정의 가능
- **장소 정보**: API 제공 정보 (영업시간, 연락처) + 사용자 수정 가능
- 일정에 장소 연결
- **전체 루트 시각화**: 일정 장소를 지도에 자동 표시
- **거리/이동시간 자동 계산**: Maps Directions API 활용
- **이동 수단**: 여행 기본값 설정 (도보/차/대중교통) + 일정별 개별 선택 가능
- AI 최적 루트 제안 (2차 개발)

#### 3.1.6 투표 & 의견수렴
- 장소/식당/활동 투표 생성
- 다중 선택 / 단일 선택 옵션
- 실시간 투표 결과 확인
- **투표 마감**: 기본 24시간, 사용자가 직접 설정 가능
- **투표 변경**: 마감 전까지 선택 변경 가능
- **투표 수정**: 아무도 투표하지 않았을 때만 수정 가능, 투표 시작 후 수정 불가
- **투표 삭제**: 생성자가 언제든 삭제 가능
- **투표 → 일정**: 마감 후 "일정에 추가" 버튼으로 바로 반영

#### 3.1.7 예산 & 정산
- **통화 설정**: 원화(KRW), 달러(USD), 엔화(JPY) 등
- **환율 처리**: 실시간 환율 자동 적용 + 수동 수정 가능
- **지출 카테고리**: 기본 (음식, 교통, 숙소, 관광, 쇼핑, 기타) + 사용자 정의
- 지출 항목 등록 (누가, 얼마, 뭐에)
- **영수증 첨부**: 지출에 영수증 사진 첨부 가능
- **지출 권한**: 등록자 + 방장만 수정/삭제 가능
- **정산 방식**:
  - 1/N 더치페이
  - 참여자별 선택 (이 지출에 참여한 사람만)
- **정산 알고리즘**: 최소 거래 횟수 최적화
- **정산 결과**: 간단 요약 ("A→B: 50,000원") + 상세 보기 토글
- **송금 완료 표시**: "완료" 버튼으로 상태 변경 가능
- **휴지통**: 삭제된 지출 30일간 보관, 복구 가능

#### 3.1.8 룰렛 & 랜덤
- 의견 충돌 시 룰렛 돌리기
- **룰렛 항목**: 진행 중인 투표 옵션 연동 + 직접 입력 가능
- 랜덤 장소/음식 선택
- 재미 요소로 그룹 의사결정 지원

#### 3.1.9 알림
- **이메일 알림**
  - 일정 변경 시
  - 새 투표 생성 시
  - 투표 마감 임박 시
  - 정산 요청 시
- **알림 설정**: 전체 on/off (종류별 개별 설정 없음)
- **알림 빈도**: 사용자 선택 (즉시 / 일일 요약 / 끔)
- **이메일 스타일**: 텍스트 위주, 간결한 디자인

#### 3.1.10 캘린더 내보내기
- Google Calendar 내보내기
- iCal 형식 다운로드

#### 3.1.11 오프라인 지원 (PWA)
- 앱처럼 홈 화면에 설치 가능
- 오프라인에서도 일정 확인 가능
- 온라인 복귀 시 자동 동기화
- **오프라인 충돌**: 충돌 시 사용자에게 어떤 버전을 선택할지 묻기

#### 3.1.12 온보딩
- 선택적 튜토리얼 (스킵 가능)
- 3-4단계 기능 소개
- 프링 캐릭터가 안내

#### 3.1.13 UX 세부사항
- **스케레톤 UI**: 데이터 로딩 중 레이아웃 미리보기
- **로딩 애니메이션**: 프링이 깨작깨작 움직이는 애니메이션
- **로딩 타임아웃**: 30초 후 "시간이 오래 걸려요" + 재시도 버튼
- **빈 상태 화면**: 프링 캐릭터 + 안내 문구 + CTA 버튼
- **에러 메시지**: 친근한 말투 ("어라, 문제가 생겼어요!")
- **네트워크 오류**: 토스트 메시지로 알림 + 재시도 버튼
- **폼 유효성**: 실시간 검사 (입력 즉시)
- **목록 로딩**: 무한 스크롤
- **문의 채널**: 이메일 문의 폼
- **이용약관/개인정보처리방침**: 가입 시 동의 필수
- **접근성**: 기본 지원 (키보드 네비, aria-label, 색상 대비)

### 3.2 2차 개발 (추후 확장)

#### 3.2.1 AI 여행 추천
- Gemini API 활용
- 취향 기반 장소/코스 추천
- "이 지역에서 뭐하지?" 질문에 답변
- **AI 최적 루트 제안**: 이동 시간 최소화 루트 추천

#### 3.2.2 여행 리캡
- **타임라인 카드** 형식
- 날짜별 사진 + 장소 정리
- 공유 가능한 여행 기록
- SNS 공유 기능

#### 3.2.3 다크 모드
- 라이트/다크 모드 전환
- 시스템 설정 따라가기 옵션

#### 3.2.4 장소 리뷰
- 방문 후 별점/한줄 리뷰 남기기

---

## 4. 기술 스택

### 4.1 Frontend
| 기술 | 용도 |
|------|------|
| Next.js 14 (App Router) | 프레임워크 |
| TypeScript | 타입 안전성 |
| Tailwind CSS | 스타일링 |
| Zustand | 상태 관리 |
| React Query | 서버 상태 관리 |
| next-pwa | PWA 지원 |
| next-intl | 다국어 (i18n) |
| Playwright | E2E 테스트 |

### 4.2 Backend & Database
| 기술 | 용도 |
|------|------|
| Supabase | BaaS (인증, DB, 실시간) |
| PostgreSQL | 데이터베이스 (Supabase 내장) |
| Supabase Realtime | 실시간 동기화 |
| Supabase Auth | 인증 (이메일, OAuth) |
| Supabase Storage | 이미지 저장 |

### 4.3 외부 API
| 서비스 | 용도 |
|--------|------|
| Kakao Maps API | 국내 지도/장소 검색 |
| Kakao OAuth | 카카오 로그인 |
| Google Maps API | 해외 지도/장소 검색 |
| Google Maps Directions API | 거리/이동시간 계산 |
| Google Places API | 장소 상세 정보 |
| Google OAuth | 구글 로그인 |
| Exchange Rate API | 실시간 환율 |
| Gemini API | AI 추천 (2차) |
| Resend | 이메일 발송 |

### 4.4 배포
| 서비스 | 용도 |
|--------|------|
| Vercel | 프론트엔드 호스팅 |
| Supabase Cloud | 백엔드/DB 호스팅 |

### 4.5 개발 환경
- **Git 전략**: main + feature 브랜치
- **테스트**: Playwright E2E 테스트

---

## 5. 디자인 가이드

### 5.1 컨셉
- **스타일**: 깨끗하고 미니멀
- **캐릭터**: 귀여운 플라밍고 마스코트 "프링"
- **톤앤매너**: 친근하고 재미있는

### 5.2 컬러 팔레트
| 용도 | 색상 | HEX |
|------|------|-----|
| Primary | 플라밍고 핑크 | `#FF6B9D` |
| Secondary | 열대 초록 | `#4ECDC4` |
| Background | 화이트 | `#FFFFFF` |
| Surface | 연한 핑크 | `#FFF5F7` |
| Text Primary | 다크 그레이 | `#2D3436` |
| Text Secondary | 미디엄 그레이 | `#636E72` |
| Success | 초록 | `#00B894` |
| Error | 레드 | `#FF6B6B` |
| Warning | 옐로우 | `#FDCB6E` |

### 5.3 캐릭터 "프링"
- **등장 위치**:
  - 로딩 화면 (깨작깨작 애니메이션)
  - 빈 상태 (데이터 없을 때) + 안내 문구 + CTA
  - 온보딩 튜토리얼
  - 성공/실패 메시지
  - 로고
- **표정 종류**:
  - 기본 (미소)
  - 기쁨 (성공 시)
  - 슬픔 (에러 시)
  - 기대 (로딩 시)
  - 놀람 (알림 시)

### 5.4 반응형
- 모바일 / PC 동등하게 최적화
- 모바일 퍼스트 접근
- 브레이크포인트: 640px / 768px / 1024px / 1280px

### 5.5 네비게이션
- **모바일**: 하단 탭바 (홈, 일정, 지도, 투표, 예산)
- **PC**: 좌측 사이드바 또는 상단 헤더

---

## 6. 정보 구조 (IA)

```
PLANNINGO
├── 랜딩 페이지
├── 로그인 / 회원가입
│   ├── 이메일 로그인
│   ├── 카카오 로그인
│   └── 구글 로그인
├── 대시보드 (내 여행 목록)
│   ├── 검색
│   ├── 예정된 여행
│   ├── 진행 중인 여행
│   └── 지난 여행
├── 여행 상세 (하단 탭바)
│   ├── 일정 탭
│   │   ├── 리스트 뷰 / 캘린더 뷰 전환
│   │   ├── 일정 검색
│   │   ├── 일정 추가/편집/삭제/복사
│   │   └── 사진/메모/예상비용 첨부
│   ├── 지도 탭
│   │   ├── 전체 루트 보기
│   │   ├── 장소 간 거리/시간 (이동수단 선택)
│   │   └── 장소 검색/추가
│   ├── 투표 탭
│   │   ├── 진행 중인 투표
│   │   ├── 완료된 투표
│   │   ├── 투표 생성
│   │   └── 일정에 추가 버튼
│   ├── 예산 탭
│   │   ├── 지출 목록
│   │   ├── 지출 추가 (영수증 첨부)
│   │   ├── 정산 현황 (간단/상세)
│   │   └── 송금 완료 표시
│   └── 더보기
│       ├── 여행 설정
│       ├── 멤버 관리
│       ├── 초대 링크
│       ├── 룰렛
│       ├── 캘린더 내보내기
│       └── 휴지통
├── 프로필
│   ├── 내 정보 수정
│   ├── 알림 설정 (on/off, 빈도)
│   └── 계정 삭제
├── 설정
│   └── 언어 설정
└── 약관
    ├── 이용약관
    └── 개인정보처리방침
```

---

## 7. 데이터베이스 스키마 (초안)

### 7.1 주요 테이블

```sql
-- 사용자
users (
  id UUID PRIMARY KEY,
  email VARCHAR,
  nickname VARCHAR,
  avatar_url VARCHAR,
  language VARCHAR DEFAULT 'ko',
  notification_enabled BOOLEAN DEFAULT true,
  notification_frequency VARCHAR DEFAULT 'instant', -- 'instant' | 'daily' | 'off'
  created_at TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete, 익명화 시 설정
)

-- 여행
trips (
  id UUID PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR, -- URL용
  description TEXT,
  start_date DATE,
  end_date DATE,
  destination VARCHAR,
  country VARCHAR,
  schedule_type VARCHAR DEFAULT 'time_slot', -- 'time_slot' | 'exact_time' | 'free'
  default_transport VARCHAR DEFAULT 'car', -- 'walk' | 'car' | 'transit'
  currency VARCHAR DEFAULT 'KRW',
  exchange_rate DECIMAL, -- 수동 설정 시
  visibility VARCHAR DEFAULT 'members', -- 'members' | 'link'
  status VARCHAR DEFAULT 'planned', -- 'planned' | 'ongoing' | 'completed'
  owner_id UUID REFERENCES users(id),
  invite_code VARCHAR UNIQUE,
  invite_expires_at TIMESTAMP, -- 7일 후
  created_at TIMESTAMP
)

-- 여행 멤버
trip_members (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR DEFAULT 'member', -- 'owner' | 'member'
  joined_at TIMESTAMP
)

-- 일정
schedules (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  date DATE,
  order_index INT,
  candidate_index INT DEFAULT 0, -- 0: 확정, 1+: 후보
  time_slot VARCHAR, -- 'morning' | 'lunch' | 'afternoon' | 'evening'
  start_time TIME,
  end_time TIME,
  title VARCHAR,
  memo TEXT,
  estimated_cost DECIMAL, -- 예상 비용
  transport VARCHAR, -- 'walk' | 'car' | 'transit' (개별 설정)
  place_id UUID REFERENCES places(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP -- 휴지통
)

-- 일정 첨부파일
schedule_attachments (
  id UUID PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id),
  file_url VARCHAR,
  thumbnail_url VARCHAR, -- 자동 생성 썸네일
  file_type VARCHAR, -- 'image' | 'document'
  file_size INT,
  created_at TIMESTAMP
)

-- 장소
places (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  name VARCHAR,
  address VARCHAR,
  lat DECIMAL,
  lng DECIMAL,
  category VARCHAR,
  custom_category VARCHAR, -- 사용자 정의
  phone VARCHAR, -- 연락처 (API 또는 사용자 입력)
  opening_hours TEXT, -- 영업시간
  map_provider VARCHAR, -- 'kakao' | 'google'
  external_id VARCHAR,
  created_at TIMESTAMP
)

-- 투표
polls (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  title VARCHAR,
  description TEXT,
  poll_type VARCHAR DEFAULT 'single', -- 'single' | 'multiple'
  status VARCHAR DEFAULT 'active', -- 'active' | 'closed'
  deadline TIMESTAMP,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 투표 옵션
poll_options (
  id UUID PRIMARY KEY,
  poll_id UUID REFERENCES polls(id),
  title VARCHAR,
  description TEXT
)

-- 투표 응답
poll_votes (
  id UUID PRIMARY KEY,
  poll_id UUID REFERENCES polls(id),
  option_id UUID REFERENCES poll_options(id),
  user_id UUID REFERENCES users(id),
  voted_at TIMESTAMP
)

-- 지출
expenses (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  title VARCHAR,
  amount DECIMAL,
  currency VARCHAR,
  category VARCHAR, -- 'food' | 'transport' | 'accommodation' | 'tourism' | 'shopping' | 'etc'
  custom_category VARCHAR,
  receipt_url VARCHAR, -- 영수증 사진
  paid_by UUID REFERENCES users(id),
  split_type VARCHAR DEFAULT 'equal', -- 'equal' | 'custom'
  created_at TIMESTAMP,
  deleted_at TIMESTAMP -- 휴지통
)

-- 지출 분담
expense_splits (
  id UUID PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP
)

-- 지출 카테고리 (사용자 정의)
expense_categories (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  name VARCHAR,
  icon VARCHAR,
  created_at TIMESTAMP
)

-- 장소 카테고리 (사용자 정의)
place_categories (
  id UUID PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  name VARCHAR,
  icon VARCHAR,
  created_at TIMESTAMP
)
```

---

## 8. 개발 로드맵

### Phase 1: 기반 구축 (MVP 준비)
- [ ] 프로젝트 초기 설정 (Next.js, Supabase, Tailwind)
- [ ] 인증 시스템 (이메일, 카카오, 구글)
- [ ] 기본 레이아웃 및 하단 탭바 네비게이션
- [ ] 다국어 설정 (i18n)
- [ ] PWA 설정
- [ ] 스케레톤 UI 컴포넌트
- [ ] 프링 캐릭터 에셋 준비
- [ ] Playwright 테스트 환경 설정

### Phase 2: 핵심 기능 (MVP)
- [ ] 여행 CRUD + 복사 + 검색
- [ ] 초대 링크 시스템 (7일 만료, 카톡 OG)
- [ ] 멤버 관리 (강퇴, 방장 위임)
- [ ] 일정 관리 (리스트/캘린더 뷰, 드래그 앤 드롭, 날짜 간 이동)
- [ ] 일정 충돌 처리 (후보 표시)
- [ ] 일정 사진/메모/예상비용 첨부
- [ ] 일정 복사/붙여넣기
- [ ] 실시간 동기화 (Supabase Realtime)
- [ ] 지도 탭 (카카오/구글, 루트 시각화)
- [ ] 거리/이동시간 자동 계산 + 이동수단 선택
- [ ] 투표 시스템 (마감 설정, 변경 가능, 일정 반영)
- [ ] 예산 관리 (카테고리, 환율, 영수증)
- [ ] 정산 계산 (최소 거래) + 송금 완료 표시
- [ ] 룰렛 기능 (투표 연동)
- [ ] 이메일 알림 (빈도 설정)
- [ ] 캘린더 내보내기
- [ ] 휴지통 (일정, 지출)
- [ ] 여행 내 검색
- [ ] 온보딩 튜토리얼
- [ ] 이용약관/개인정보처리방침
- [ ] E2E 테스트 작성

### Phase 3: 안정화
- [ ] 버그 수정 및 최적화
- [ ] 사용자 피드백 반영
- [ ] 성능 개선
- [ ] 접근성 개선

### Phase 4: 확장 (2차)
- [ ] AI 여행 추천 (Gemini)
- [ ] AI 최적 루트 제안
- [ ] 여행 리캡 (타임라인 카드)
- [ ] SNS 공유
- [ ] 다크 모드
- [ ] 장소 리뷰

---

## 9. MVP 체크리스트

### 필수 기능
- [x] 이메일 + 소셜 로그인 (카카오, 구글)
- [x] 세션 7일 유지
- [x] 여행 생성 (제목만 필수) 및 초대 링크 (7일 만료)
- [x] 카카오톡 공유 미리보기 (OG 태그)
- [x] 여행 복사/검색 기능
- [x] 여행 공개 범위 설정
- [x] 여행 상태 자동/수동 관리
- [x] 멤버 관리 (강퇴, 방장 자동 위임)
- [x] 일정 관리 (3가지 모드, 리스트/캘린더 뷰)
- [x] 일정 드래그 (날짜 간 이동 가능)
- [x] 일정 충돌 시 후보 표시
- [x] 일정 복사/붙여넣기
- [x] 일정 사진/메모/예상비용 첨부
- [x] 일정/지출 휴지통 (30일 보관)
- [x] 여행 내 검색 (일정, 장소)
- [x] 실시간 협업 (Supabase Realtime)
- [x] 지도 탭 (전체 루트, 거리/시간 자동 계산)
- [x] 이동 수단 선택 (여행 기본 + 일정별)
- [x] 장소 정보 (API + 사용자 수정)
- [x] 장소 카테고리 (API + 사용자 정의)
- [x] 투표 기능 (마감 설정, 변경 가능)
- [x] 투표 → 일정 바로 반영
- [x] 예산 관리 (카테고리, 환율, 영수증)
- [x] 지출 권한 (등록자 + 방장만)
- [x] 정산 (최소 거래, 간단/상세, 송금 완료)
- [x] 룰렛 (투표 연동 + 직접 입력)
- [x] 이메일 알림 (전체 on/off, 빈도 선택)
- [x] 캘린더 내보내기
- [x] 한/영 다국어
- [x] PWA (오프라인 지원, 충돌 시 사용자 선택)
- [x] 온보딩 (선택적)
- [x] 프링 캐릭터 (다양한 표정, 빈 상태 + 안내 + CTA)
- [x] 스케레톤 UI + 로딩 타임아웃 (30초)
- [x] 에러 메시지 (친근한 말투)
- [x] 폼 유효성 (실시간 검사)
- [x] 무한 스크롤
- [x] 이미지 썸네일 자동 생성
- [x] 네트워크 오류 토스트 + 재시도
- [x] 이용약관/개인정보처리방침
- [x] 이메일 문의
- [x] 접근성 기본 지원
- [x] E2E 테스트 (Playwright)

### 제외 (2차로 미룸)
- [ ] AI 여행 추천
- [ ] AI 최적 루트 제안
- [ ] 여행 리캡
- [ ] 다크 모드
- [ ] 장소 리뷰

---

## 10. 비즈니스

### 10.1 수익 모델
- **미정**: 우선 무료로 시작, 추후 결정
- 고려 중인 옵션:
  - 프리미엄 기능 (AI 추천, 고급 리캡 등)
  - 광고 기반
  - 완전 무료 유지

---

## 11. 참고 사항

### 11.1 API 키 필요
- Kakao Developers (Maps, OAuth)
- Google Cloud (Maps, Places, Directions, OAuth)
- Supabase 프로젝트
- Exchange Rate API (환율)
- Resend (이메일)

### 11.2 무료 티어 한도
| 서비스 | 무료 한도 |
|--------|-----------|
| Vercel | 100GB 대역폭/월 |
| Supabase | 500MB DB, 1GB 스토리지, 동시접속 200명 |
| Kakao Maps | 300,000 호출/일 |
| Google Maps | $200 크레딧/월 |
| Resend | 100 이메일/일 |

---

## 12. 결정사항 요약

| 항목 | 결정 |
|------|------|
| 플랫폼 | 웹 앱 (PWA) |
| 네비게이션 | 모바일 하단 탭바 |
| 로그인 | 이메일 + 카카오 + 구글 |
| 비밀번호 | 8자 이상 + 영문/숫자 |
| 세션 만료 | 7일 |
| 초대 링크 | 7일 만료 |
| 인원 제한 | 없음 |
| URL 구조 | ID + 제목 |
| 일정 단위 | 3가지 모드 사용자 선택 |
| 일정 뷰 | 리스트 + 캘린더 전환 |
| 일정 드래그 | 날짜 간 이동 가능 |
| 일정 충돌 | 후보 1, 후보 2 표시 |
| 일정 복사 | 가능 |
| 예상 비용 | 일정에 입력 가능 |
| 지도 | 별도 탭, 루트/거리/시간 자동 |
| 이동 수단 | 여행 기본 + 일정별 선택 |
| 장소 정보 | API + 사용자 수정 |
| 투표 마감 | 기본 24시간, 사용자 설정 |
| 투표 변경 | 마감 전까지 가능 |
| 투표 수정 | 투표 0명일 때만 |
| 투표→일정 | 바로 반영 버튼 |
| 지출 카테고리 | 기본 6개 + 사용자 정의 |
| 지출 권한 | 등록자 + 방장만 |
| 영수증 | MVP에 포함 |
| 환율 | 실시간 + 수동 수정 |
| 정산 | 최소 거래, 간단/상세, 송금 완료 |
| 룰렛 | 투표 연동 + 직접 입력 |
| 알림 | 이메일, 전체 on/off, 빈도 선택 |
| 캘린더 내보내기 | Google Calendar, iCal |
| 사진 첨부 | 압축/원본 선택, 썸네일 자동 |
| 휴지통 | 30일 보관 |
| 여행 검색 | 가능 |
| 여행 내 검색 | 일정, 장소 검색 |
| 여행 공개 | 멤버만/링크 선택 |
| 여행 상태 | 종료일 기준 자동, 날짜 변경 시 재계산 |
| 여행 삭제 | 여행명 입력 확인 |
| 방장 위임 | 자동 (먼저 참여한 멤버) |
| 계정 삭제 | 익명화 처리 |
| 온보딩 | 선택적 (스킵 가능) |
| 캐릭터 이름 | 프링 |
| 캐릭터 등장 | 로딩, 빈 상태+안내+CTA, 온보딩, 성공/실패 |
| 캐릭터 표정 | 기본, 기쁨, 슬픔, 기대, 놀람 |
| 로딩 | 프링 애니메이션 + 스케레톤 UI |
| 로딩 타임아웃 | 30초 후 재시도 버튼 |
| 에러 메시지 | 친근한 말투 |
| 네트워크 오류 | 토스트 + 재시도 |
| 폼 유효성 | 실시간 검사 |
| 목록 로딩 | 무한 스크롤 |
| 오프라인 충돌 | 사용자 선택 |
| 언어 | 한/영 |
| 접근성 | 기본 지원 |
| 테스트 | E2E (Playwright) |
| Git 전략 | main + feature |
| 다크 모드 | 2차 |
| AI 추천 | 2차 (Gemini) |
| 장소 리뷰 | 2차 |
| 여행 리캡 | 2차 (타임라인 카드) |

---

*마지막 수정: 2026-02-01*

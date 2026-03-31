# K Typewriter

워드프레스 히어로 헤드라인, 공지, 안내 카피를 위한 다국어 타이프라이터 블록 플러그인입니다.

[English README](./README.md) · [WordPress.org readme](./readme.txt) · [릴리즈 체크리스트](./docs/release-checklist.md)

## 개요

K Typewriter는 서버 렌더링 기반 폴백 콘텐츠, Interactivity API 재생, 다국어 타이핑 지원을 갖춘 동적 Gutenberg 블록입니다.

타이핑 재생은 Beaver Coding의 [UniTyper](https://github.com/beavercoding2022/uni-typer)를 기반으로 구현되어 있습니다.

주요 기능:

- 초기 렌더부터 의미 있는 텍스트를 출력하는 동적 블록
- 첫 메시지 기반 no-JS 폴백과 선택형 커스텀 폴백
- 보조 기술용 비시각 요약 텍스트 지원
- 한글 자모 단위 타이핑 재생
- 첫 시작, 매 사이클, 재진입 시점에 적용할 수 있는 시작 지연 옵션
- 화면에 보일 때 시작하고, 다시 보일 때 처음부터 재생할지 고를 수 있는 옵션
- `ch` 또는 가장 긴 메시지 실측 기준의 인라인 폭 예약
- `auto`, `ltr`, `rtl` 텍스트 방향 제어
- 커서 애니메이션 모드, 두께, 높이, 오프셋 제어
- `p`, `div`, `span`, `h1`-`h6`, `strong`, `em`, `small`, `mark` 태그 선택 지원
- 테마 타이포그래피, 간격, 색상 도구와 자연스럽게 연동

## 바로 쓸 수 있는 패턴

플러그인 활성화 직후 바로 활용할 수 있도록 기본 block pattern도 함께 제공합니다.

- `Hero Headline`: reserve lines가 적용된 중앙 정렬 히어로 헤드라인
- `Inline Keyword Rotator`: 고정 문구와 `inline layout + measure` 를 함께 쓰는 인라인 예시
- `Announcement Strip`: 출시, 마감, 프로모션 공지에 어울리는 짧은 배너
- `Feature Spotlight`: CTA 버튼까지 포함한 실용적인 중간 섹션 인트로
- `Multilingual Spotlight`: 한글, 영어, 아랍어 메시지를 함께 보여주는 예시 섹션
- `Split Launch Hero`: 보조 콘텐츠와 함께 쓰는 왼쪽 정렬 런치 히어로
- `Editorial Section Lead`: 케이스 스터디나 리소스 허브용 섹션 인트로
- `404 Error Prompt`: 이동 경로를 안내하는 친화적인 404 패턴
- `Terminal Simulation`: 개발자/인프라 톤의 터미널 로딩 시퀀스

폭 예약과 레이아웃 안정성 비교처럼 더 실험적인 예시는 starter pattern 대신 Playground의 `Stability Examples` 페이지에서 확인할 수 있습니다.

## Playground 미리보기

WordPress.org 미리보기는 [`.wordpress-org/blueprints/blueprint.json`](./.wordpress-org/blueprints/blueprint.json) 으로 구성되어 있습니다. 첫 WordPress.org 배포 이후에는 플러그인 Advanced 화면에서 public preview 버튼을 켤 수 있습니다.

GitHub 기반 직접 미리보기는 [`.wordpress-org/blueprints/github-playground.json`](./.wordpress-org/blueprints/github-playground.json) 을 사용합니다.

- Raw blueprint:
  [github-playground.json](https://raw.githubusercontent.com/imjlk/k-typewriter/main/.wordpress-org/blueprints/github-playground.json)
- Playground 바로 열기:
  [WordPress Playground](https://playground.wordpress.net/?blueprint-url=https%3A%2F%2Fraw.githubusercontent.com%2Fimjlk%2Fk-typewriter%2Fmain%2F.wordpress-org%2Fblueprints%2Fgithub-playground.json)

## 로컬 개발

```bash
pnpm install
pnpm run build
pnpm run env:start
```

기본 로컬 사이트 주소는 `http://localhost:8888` 입니다.

포트가 이미 사용 중이면:

```bash
WP_ENV_PORT=8898 pnpm run env:start
PLAYWRIGHT_BASE_URL=http://localhost:8898 pnpm run test:smoke
WP_ENV_PORT=8898 pnpm run env:stop
```

## 품질 게이트

```bash
pnpm run lint:js
pnpm run lint:css
pnpm run test:unit
pnpm run build
pnpm run test:smoke
php -l k-typewriter.php
php -l includes/class-k-typewriter-plugin.php
```

참고:

- `test:unit` 은 타이핑 엔진과 공유 attribute helper를 검증합니다.
- `test:smoke` 는 에디터와 프런트 흐름을 검증하지만, 로컬 워드프레스 인스턴스의 Gutenberg UI 구성에 영향을 받을 수 있습니다.
- 로컬 Playground 데모는 `localhost` 대신 `http://127.0.0.1:9410` 로 여는 쪽이 더 안정적입니다.

## 번역

플러그인 번역 자산은 [`languages/`](./languages) 아래에 있습니다.

- 템플릿: `k-typewriter.pot`
- 번들 한국어 번역: `k-typewriter-ko_KR.po`, `k-typewriter-ko_KR.mo`
- 한국어 블록 에디터용 JSON 번역 파일도 함께 커밋되어 있어 직접 설치나 zip 배포에서도 바로 반영됩니다

WordPress.org 에서는 나중에 `translate.wordpress.org` 에서 승인된 번역이 언어팩으로 배포되면, 그 언어팩이 번들 번역보다 우선할 수 있습니다.

## 릴리즈 흐름

1. 품질 게이트를 실행합니다.
2. `.wordpress-org/` 자산과 blueprint를 확인합니다.
3. `pnpm run make:pot` 으로 번역 템플릿을 갱신합니다.
4. 번역이 바뀌었다면 언어 자산도 다시 생성합니다.
5. `v*` 형식으로 태그를 생성합니다.
6. GitHub Actions가 테스트된 zip을 빌드하고 GitHub Release에 첨부하게 합니다.
7. 플러그인 slug가 생긴 뒤에만 `WPORG_DEPLOY_ENABLED=true` 와 `SVN_USERNAME` / `SVN_PASSWORD` 를 설정해 WordPress.org 배포를 켭니다.
8. 첫 배포 후 필요하면 WordPress.org Advanced 화면에서 public Playground preview를 활성화합니다.

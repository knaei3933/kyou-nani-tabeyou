# Supabase MCP 설정 가이드

## 1. Supabase Personal Access Token 생성

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 로그인

2. **Access Token 생성**
   - 우측 상단 프로필 아이콘 클릭
   - `Account Settings` 클릭
   - 좌측 메뉴에서 `Access Tokens` 클릭
   - `Generate new token` 클릭
   - Token 이름 입력 (예: "Claude MCP")
   - `Generate token` 클릭
   - **⚠️ 토큰을 안전한 곳에 복사해두세요! (한 번만 표시됨)**

## 2. Windows 환경 변수 설정

### 방법 1: 시스템 환경 변수 (영구적)
```bash
# PowerShell 관리자 권한으로 실행
[System.Environment]::SetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "여기에_토큰_붙여넣기", "User")
```

### 방법 2: 임시 환경 변수
```bash
# CMD 또는 PowerShell
set SUPABASE_ACCESS_TOKEN=여기에_토큰_붙여넣기
```

## 3. Supabase MCP 재설정

```bash
# 1. 기존 설정 제거
claude mcp remove supabase-mcp

# 2. 환경 변수와 함께 다시 추가
claude mcp add supabase-mcp "npx -y @supabase/mcp-server-supabase@latest --read-only"

# 3. 확인
claude mcp list
```

## 4. 프로젝트별 설정 (선택사항)

특정 프로젝트에만 접근하도록 제한하려면:

```bash
# 프로젝트 ID 찾기
# Supabase Dashboard → Settings → General → Reference ID

# 프로젝트 지정하여 추가
claude mcp add supabase-mcp "npx -y @supabase/mcp-server-supabase@latest --read-only --project-ref=여기에_프로젝트_ID"
```

## 5. 문제 해결

### "Transport is closed" 에러
- Personal Access Token이 설정되지 않았을 때 발생
- 환경 변수가 제대로 설정되었는지 확인

### 연결 실패
- Node.js가 설치되어 있는지 확인
- `npx @supabase/mcp-server-supabase@latest --version` 명령으로 테스트

### Windows 특별 고려사항
- Git Bash 대신 CMD 또는 PowerShell 사용 권장
- 경로에 공백이 있으면 따옴표로 감싸기

## 6. 사용 가능한 명령어

MCP가 정상적으로 연결되면:

```typescript
// 프로젝트 관리
mcp__supabase-mcp__list_projects
mcp__supabase-mcp__get_project

// 데이터베이스
mcp__supabase-mcp__execute_sql
mcp__supabase-mcp__list_tables
mcp__supabase-mcp__apply_migration

// Edge Functions
mcp__supabase-mcp__deploy_edge_function
mcp__supabase-mcp__list_edge_functions

// 모니터링
mcp__supabase-mcp__get_logs
mcp__supabase-mcp__get_advisors
```
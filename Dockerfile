# Node.js 24 공식 이미지 사용
FROM node:24-slim

# Python 3 설치 (AlgoArena 코드 채점기 실행용)
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

# pnpm 활성화
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 의존성 파일 먼저 복사 및 설치
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts
COPY tsconfig*.json ./

# 전체 패키지 설치 (Replit 전용 리눅스 오버라이드 무시하고 현재 환경에 맞게 설치)
RUN pnpm install --no-frozen-lockfile

# 프론트엔드(algoarena) 및 백엔드(api-server) 빌드
RUN pnpm run build

# 빌드된 프론트엔드 정적 파일을 백엔드 public 폴더로 복사
RUN mkdir -p artifacts/api-server/dist/public && \
    cp -r artifacts/algoarena/dist/* artifacts/api-server/dist/public/

# 서버 포트 설정 (Render 기본 포트 10000 또는 8080)
ENV PORT=8080
EXPOSE 8080

# API 서버 실행
CMD ["node", "artifacts/api-server/dist/index.mjs"]

FROM node:18-bullseye

# Install pnpm globally
RUN npm install -g pnpm@9.1.0

# Install PostgreSQL client tools and Playwright dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libnspr4 \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
WORKDIR /workspace

# Set up non-root user
USER node

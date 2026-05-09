FROM node:18-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

RUN npm install --production

# Copy source
COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/server.js"]

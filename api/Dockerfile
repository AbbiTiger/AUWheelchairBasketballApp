# Express + SQLite API
FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /app/data

ENV PORT=7071
ENV DB_PATH=/app/data/apex.db

EXPOSE 7071

CMD ["node", "src/functions/index.js"]

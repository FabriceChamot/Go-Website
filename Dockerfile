FROM node:22-bookworm-slim

ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY public ./public

USER node
EXPOSE 3000
CMD ["node", "src/server.js"]

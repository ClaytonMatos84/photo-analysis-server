FROM node:24-bookworm-slim

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
COPY node_modules ./node_modules
COPY dist ./dist

EXPOSE 3000

ENTRYPOINT ["node", "dist/main.js"]

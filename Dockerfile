# Stage 1: Base Stage
FROM node:18 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .


# Stage 2: Development Stage
FROM base AS development
RUN npm install -g tsx
ENV NODE_ENV=development
EXPOSE 8000 9229
CMD ["tsx", "watch", "--inspect=0.0.0.0:9229", "src/index.ts"]

# Stage 3: Production Stage
FROM base AS production
ENV NODE_ENV=production
RUN npm run build
COPY . .
EXPOSE 8000

CMD ["node", "dist/index.js"]

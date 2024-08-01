FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY /src .

USER node

EXPOSE 8000

CMD ["node", "index.js"]
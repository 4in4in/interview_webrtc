FROM alpine

RUN apk add --update nodejs nodejs-npm

WORKDIR /app

COPY . .

RUN npm ci

EXPOSE 6972

CMD npm run devStart
FROM node:22-alpine AS builder 

WORKDIR /usr/src/app


RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY package*-lock.json ./
RUN npm ci


COPY tsconfig.json ./
COPY . ./

RUN npm run build

FROM node:22-alpine AS runner 

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json 

EXPOSE 3000

CMD ["node", "dist/main.js"]
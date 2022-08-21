# build
FROM node:16 AS builder
WORKDIR /app 
COPY . .

RUN yarn
RUN yarn build

# run 
FROM node:16-alpine
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app ./
CMD ["yarn", "start:prod"]

EXPOSE 4000
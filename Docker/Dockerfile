FROM node:23.1-alpine AS git
RUN apk add git
RUN git clone https://github.com/Mr-LuckyLuc/Discord-Promotion-Bot.git && \
    cd Discord-Promotion-Bot && \
    git fetch --all && \
    git checkout main && \
    git pull origin main
WORKDIR /Discord-Promotion-Bot
RUN npm install

FROM node:lts-alpine
COPY --from=git /Discord-Promotion-Bot .
CMD ["node", "."]

FROM node:17-alpine
RUN wget -qO - https://get.pnpm.io/v6.16.js | node - add --global pnpm

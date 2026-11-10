FROM node:18-alpine As development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS production
ARG NODE_ENV=production
ENV node_env=${node_env}
WORKDIR /usr/src/app
COPY package*.json ./
RUN mpm install --only=production
COPY --from=development /usr/src/app/dist ./dist
USER node
CMD ["node", "dist/main"]
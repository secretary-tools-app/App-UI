FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist/atas-ui/browser ./dist
COPY server.js ./server.js
EXPOSE 8080
ENV PORT=8080
ENV API_URL=https://api-exemplo.up.railway.app/api
CMD ["node", "server.js"]

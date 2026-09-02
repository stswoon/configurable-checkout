FROM node:24.18.0-alpine3.24 AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci

COPY backend backend
COPY frontend frontend
COPY shared shared
RUN npm run build

FROM node:24.18.0-alpine3.24

WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
RUN npm ci --omit=dev

COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/frontend/dist frontend/dist
COPY backend/data backend/data

ENV PORT=3100
EXPOSE ${PORT}
CMD ["npm", "start"]

# docker build . -t configurable-checkout
# docker run --rm --name configurable-checkout -p 8081:8081 -e PORT=8081 configurable-checkout

FROM node:20-alpine AS builder
WORKDIR "/app"
COPY . .
RUN npm install && npm run build && npm prune --production
FROM node:20-alpine AS production
WORKDIR "/app"
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/firebase.json ./firebase.json

EXPOSE 3000
CMD ["sh", "-c", "npm run start:prod"]
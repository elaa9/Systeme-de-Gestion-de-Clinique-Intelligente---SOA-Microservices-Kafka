FROM node:23-alpine
WORKDIR /app
COPY api-gateway/ ./api-gateway/
COPY proto/ ./proto/
WORKDIR /app/api-gateway
RUN npm install --legacy-peer-deps
EXPOSE 3000
CMD ["node", "index.js"]

FROM node:23-alpine
WORKDIR /app
COPY prescription-service/ ./prescription-service/
COPY proto/ ./proto/
WORKDIR /app/prescription-service
RUN npm install --legacy-peer-deps
RUN mkdir -p data
EXPOSE 50053
CMD ["node", "index.js"]

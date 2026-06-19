FROM node:23-alpine
WORKDIR /app
COPY appointment-service/ ./appointment-service/
COPY proto/ ./proto/
WORKDIR /app/appointment-service
RUN npm install --legacy-peer-deps
RUN mkdir -p data
EXPOSE 50052
CMD ["node", "index.js"]

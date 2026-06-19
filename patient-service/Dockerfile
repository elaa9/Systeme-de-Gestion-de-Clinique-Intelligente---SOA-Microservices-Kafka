FROM node:23-alpine
WORKDIR /app
COPY patient-service/ ./patient-service/
COPY proto/ ./proto/
WORKDIR /app/patient-service
RUN npm install --legacy-peer-deps
RUN mkdir -p data
EXPOSE 50051
CMD ["node", "index.js"]

FROM node:23-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN mkdir -p data
EXPOSE 50053
CMD ["node", "index.js"]

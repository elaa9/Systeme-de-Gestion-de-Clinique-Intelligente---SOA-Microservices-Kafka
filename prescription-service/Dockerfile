FROM node:23-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 50053
CMD ["node", "index.js"]

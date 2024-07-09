FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]


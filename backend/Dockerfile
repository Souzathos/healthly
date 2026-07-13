FROM node:22-alpine

WORKDIR /app

# Instala dependências primeiro para aproveitar o cache de camadas
COPY package.json package-lock.json ./
RUN npm install

# Copia o restante do código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

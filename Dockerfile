# Imagem base leve com Node.js 20
FROM node:20-alpine

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

# Instala apenas as dependências de produção (aproveita o cache de camadas)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copia o código da aplicação
COPY src ./src
COPY public ./public

# Executa com usuário sem privilégios de root (o usuário "node" já existe na imagem)
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Verifica periodicamente se a API está saudável
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]

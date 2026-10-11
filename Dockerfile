FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY engine.cjs server.cjs room.cjs ./
COPY public ./public
COPY test ./test
RUN npm test && mkdir -p /app/data && chown -R node:node /app
USER node
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]

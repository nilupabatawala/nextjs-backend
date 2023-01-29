# Stage 1: Install node modules
FROM node:16-alpine as serverModules

RUN apk update && apk add yarn bash && rm -rf /var/cache/apk/*

ENV NODE_ENV=production
WORKDIR /app
COPY package.json  ./
RUN yarn --frozen-lockfile

# install node-prune (https://github.com/tj/node-prune)
RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

# Removes development dependencies
RUN npm prune --production

FROM node:16-alpine as serverBuild
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY --from=serverModules /app/node_modules ./node_modules
COPY . .
EXPOSE 3001

CMD [ "node", "index.js" ]

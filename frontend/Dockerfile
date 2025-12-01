FROM node:18-slim as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --fetch-timeout=60000 --fetch-retries=5

COPY public ./public
COPY src ./src

RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

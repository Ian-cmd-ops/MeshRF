# Stage 1: Base (Dependencies)
FROM node:24-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Builder (Production Build)
FROM base as builder
COPY . .
RUN npm run build

# Stage 2: Production Runner
FROM nginx:alpine

# Copy build artifacts to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Entrypoint Script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Expose HTTP port
EXPOSE 80

# Start Nginx via Entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

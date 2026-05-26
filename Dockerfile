# ==============================
# Stage 1: Build React App
# ==============================
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY react-app/package.json react-app/package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY react-app/ ./

# Build arg for the API URL (default to relative /api for production)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build

# ==============================
# Stage 2: Serve with Nginx
# ==============================
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
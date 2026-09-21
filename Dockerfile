# Stage 1: Build the React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY FRONTEND/package*.json ./
RUN npm install
COPY FRONTEND/ ./
# We pass VITE_API_URL as an empty string so that axios requests use relative paths (e.g. /api/...)
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: Setup the Express Backend
FROM node:18-alpine AS backend-runner
WORKDIR /app
COPY BACKEND/package*.json ./
RUN npm install --omit=dev
COPY BACKEND/ ./

# Copy the built frontend files to the expected location in the backend
COPY --from=frontend-builder /app/frontend/dist /app/FRONTEND/dist

# Expose the backend port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

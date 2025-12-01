FROM node:18-alpine

WORKDIR /app

# Copy package files from root (since backend uses root package.json)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY backend ./backend

# Make startup script executable
RUN chmod +x backend/startup.sh

# Expose port
EXPOSE 4000

# Start with the startup script (seeds DB then starts server)
CMD ["sh", "backend/startup.sh"]

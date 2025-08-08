# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Arguments that can be passed during the build
ARG BACKEND_URL

# Set environment variables
ENV BACKEND_URL=${BACKEND_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application's code
COPY . .

# Expose port 3000
EXPOSE 3000

# Default to dev server; compose may override
CMD ["npm", "run", "dev"]
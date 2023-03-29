FROM node:16

# Update package lists and install dependencies
RUN apt-get update && apt-get install -y \
    libxi-dev \
    libglu1-mesa-dev \
    libglew-dev \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Set up XVFB
ENV DISPLAY=:99
RUN Xvfb :99 -screen 0 1024x768x24 > /dev/null 2>&1 &
ENV PORT=3000

# Set up working directory
WORKDIR /

# Copy package.json and install npm dependencies
COPY package*.json ./
COPY . .
RUN rm -rf node_modules/
RUN npm ci

# Copy source code into container

# Expose port if needed
EXPOSE 3000

# Start the application
CMD [ "npm", "start", "src/app.js" ]

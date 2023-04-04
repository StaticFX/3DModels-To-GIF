FROM python:2.7
FROM node:19

ARG BUILD_DATE
ARG VCS_REF

# Install the dependencies for building gl
RUN apt-get update && apt-get install -y \
        libgl1-mesa-dri \
        libglapi-mesa \
        libosmesa6 \
        mesa-utils \
        xvfb \
 && apt-get clean

# Drivers to build gl
RUN apt-get -y install python cmake libglu1-mesa-dev freeglut3-dev libxi-dev libxmu-dev libglu1-mesa-dev libglew-dev
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/bin/dumb-init
RUN chmod 0777 /usr/bin/dumb-init

# Drivers for node-canvas
RUN apt-get install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

# Activate the virtual environment
ENV PATH="/venv/bin:$PATH"

ENV PORT=3000
ENV DEBUG=false

ENV NODE_PATH /usr/local/lib/node_modules

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./

WORKDIR /app
# Setting xvfb to run gl headless
ENTRYPOINT ["/usr/bin/dumb-init", "--", "xvfb-run", "-s", "-ac -screen 0 1280x1024x24"]
CMD ["node", "src/app.js"]
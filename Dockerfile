FROM node:19
COPY package.json .
RUN apt-get install -y build-essential libxi-dev libglu1-mesa-dev libglew-dev pkg-config
RUN npm install
COPY . .

ENV PORT=3030
CMD node app.js
EXPOSE 5000
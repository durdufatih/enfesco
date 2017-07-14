FROM node:8.1.3
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node server.json
EXPOSE 5000
From node:10
WORKDIR /usr/src/sja_app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "start"]

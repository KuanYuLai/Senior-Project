# Specify base image
FROM node:10

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to working directory
COPY package*.json ./

# Install all node modules specified in package.json/package-lock.json
RUN npm install

COPY . ./

# Expose the port on which the website will be accessible
EXPOSE 3000

# Spin up the website. Make sure to use -d in docker run for detached mode
CMD ["npm", "start"]

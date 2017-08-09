# Source docker
FROM node

RUN npm install pm2 -g

# Install cassandra
RUN apt-get update
RUN apt-get -y install vim
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y cassandra-driver


# Create app directory
RUN mkdir -p /usr/src/app

# Bundle app source
COPY . /usr/src/app
WORKDIR /usr/src/app/server




#install node modules
RUN rm -rf ./node_modules && npm install

# Source docker
FROM node

RUN npm install pm2 -g

# Install mariadb
RUN apt-get update
RUN apt-get -y install vim
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server

# Create app directory
RUN mkdir -p /usr/src/app

# Bundle app source
COPY . /usr/src/app
WORKDIR /usr/src/app/server

# Install database
RUN service mysql start \
#&& echo "CREATE DATABASE predictabledata; CREATE USER 'predictableuser'@'localhost' IDENTIFIED BY 'predictable'; GRANT ALL PRIVILEGES ON predictabledata.* TO 'predictableuser'@'localhost';" | mysql -uroot \
&& mysql -uroot < ./lib/db.sql

#install node modules
RUN rm -rf ./node_modules && npm install

CMD service mysql start && service mysql status && pm2 start server.js --name=dashboard && pm2 logs
EXPOSE 80

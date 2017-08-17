# Source docker
FROM node




RUN apt-get update
RUN apt-get -y install vim


# Create app directory
RUN mkdir -p /usr/src/app

# Bundle app source
COPY . /usr/src/app
WORKDIR /usr/src/app/server




#install node modules
RUN rm -rf ./node_modules && npm install

#install locale zone
RUN bash -c 'echo "Europe/Berlin" > /etc/timezone'
RUN bash -c 'dpkg-reconfigure -f noninteractive tzdata'

CMD node server.js
EXPOSE 80

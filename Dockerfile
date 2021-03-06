# Copyright (C) Air Liquide S.A,  2017
# Author: Sébastien Lalaurette and Cyril Ferté, La Factory, Creative Foundry
# This file is part of Predictable Farm project.
#
# The MIT License (MIT)
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
# See the LICENSE.txt file in this repository for more information.

# Source docker
FROM node

RUN apt-get update
RUN apt-get -y install vim

# Create app directory
RUN mkdir -p /usr/src/app

# Bundle app source
COPY . /usr/src/app
WORKDIR /usr/src/app/server

# Install node modules
RUN rm -rf ./node_modules && npm install

# Install locale zone
RUN bash -c 'echo "Europe/Paris" > /etc/timezone'
RUN bash -c 'dpkg-reconfigure -f noninteractive tzdata'

CMD node server.js
EXPOSE 80

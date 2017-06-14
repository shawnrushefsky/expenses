#!/bin/sh

apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
apt-get update
apt-get upgrade
apt-get install -y virtualbox-guest-additions-iso build-essential screen nodejs npm mongodb-org
service mongod start
npm install --global mocha
ln -s /usr/bin/nodejs /usr/bin/node
# npm install express mocha chai mongodb --save

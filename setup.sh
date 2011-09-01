#!/usr/bin/env bash
# What I had to do on OS X 10.6, which already had Ruby, but I wanted to reinstall node and npm
# 
# This should work as a script for others in the same situation, but it doesn't check the environment into which it is installing.

# mkdir -p tmp
# cd tmp
# # This version is required by Heroku <http://devcenter.heroku.com/articles/node-js>
# curl -O http://nodejs.org/dist/node-v0.4.7.tar.gz
# tar xvfz node-v0.4.7.tar.gz
# cd node-v0.4.7
# configure
# make
# make install
# curl http://npmjs.org/install.sh | sh
# bundle install # need heroku and foreman
# npm install

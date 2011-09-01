#!/usr/bin/env bash
# Development environment setup script.
#
# Author: Benjamin Oakes <hello@benjaminoakes.com>
set -o errexit

function say {
    echo "[setup] $1"
}

# What I had to do on OS X 10.6, which already had Ruby, but I wanted to reinstall node and npm
# 
# This should work as a script for others in the same situation, but it doesn't check the environment into which it is installing.

if [ `which node` == '' ]; then
    say "Installing node"
    mkdir -p tmp
    cd tmp
    # This version is required by Heroku <http://devcenter.heroku.com/articles/node-js>
    curl -O http://nodejs.org/dist/node-v0.4.7.tar.gz
    tar xvfz node-v0.4.7.tar.gz
    cd node-v0.4.7
    configure
    make
    echo "run 'make install'"
    exit -1
fi

if [ `which npm` == '' ]; then
    say "Installing npm"
    curl http://npmjs.org/install.sh | sh
fi

# TODO
# gem install foreman
# gem install heroku

if [ "Darwin" != `uname` ]; then
    say "Installing git-flow"
    brew install git-flow
fi
yes "" | git flow init # use the defaults

npm install

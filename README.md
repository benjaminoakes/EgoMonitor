EgoMonitor
==========

Keep track of "scores" on sites you visit frequently, without having to check mutliple pages, log in and out, etc.

Installing
----------

EgoMonitor isn't ready for public use yet, but will be available at http://egomonitor.herokuapp.com/ (for desktop and mobile, e.g. iPhone and Android) and on the Chrome Web Store (as a Chrome Extension).

Why?
----

I like knowing how many people follow me on Twitter, visit my website, upvote my answers on StackOverflow, install my RubyGems and Chrome extensions, etc.  I've found other apps that do something similar to EgoMonitor, but none cover the services I wanted (and all made it impossible to add more myself).  I also wanted the info available on my phone and desktop.  I couldn't find that, so I'm making it myself.

Also, this is a project for me to learn Node.js and other JavaScript-related technologies such as Chrome Extensions and CouchDB.  The goal is to keep almost everything written in JavaScript as a proof of concept.  I've run into some problems scripting things that are painfully easy with a bash script, but painfully hard with Node.  It's been interesting so far, mostly in good ways.  :)

Getting Started
---------------

To set up the development environment:

    bash setup.sh

Required:

  * A Unix-like OS (such as Mac OS X, Linux, etc) for build scripts and setup scripts
  * Ruby 1.8.7 or 1.9.2 (for command line apps) <http://ruby-lang.org/>
  * (Installed by setup.sh) Node.js v0.4.7 <http://nodejs.org/dist/node-v0.4.7.tar.gz>
  * (Installed by setup.sh) NPM <http://npmjs.org/>

To build the Chrome Extension:

    ./make-crx

This combines files that are normally separate, but shared between the webapp (client-side and server-side) and the Chrome extension.

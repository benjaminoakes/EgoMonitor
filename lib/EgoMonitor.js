var EgoMonitor = (function (root) {
  'use strict';

  /** @module */
  var ns = {};

  /** Thin wrapper around localStorage with convenience functions. */
  ns.Storage = function () { 
    this.storage = root.localStorage;
  };

  ns.Storage.prototype = {
    constructor: ns.Storage,
    get: function (key) {
      if (this.storage) {
        return this.storage.getItem(key);
      }
    },
    set: function (key, value) {
      if (this.storage) {
        return this.storage.setItem(key, JSON.stringify(value));
      }
    },
    clear: function () {
      if (this.storage) {
        return this.storage.clear();
      }
    }
  };

  // Only one instance since it's pointing to localStorage.
  ns.cache = new ns.Storage();

  ns.EgoMonitor = function (config) {
    this.instantiate(config);
  };

  ns.EgoMonitor.prototype = {
    constructor: ns.EgoMonitor,
    instantiate: function (config) {
      this.instances = config.map(function (c) {
        return new ns[c.connector](c.options);
      });
    },

    templates: {
      score: '<li style="list-style-image: url({{iconURL}})"><a href="{{linkURL}}" target="_blank">{{label}}</a> {{score}}</li>'
    },

    refresh: function () {
      var that = this,
          total = 0;

      that.instances.forEach(function (i) {
        i.load(function (data) {
          total += data.score;
          $('#monitors').append(Mustache.to_html(that.templates.score, data));
          $('#total').html(total);
        });
      });
    }
  };

  ns.EgoSource = function () {};
  ns.EgoSource.prototype = {
    constructor: ns.EgoSource,
    key: function () {
      return JSON.stringify(this);
    },
    load: function (callback) {
      var that = this,
          cached = ns.cache.get(that.key()),
          wrappedCallback = function (rawData) {
            ns.cache.set(that.key(), rawData);
            callback(that.transform(rawData));
          };

      if (cached) {
        wrappedCallback(JSON.parse(cached));
      } else {
        jQuery.getJSON(that.jsonpURL(), wrappedCallback);
      }
    }
  };

  return ns;
}(this));

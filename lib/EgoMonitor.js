var EgoMonitor = (function (root) {
  'use strict';

  /** @module */
  var ns = {};

  /** Thin wrapper around localStorage with convenience functions. */
  ns.Storage = function () { 
    this.storage = root.localStorage || {};
  };

  ns.Storage.prototype = {
    constructor: ns.Storage,
    get: function (key) {
      var val;

      if (val = this.storage[key]) {
        return JSON.parse(val);
      }
    },
    set: function (key, value) {
      return this.storage[key] = JSON.stringify(value);
    },
    clear: function () {
      if ('clear' in this.storage) {
        return this.storage.clear();
      } else {
        this.storage = {};
      }
    }
  };

  ns.EgoMonitor = function (config) {
    this.instantiate(config);
    this.cache = new ns.Storage();
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

      that.cache.clear();
      that.instances.forEach(function (i) {
        i.load(that.cache, function (data) {
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
    load: function (cache, callback) {
      var that = this,
          cached = cache.get(that.key()),
          wrappedCallback = function (rawData) {
            cache.set(that.key(), rawData);
            callback(that.map(rawData));
          };

      if (cached) {
        wrappedCallback(cached);
      } else {
        jQuery.getJSON(that.jsonURL(), wrappedCallback);
      }
    }
  };

  return ns;
}(this));

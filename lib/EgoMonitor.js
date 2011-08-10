var EgoMonitor = (function () {
  'use strict';

  /** @module */
  var ns = {};

  /** Thin wrapper around localStorage with convenience functions. */
  ns.Storage = function () { 
    this.storage = localStorage;
  };

  ns.Storage.prototype = {
    constructor: ns.Storage,
    get: function (key) {
      return this.storage.getItem(key);
    },
    set: function (key, value) {
      return this.storage.setItem(key, JSON.stringify(value));
    },
    clear: function () {
      return this.storage.clear();
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
      var that = this;

      that.instances = config.map(function (c) {
        return new ns[c.connector](c.options);
      });
    },

    templates: {
      score: '<li style="list-style-image: url({{iconURL}})">{{label}} {{score}}</li>'
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

  /** 
   * @param options {Object} contains {Number} userID of user to monitor and {String} domain of the StackExchange site
   * @example new StackExchange({domain: 'stackoverflow.com', userID: 146764});
   * @constructor
   */
  ns.StackExchange = function (options) {
    this.domain = options.domain;
    this.userID = options.userID;
  };

  ns.StackExchange.prototype = _.extend(new ns.EgoSource(), {
    constructor: ns.StackExchange,
    /** @const */
    API_URL: 'http://api.%domain/1.1/users/%userID',
    ICON_URL: 'http://%domain/favicon.ico',
    iconURL: function () {
      return this.ICON_URL.replace('%domain', this.domain);
    },
    userURL: function () {
      return this.API_URL.replace('%domain', this.domain).replace('%userID', this.userID);
    },
    jsonpURL: function () {
      return [this.userURL(), 'jsonp=?'].join('?');
    },
    transform: function (rawData) {
      return {
        iconURL: this.iconURL(),
        label: this.domain,
        score: rawData.users[0].reputation,
      };
    },
  });

  ns.Twitter = function (options) {
    this.screenName = options.screenName;
  };

  ns.Twitter.prototype = _.extend(new ns.EgoSource(), {
    constructor: ns.Twitter,
    API_URL: 'http://api.twitter.com/1/followers/ids.json',
    ICON_URL: 'http://twitter.com/favicon.ico',
    jsonpURL: function () {
      return [this.API_URL, '?callback=?&', jQuery.param({screen_name: this.screenName})].join('');
    },
    transform: function (rawData) {
      return {
        iconURL: this.ICON_URL,
        label: this.screenName,
        score: rawData.length,
      };
    },
  });

  ns.RubyGems = function (options) {
    this.gemName = options.gemName;
  };

  ns.RubyGems.prototype = _.extend(new ns.EgoSource(), {
    constructor: ns.RubyGems,
    // API_URL: 'http://rubygems.org/api/v1/versions/%gemName.json',
    API_URL: '/rubygems.json',
    ICON_URL: 'http://rubygems.org/favicon.ico',
    jsonpURL: function () {
      return this.API_URL.replace('%gemName', this.gemName);
    },
    transform: function (rawData) {
      var totalDownloads = 0;

      rawData.forEach(function (versionInfo) {
        totalDownloads += versionInfo.downloads_count;
      });

      return {
        iconURL: this.ICON_URL,
        label: this.gemName,
        score: totalDownloads,
      };
    }
  });

  ns.GitHub = function (options) {
    this.userName = options.userName;
    this.repoName = options.repoName;
  };

  ns.GitHub.prototype = _.extend(new ns.EgoSource(), {
    constructor: ns.GitHub,
    API_URL: 'http://github.com/api/v2/json/repos/show/%userName/%repoName',
    ICON_URL: 'http://github.com/favicon.ico',
    jsonpURL: function () {
      return [this.API_URL.replace('%userName', this.userName).replace('%repoName', this.repoName), 'callback=?'].join('?');
    },
    transform: function (rawData) {
      var repo = rawData.repository;
      return {
        iconURL: this.ICON_URL,
        label: [this.userName, this.repoName].join('/'),
        score: repo.watchers + repo.forks,
      };
    }
  });

  ns.Piwik = function (options) {
    this.host = options.host;
    this.idSite = options.idSite;
    this.beginYear = options.beginYear;
    this.endYear = (new Date()).getFullYear();
    this.tokenAuth = options.tokenAuth;
  };

  ns.Piwik.prototype = _.extend(new ns.EgoSource(), {
    constructor: ns.Piwik,
    ICON_URL: 'http://%host/plugins/CoreHome/templates/images/favicon.ico',
    API_URL: 'http://%host/index.php?module=API&method=VisitsSummary.get&format=JSON&idSite=%idSite&period=year&date=%beginYear-01-01,%endYear-12-31&token_auth=%tokenAuth',
    jsonpURL: function () {
      var s = [
        this.API_URL
          .replace('%host', this.host)
          .replace('%idSite', this.idSite)
          .replace('%beginYear', this.beginYear)
          .replace('%endYear', this.endYear)
          .replace('%tokenAuth', this.tokenAuth),
        'jsoncallback=?'
      ].join('&');
      console.log(s);
      return s;
    },
    /** NOTE Some versions of Piwik have a bad sanitizing regexp that only allow /[a-zA-Z0-9]/ rather than /[a-zA-Z0-9_]/ (notice the underscore), which makes jQuery choke on JSONP requests.  Upgrade to 1.5.1 or above (or fix core/DataTable/Renderer/Json.php). */
    transform: function (rawData) {
      var i, max, score = 0;

      for (i = this.beginYear, max = this.endYear; i <= max; i++) {
        score += rawData[String(i)].nb_visits;
      }

      return {
        iconURL: this.ICON_URL.replace('%host', this.host),
        label: this.host,
        score: score,
      };
    },
  });

  return ns;
}());

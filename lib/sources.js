(function (root) {
  var ns = root.EgoMonitor;

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
    LINK_URL: 'http://%domain/users/%userID',
    iconURL: function () {
      return this.ICON_URL.replace('%domain', this.domain);
    },
    linkURL: function () {
      return this.LINK_URL.replace('%domain', this.domain).replace('%userID', this.userID);
    },
    jsonpURL: function () {
      return [this.API_URL.replace('%domain', this.domain).replace('%userID', this.userID), 'jsonp=?'].join('?');
    },
    map: function (rawData) {
      return {
        iconURL: this.iconURL(),
        linkURL: this.linkURL(),
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
    LINK_URL: 'http://twitter.com/%screenName',
    linkURL: function () {
      return this.LINK_URL.replace('%screenName', this.screenName);
    },
    jsonpURL: function () {
      return [this.API_URL, '?callback=?&', jQuery.param({screen_name: this.screenName})].join('');
    },
    map: function (rawData) {
      return {
        iconURL: this.ICON_URL,
        linkURL: this.linkURL(),
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
    API_URL: '/rubygems.json?gemName=%gemName',
    ICON_URL: 'http://rubygems.org/favicon.ico',
    LINK_URL: 'http://rubygems.org/gems/%gemName',
    jsonpURL: function () {
      return this.API_URL.replace('%gemName', this.gemName);
    },
    linkURL: function () {
      return this.LINK_URL.replace('%gemName', this.gemName);
    },
    map: function (rawData) {
      var totalDownloads = 0;

      rawData.forEach(function (versionInfo) {
        totalDownloads += versionInfo.downloads_count;
      });

      return {
        iconURL: this.ICON_URL,
        linkURL: this.linkURL(),
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
    LINK_URL: 'https://github.com/%userName/%repoName',
    jsonpURL: function () {
      return [this.API_URL.replace('%userName', this.userName).replace('%repoName', this.repoName), 'callback=?'].join('?');
    },
    linkURL: function () {
      return this.LINK_URL.replace('%userName', this.userName).replace('%repoName', this.repoName);
    },
    map: function (rawData) {
      var repo = rawData.repository;
      return {
        iconURL: this.ICON_URL,
        linkURL: this.linkURL(),
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
    // TODO LINK_URL
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
    map: function (rawData) {
      var i, max, score = 0;

      for (i = this.beginYear, max = this.endYear; i <= max; i++) {
        score += rawData[String(i)].nb_visits;
      }

      return {
        iconURL: this.ICON_URL.replace('%host', this.host),
        // TODO linkURL
        label: this.host,
        score: score,
      };
    },
  });
}(this));

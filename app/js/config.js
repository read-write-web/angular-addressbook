'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp.configuration', [])
  .factory('CORS_PROXY_CFG',function(){
    return {
      enabled: true,
      corsProxifyUrl: function corsProxifyUrl(uri) {
        // return 'http://data.fm/proxy?uri='+encodeURIComponent(uri);
        return 'https://localhost:8443/srv/cors?url='+encodeURIComponent(uri);
      }
    }
  });

;

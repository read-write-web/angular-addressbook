'use strict';

/* Filters */

angular.module('myApp.filters', [])

  .filter('predicate', ['RdfPointedGraphService',function(RdfPointedGraphService) {
    return function predicate(pointedGraph,predicate) {
      if ( pointedGraph ) {
        return RdfPointedGraphService.findFirstObject(pointedGraph,predicate);
      }
    };
  }])

  .filter('splitNewLines', function () {
    return function(text) {
      if ( text ) {
        return text.split(/\n/g);
      }
    }
  })

  .filter('unsafe', ['$sce',function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  }])

;

'use strict';

/* Filters */

angular.module('myApp.filters', [])

  .filter('predicate', ['RdfPointedGraphService',function(RdfPointedGraphService) {
    return function predicateFilter(pointedGraph,predicateVal) {
      if ( pointedGraph ) {
        return RdfPointedGraphService.findFirstObjectByPredicateArray(pointedGraph,[predicateVal]);
      }
    };
  }])

  .filter('splitNewLines', function () {
    return function splitNewLines(text) {
      if ( text ) {
        return text.split(/\n/g);
      }
    }
  })

  .filter('unsafe', ['$sce',function($sce) {
    return function unsafe(val) {
      return $sce.trustAsHtml(val);
    };
  }])

;

'use strict';

/* Filters */

angular.module('myApp.filters', [])

  .filter('predicate', ['RdfPointedGraphService',function(RdfPointedGraphService) {
    return function predicateFilter(pointedGraph,predicate) {
      if ( pointedGraph ) {
        return RdfPointedGraphService.findFirstObjectByPredicate(pointedGraph,predicate);
      }
    };
  }])

  .filter('predicateIn', ['RdfPointedGraphService',function(RdfPointedGraphService) {
    return function predicateInFilter(pointedGraph,predicateArray) {
      if ( pointedGraph ) {
        return RdfPointedGraphService.findFirstObjectByPredicateArray(pointedGraph,predicateArray);
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

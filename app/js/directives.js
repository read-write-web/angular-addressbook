'use strict';

/* Directives */


angular.module('myApp.directives', [])


  .directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])

  .directive('foafPerson', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/person.html',
      scope: {
        personPg: '=',
        onPersonClick: '&'
      }
    };
  })


  .directive('rdfPredicateBinding',['RdfPointedGraphService',function(RdfPointedGraphService) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        ngModel: '=',
        rdfPredicateBinding: '@rdfPredicateBinding'
      },
      link: function(scope, elm, attrs, ngModelCtrl) {
        var predicate = scope.rdfPredicateBinding;

        ngModelCtrl.$formatters.push(function formatter(pointedGraph) {
          if (pointedGraph) {
            var object = RdfPointedGraphService.findFirstObject(pointedGraph,predicate);
            return object;
          }
        });

        ngModelCtrl.$parsers.push(function parser(value) {
          var pg = scope.ngModel;
          return RdfPointedGraphService.createOrReplaceObject(pg,predicate,value);
        });

        // model -> view
        ngModelCtrl.$render = function() {
          console.error("Will render" + ngModelCtrl.$viewValue)
          elm.val(ngModelCtrl.$viewValue);
        };
      }
    };
  }])


;

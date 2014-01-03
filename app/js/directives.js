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
        personModel: '=',
        onPersonClick: '&'
      }
    };
  })


  .directive('rdfPredicateBinding',['RdfGraphService',function(RdfGraphService) {
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
            var object = RdfGraphService.findFirstObject(pointedGraph.graph,pointedGraph.pointer,predicate);
            return object;
          }
        });

        ngModelCtrl.$parsers.push(function parser(value) {
          var pg = scope.ngModel;
          var newGraph = RdfGraphService.createOrReplaceObject(pg.graph,pg.pointer,predicate,value);
          return {
            graph: newGraph,
            pointer: pg.pointer
          }
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

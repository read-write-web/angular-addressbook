'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'ngSanitize',
    'jmdobry.angular-cache',
    'myApp.configuration',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers'
  ])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/personProfile', {templateUrl: 'partials/personProfile.html', controller: 'PersonProfileCtrl'});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/personProfile'});
  }])
;

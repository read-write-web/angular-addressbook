'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'ngSanitize',
    'pasvaz.bindonce',
    'jmdobry.angular-cache',
    'myApp.configuration',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers'
  ])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/personProfile', {templateUrl: 'partials/personProfile.html', controller: 'PersonProfileCtrl'});
    $routeProvider.when('/testPartial', {templateUrl: 'partials/testPartial.html', controller: 'PersonProfileCtrl'});
    $routeProvider.otherwise({redirectTo: '/testPartial'});
  }])
;

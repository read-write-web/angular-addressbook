'use strict';

/* Controllers */

angular.module('myApp.controllers', [])


  .controller('PersonProfileCtrl', ['$scope','$location','RdfStore','RdfPointedGraphService',function($scope,$location,RdfStore,RdfPointedGraphService) {


    // var defaultProfileUri = 'https://my-profile.eu/people/deiu/card#me';
    var defaultProfileUri = 'http://bblfish.net/people/henry/card#me';



    $location.hash($scope.currentProfileUri);
    if ( $location.hash() ) {
      $scope.currentProfileUri = $location.hash();
    } else {
      $location.hash(defaultProfileUri);
      $scope.currentProfileUri = defaultProfileUri;
    }


    $scope.$watch('currentProfileUri', function() {
      console.debug("Change current profile uri called with " + $scope.currentProfileUri);
      loadFullProfile($scope.currentProfileUri);
    })

    $scope.changeCurrentProfileUri = function changeCurrentProfileUri(uri) {
      $scope.currentProfileUri = uri;
      $location.hash($scope.currentProfileUri);
    }


    function loadFullProfile(subject) {
      console.info("will render profile: " + subject)
      $scope.personPg = null;
      // we don't want to capture the scope variable in the closure because there may be concurrency issues
      var relationshipsPgArray = [];
      $scope.relationshipPgs = relationshipsPgArray;
      RdfPointedGraphService.fetch(subject).then(
        function(personPg) {
          $scope.personPg = personPg
          RdfPointedGraphService.oneToManySequential(personPg,'foaf:knows',function onRelationshipFound(relationshipPg) {
            relationshipsPgArray.push(relationshipPg);
          });
        },function(reason) {
          if (reason.status) {
            console.error("Request error with status code "+reason.status+" for URI:" +subject);
          } else {
            console.error("Can't retrieve full profile at "+subject+" because of: "+JSON.stringify(reason));
          }
        });
    }

  }])






  .controller('MyCtrl2', [function() {

  }]);
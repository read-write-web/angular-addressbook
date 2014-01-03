'use strict';

/* Controllers */

angular.module('myApp.controllers', [])


  .controller('MyCtrl1', ['$scope', 'RdfStore','RdfHttpService','RdfGraphService',function($scope,RdfStore,RdfHttpService,RdfGraphService) {


    $scope.errorLogs = [];
    $scope.currentProfileUri = 'https://my-profile.eu/people/deiu/card#me';

    $scope.$watch('currentProfileUri', function() {
      console.debug("Change current profile uri called with " + $scope.currentProfileUri);
      $scope.errorLogs.length = 0;
      loadFullProfile($scope.currentProfileUri);
    })

    $scope.changeCurrentProfileUri = function changeCurrentProfileUri(uri) {
      $scope.currentProfileUri = uri;
    }


    function loadFullProfile(subject) {
      console.info("will render profile: " + subject)
      $scope.person = undefined;
      $scope.relationships = [];
      $scope.relationshipsPG = [];
      RdfHttpService.fetchPointedGraph(subject).then(function(profileGraph) {
        $scope.person = toProfileModel(profileGraph,subject);
        $scope.personPG = {
          graph: profileGraph,
          pointer: subject
        }
        getRelationshipGraphs(profileGraph,subject,function onRelationshipFound(relationshipProfileGraph,relationshipSubject) {
          $scope.relationships.push( toProfileModel(relationshipProfileGraph,relationshipSubject) );
          $scope.relationshipsPG.push({
            graph: relationshipProfileGraph,
            pointer: relationshipSubject
          });
        });
      },function(error) {
        $scope.errorLogs.push("Can't retrieve full profile at "+uri+" because of: "+error);
      });
    }


    function getRelationshipGraphs(profileGraph,subject,onRelationshipFound) {
      var uris = RdfGraphService.findAllObjects(profileGraph,subject,'foaf:knows')
      console.debug("Relationships are: " + uris);
      _.forEach(uris, function(uri) {
        RdfHttpService.fetchPointedGraph(uri).then(function(profileGraph) {
          if ( profileGraph.toArray().length > 0 ) {
            onRelationshipFound(profileGraph,uri);
          } else {
            $scope.errorLogs.push("It seems the graph is empty for relationship uri "+uri);
          }
        },function(error) {
          $scope.errorLogs.push("Can't retrieve relationship at "+uri+" because of: "+error);
        });
      });
    }



    function toProfileModel(graph,subject) {
      var name = RdfGraphService.findFirstObject(graph,subject,"foaf:name");
      var givenName = RdfGraphService.findFirstObject(graph,subject,"foaf:givenName");
      var familyName = RdfGraphService.findFirstObject(graph,subject,"foaf:familyName");
      var img = RdfGraphService.findFirstObject(graph,subject,"foaf:img");
      var nick = RdfGraphService.findFirstObject(graph,subject,"foaf:nick");
      var mbox = RdfGraphService.findFirstObject(graph,subject,"foaf:mbox");
      var homepage = RdfGraphService.findFirstObject(graph,subject,"foaf:homepage");
      return {
        uri: subject,
        name: name,
        givenName: givenName,
        familyName: familyName,
        img: img,
        nick: nick,
        mbox: mbox,
        homepage: homepage
      }
    }


  }])









  .controller('MyCtrl2', [function() {

  }]);
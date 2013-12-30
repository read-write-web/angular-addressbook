'use strict';

/* Controllers */

angular.module('myApp.controllers', [])


  .controller('MyCtrl1', ['$scope', 'RdfStore','RdfHttpService',function($scope,RdfStore,RdfHttpService) {


    $scope.$watch('profileUri', function() {
      $scope.errorLogs.length = 0;
      loadFullProfile($scope.profileUri);
    })

    $scope.errorLogs = [];
    $scope.profileUri = 'https://my-profile.eu/people/deiu/card#me';


    $scope.changeProfileUri = function(newUri) {
      $scope.profileUri = newUri;
    }


    function loadFullProfile(uriWithFragment) {
      console.info("will render profile: " + uriWithFragment)
      $scope.profile = undefined;
      $scope.relationships = [];
      RdfHttpService.fetchPointedGraph(uriWithFragment).then(function(profileGraph) {
        $scope.profile = toProfileModel(profileGraph,uriWithFragment);
        getRelationshipGraphs(profileGraph,function(relationshipProfileGraph,uri) {
          $scope.relationships.push( toProfileModel(relationshipProfileGraph,uri) );
        });
      },function(error) {
        $scope.errorLogs.push("Can't retrieve full profile at "+uri+" because of: "+error);
      });
    }



    function getRelationshipGraphs(profileGraph, onRelationshipFound) {
      var uris = findAll(profileGraph,'foaf:knows')
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




    function findAll(graph,predicate) {
      var predicateNode = RdfStore.rdf.createNamedNode(RdfStore.rdf.resolve(predicate));
      var triples = graph.match(null,predicateNode, null).toArray();
      return _.map(triples, function(t){ return t.object.valueOf() });
    }

    function findFirst(graph,predicate) {
      return getFirstOrUndefined(findAll(graph,predicate));
    }

    function getFirstOrUndefined(array) {
      if ( array.length > 0 ) {
        return array[0];
      } else {
        return undefined;
      }
    }

    function toProfileModel(graph,uri) {
      var name = findFirst(graph,"foaf:name");
      var givenName = findFirst(graph,"foaf:givenName");
      var familyName = findFirst(graph,"foaf:familyName");
      var img = findFirst(graph,"foaf:img");
      var nick = findFirst(graph,"foaf:nick");
      var mbox = findFirst(graph,"foaf:mbox");
      var homepage = findFirst(graph,"foaf:homepage");
      return {
        uri: uri,
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
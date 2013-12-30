'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])

  .value('version',
    '0.1'
  )

  .factory('RdfStore',
    rdfstore.create
  )

  .service('RdfHttpService',['$http','$q','RdfStore',function($http,$q,RdfStore) {

    // TODO, for now we only accept turtle, no content negociation
    var todoOnlyMimeType = 'text/turtle'

    var config =
    {
      headers:  {
        'Accept': todoOnlyMimeType
      }
    };

    var self = this;

    this.fetchPointedGraph = function(uriWithFragment) {
      var fragmentlessUri = removeFragment(uriWithFragment);
      console.info("Will fetch profile "+fragmentlessUri)
      return self.fetchGraph(fragmentlessUri)
        .then(function(graph) {
          return pointed(graph,uriWithFragment);
        });
    };


    this.fetchGraph = function fetchGraph(uri) {
      return $http.get(uri,config)
        .then(function(response) {
          var contentType = response.headers("Content-Type");
          console.debug("It seems we got a response with mimeType "+contentType + " from "+ uri+" - will try to parse it as a graph");
          return loadGraph(uri,response.data,contentType);
        })
        .then(function(triplesLoaded) {
          return getGraph(uri);
        });
    };

    function loadGraph(graphUri,graphData,graphMimeType) {
      var deferred = $q.defer();
      RdfStore.load(graphMimeType,graphData,graphUri,function(success, results) {
        if ( success ) {
          deferred.resolve(results);
        } else {
          deferred.reject("Can't LOAD graph with GraphURI="+graphUri+" and graphMimeType="+graphMimeType+" -> "+results);
        }
      });
      return deferred.promise;
    }

    function getGraph(graphUri) {
      var deferred = $q.defer();
      RdfStore.graph(graphUri,function(success,graph){
        if ( success ) {
          deferred.resolve(graph);
        } else {
          deferred.reject("Can't GET graph with GraphURI="+graphUri);
        }
      });
      return deferred.promise;
    }

    function pointed(graph,subject) {
      var subjectNode = RdfStore.rdf.createNamedNode(subject);
      return graph.match(subjectNode,null,null);
    }

    function removeFragment(uri) {
      var index = uri.indexOf('#');
      if (index > 0) {
        return uri.substring(0, index);
      } else {
        return uri;
      }
    }


  }])

;

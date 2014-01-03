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

  .service('RdfGraphService',['RdfStore',function(RdfStore) {

    var self = this;

    this.createOrReplaceObject = function createOrReplaceObject(graph,subject,predicate,newObjectValue) {
      var subjectNode = RdfStore.rdf.createNamedNode(subject);
      var predicateNode = RdfStore.rdf.createNamedNode(RdfStore.rdf.resolve(predicate));
      var newObjectLiteral = RdfStore.rdf.createLiteral(newObjectValue);
      console.log("subject node: " + subjectNode);
      console.log("predicate node: " + predicateNode);
      console.log("literal node: " + newObjectLiteral);
      graph.removeMatches(subjectNode,predicateNode,null);
      graph.add(RdfStore.rdf.createTriple(subjectNode,predicateNode,newObjectLiteral));
      return graph;
    }

    this.findAllObjects = function findAllObjects(graph,subject,predicate) {
      var subjectNode = RdfStore.rdf.createNamedNode(subject);
      var predicateNode = RdfStore.rdf.createNamedNode(RdfStore.rdf.resolve(predicate));
      var triples = graph.match(subjectNode,predicateNode, null).toArray();
      return _.map(triples, function(t){ return t.object.valueOf() });
    }

    this.findFirstObject = function findFirstObject(graph,subject,predicate) {
      return getFirstOrUndefined(self.findAllObjects(graph,subject,predicate));
    }

    function getFirstOrUndefined(array) {
      if ( array.length > 0 ) {
        return array[0];
      } else {
        return undefined;
      }
    }


  }])



  .service('RdfHttpService',['$http','$q','RdfStore',function($http,$q,RdfStore) {


    var config =
    {
      headers:  {
        'Accept': 'text/turtle' // TODO, and take care, rdfstore doesn't support natively rdf+xml
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

    // TODO bad: this remove other predicates of the graph
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

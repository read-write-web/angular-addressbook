'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', [])

  .value('version',
    '0.1'
  )

  .provider('RdfEnv',function() {
    this.$get = function($http) {
      return rdfstore.create().rdf;
    }
  })




  .service('RdfParser',['$q',function($q) {
    // TODO see https://github.com/antoniogarrote/rdfstore-js/issues/70
    // it seems we need to create a different rdfstore instance each time to avoid a concurrency issue :(

    this.parseGraph = function parseGraph(graphUri, graphData, graphMimeType) {
      var deferred = $q.defer();
      var temporaryRdfStore = rdfstore.create();
      temporaryRdfStore.load(graphMimeType, graphData, function(success, results) {
        if ( success ) {
          temporaryRdfStore.graph(function(success,graph){
            if ( success ) {
              deferred.resolve(graph);
            } else {
              deferred.reject("Can't GET graph with GraphURI="+graphUri);
            }
          });
        } else {
          deferred.reject("Can't LOAD graph with GraphURI="+graphUri+" and graphMimeType="+graphMimeType+" -> "+results);
        }
      });
      return deferred.promise;
    }
  }])



  .service('RdfGraphService',['RdfEnv',function(RdfEnv) {

    var self = this;

    this.createOrReplaceObject = function createOrReplaceObject(graph,subject,predicate,newObjectValue) {
      var subjectNode = RdfEnv.createNamedNode(subject);
      var predicateNode = RdfEnv.createNamedNode(RdfEnv.resolve(predicate));
      var newObjectLiteral = RdfEnv.createLiteral(newObjectValue);
      graph.removeMatches(subjectNode,predicateNode,null);
      graph.add(RdfEnv.createTriple(subjectNode,predicateNode,newObjectLiteral));
      return graph;
    }

    this.findAllObjects = function findAllObjects(graph,subject,predicate) {
      var subjectNode = RdfEnv.createNamedNode(subject);
      var predicateNode = RdfEnv.createNamedNode(RdfEnv.resolve(predicate));
      var triples = graph.match(subjectNode,predicateNode, null).toArray();
      var matches = _.map(triples, function(t){ return t.object.valueOf() });
      if ( matches.length == 0 ) {
        // console.warn("No object found for subject ["+subject+"] and predicate ["+predicate+"] in graph");
      }
      return matches;
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




  .service('RdfPointedGraphService',['RdfGraphService','RdfHttpService',function(RdfGraphService,RdfHttpService) {

    var self = this;

    this.pointedGraph = function pointedGraph(graph,subject) {
      return {
        graph: graph,
        subject: subject
      }
    }

    this.createOrReplaceObject = function createOrReplaceObject(pointedGraph,predicate,newObjectValue) {
      var newGraph = RdfGraphService.createOrReplaceObject(pointedGraph.graph,pointedGraph.subject,predicate,newObjectValue);
      return self.pointedGraph( newGraph, pointedGraph.subject );
    }

    this.findAllObjects = function findAllObjects(pointedGraph,predicate) {
      return RdfGraphService.findAllObjects(pointedGraph.graph,pointedGraph.subject,predicate);
    }

    this.findFirstObject = function findFirstObject(pointedGraph,predicate) {
      return RdfGraphService.findFirstObject(pointedGraph.graph,pointedGraph.subject,predicate);
    }


    // permits to retrieve the pointed graphs for a given predicate of a given pointed graph
    // ex: oneToManyFetch(personPg,'foaf:knows',callback); will call the callback with all the friends pointed graphs of the personPg
    // TODO return a stream instead of calling a callback (use RxJS?)
    this.oneToMany = function oneToMany(pointedGraph,predicate,onPointedGraphRetrieved) {
      var objects = self.findAllObjects(pointedGraph,predicate);
      // TODO handle that not all rels are uris, it can be blank nodes etc...
      var uris = objects.filter(validUrl)
      console.debug("Subject: "+pointedGraph.subject+" -> Relations for "+predicate+" uris are: " + JSON.stringify(uris));
      _.forEach(uris, function(uri) {
        self.fetch(uri).then(
          function(relPg) {
            onPointedGraphRetrieved(relPg);
          },
          function(reason) {
            if (reason.status || reason.status == 0) {
              console.error("Request error with status code "+reason.status+" for URI:" +uri);
            }
            else {
              console.error("Can't retrieve relationship at "+uri+" because of: "+JSON.stringify(reason));
            }
          });
      });
    }


    function validUrl(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      if(!pattern.test(str)) {
        return false;
      } else {
        return true;
      }
    }

    this.fetch = function(uriWithFragment) {
      var fragmentlessUri = removeFragment(uriWithFragment);
      console.debug("Will fetch uri "+fragmentlessUri)
      return RdfHttpService.fetchGraph(fragmentlessUri)
        .then(function(graph) {
          return self.pointedGraph( graph, uriWithFragment );
        });
    };

    function removeFragment(uri) {
      var index = uri.indexOf('#');
      if (index > 0) {
        return uri.substring(0, index);
      } else {
        return uri;
      }
    }

  }])



  .service('RdfHttpService',['$http','$q','RdfParser','CORS_PROXY_CFG','$angularCacheFactory',function($http,$q,RdfParser,CORS_PROXY_CFG,$angularCacheFactory) {

    // TODO externalize this cache config
    // see documentation here: http://jmdobry.github.io/angular-cache/
    var httpCache = $angularCacheFactory("httpCache", {
      maxAge: 120000,
      cacheFlushInterval: 60000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage',
      onExpire: function (key, value) {
        console.info("Expired from http cache: " + key);
      }
    });
    console.error("httpCache : " + httpCache);

    var config =
    {
      headers:  {
        'Accept': 'text/turtle' // TODO, and take care, rdfstore doesn't support natively rdf+xml
      },
      timeout: 10000
      // cache: httpCache // TODO make caching work fine!
    };

    var self = this;


    this.fetchGraph = function fetchGraph(uri) {
      var uriToFetch = maybeCorsProxifiedUri(uri);
      return $http.get(uriToFetch,config)
        .then(function(response) {
          var mimeType = parseMimeType(response);
          console.debug("It seems we got a response with mimeType "+mimeType + " from "+ uri+" - will try to parse it as a graph");
          return RdfParser.parseGraph(uri, response.data, mimeType);
        })
    };



    // TODO this must be checked, but we need to be able to extract the mime type
    // sometimes the charset is provided; like "Content-Type:text/turtle; charset=utf-8"
    // and it breaks RDFStore
    function parseMimeType(response) {
      return response.headers("Content-Type").split(";")[0];
    }

    function maybeCorsProxifiedUri(uri) {
      if ( CORS_PROXY_CFG.enabled ) {
        return CORS_PROXY_CFG.corsProxifyUrl(uri);
      } else {
        return uri;
      }
    }

  }])



;

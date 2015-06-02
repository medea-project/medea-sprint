;(function(ns, $, undefined){
  'use strict';

  ns.sourceFile = 'bridge_authors_by_ar_wg_chapter.csv'
  ns.structure = {1:{}, 2:{}, 3:{}, 4:{}, 5:{}} // ARs
  ns.wgSizes = {}

  var roleWeight = {
    'CLA': 4,
    'LA': 3,
    'RE': 3,
    'CA': 2
  }

  ns.run = function(){
    ns.loadFile(
      ns.process // callback
    )
  }

  ns.loadFile = function(callback){
     d3.csv(ns.sourceFile, callback)
  }

  ns.process = function(data){
    console.log('Parsed data', data)
    window.d = data // To have access in the console

    // Index working groups and chapters
    data.forEach(function(obj){
      // Init WG in each AR
      ns.structure[obj.AR][obj.WG] = {}
    })
    data.forEach(function(obj){
      // Titles
      ns.structure[obj.AR][obj.WG][obj['Chapter #']] = ns.structure[obj.AR][obj.WG][obj['Chapter #']] || obj['Chapter Title']
    })
    console.log('Structure', ns.structure)

    ns.data = data

    // Start processing
    ns.processAR(1)

  }

  ns.processAR = function(ar){

    var table = ns.data
    // Filter nodes present in the right AR
    .filter(function(obj){
        return obj.AR == ''+ar
      })
    // Build a table with minimal columns
    .map(function(obj){
        return [obj['Bridge Author'],
        obj['WG'] + ' - ' + obj['Chapter #'] + ' - ' + obj['AR'],
        obj['WG'],
        roleWeight[obj['Role']]
        ];
      })

    // Table headline
    table.unshift(['Author', 'Chapter', 'WG', 'RoleCoef'])

    // Build the network
    var settings = {
      mode: 'bipartite'
      ,nodesColumnId1: 0
      ,nodesMetadataColumnIds1: [2]
      ,nodesColumnId2: 1
      ,nodesMetadataColumnIds2: []
      ,weightEdges: true
      ,jsonCallback: function(json){

        // Build indexes
        json_graph_api.buildIndexes(json)

        json = ns.filterByMultipleWG(json)

        ns.setCoordinates(json, [ar])
        ns.makeUp(json)

        console.log('AR '+ar, json)

        // Download
        var blob = new Blob(json_graph_api.buildGEXF(json), {'type':'text/gexf+xml;charset=utf-8'})
        ,filename = "Bridges for AR " + ar + ".gexf"
        console.log('filename ' + filename)
        saveAs(blob, filename)

        if(ar < 5){
          ns.processAR(ar + 1)
        } else {
          ns.processIntraAR()
        }
      }
    }
    table2net.buildGraph(table, settings)

  }

  ns.processIntraAR = function(){

    var table = ns.data
    // Build a table with minimal columns
    .map(function(obj){
        return [
          obj['Bridge Author']
          ,obj['WG'] + ' - ' + obj['Chapter #'] + ' - ' + obj['AR']
          ,obj['WG']
          ,obj['AR']
          ,obj['WG'] + ' / AR '+obj['AR']
          ,roleWeight[obj['Role']]
        ]
      })

    // Table headline
    table.unshift(['Author', 'Chapter', 'WG', 'AR', 'WGxAR', 'RoleCoef'])

    // Build the network
    var settings = {
      mode: 'bipartite'
      ,nodesColumnId1: 0
      ,nodesMetadataColumnIds1: [4]
      ,nodesColumnId2: 1
      ,nodesMetadataColumnIds2: [2, 3]
      ,weightEdges: true
      ,jsonCallback: function(json){
        console.log('IntraAR json before', json)
        // Build indexes
        json_graph_api.buildIndexes(json)

        json = ns.filterIntraARBridges(json)

        ns.setCoordinates(json, [1, 2, 3, 4, 5])

        ns.makeUp(json)
        console.log('IntraAR json after', json)
        // Download
        var blob = new Blob(json_graph_api.buildGEXF(json), {'type':'text/gexf+xml;charset=utf-8'})
        ,filename = "Bridges Intra AR.gexf"
        console.log('filename ' + filename)
        saveAs(blob, filename)

        ns.processInterAR()
      }
    }
    table2net.buildGraph(table, settings)

  }

  ns.processInterAR = function(){

    var table = ns.data
    // Build a table with minimal columns
    .map(function(obj){
        return [
          obj['Bridge Author']
          ,obj['WG'] + ' - ' + obj['Chapter #'] + ' - ' + obj['AR']
          ,obj['WG']
          ,obj['AR']
          ,obj['WG'] + ' / AR '+obj['AR']
          ,roleWeight[obj['Role']]
        ]
      })

    // Table headline
    table.unshift(['Author', 'Chapter', 'WG', 'AR', 'WGxAR', 'RoleCoef'])

    // Build the network
    var settings = {
      mode: 'bipartite'
      ,nodesColumnId1: 0
      ,nodesMetadataColumnIds1: [4]
      ,nodesColumnId2: 1
      ,nodesMetadataColumnIds2: [2, 3]
      ,weightEdges: true
      ,jsonCallback: function(json){
        console.log('InterAR json before', json)
        // Build indexes
        json_graph_api.buildIndexes(json)

        json = ns.filterInterARBridges(json)

        ns.setCoordinates(json, [1, 2, 3, 4, 5])

        ns.makeUp(json)
        console.log('InterAR json after', json)

        // Download
        var blob = new Blob(json_graph_api.buildGEXF(json), {'type':'text/gexf+xml;charset=utf-8'})
        ,filename = "Bridges Inter AR.gexf"
        console.log('filename ' + filename)
        saveAs(blob, filename)

      }
    }
    console.log('tabletable', table);
    table2net.buildGraph(table, settings)

  }

  ns.filterInterARBridges = function(g){

    var nodesToRemove = g.nodes.filter(function(n){
      return n.attributes_byId.attr_type == 'Author'
    }).filter(function(n){
      // We search for nodes that have different WG in different AR
      var WGxAR = n.attributes_byId.attr_1_4.split(' | ')
      return !WGxAR.some(function(d, i){
        var dsplit = d.split(' / ')
        ,wg = dsplit[0]
        ,ar = dsplit[1]

        return WGxAR.some(function(d2, j){
          if(j <= i)
            return false
          var d2split = d2.split(' / ')
          ,wg2 = d2split[0]
          ,ar2 = d2split[1]
          return wg != wg2 && ar != ar2
        })
      })
    }).map(function(n){
      return n.id
    })

    g = json_graph_api.getBackbone(g)
    g.nodes = g.nodes.filter(function(n){
      return nodesToRemove.indexOf(n.id) < 0
    })
    g.edges = g.edges.filter(function(e){
      return nodesToRemove.indexOf(e.sourceID) < 0 && nodesToRemove.indexOf(e.targetID) < 0
    })

    json_graph_api.buildIndexes(g)

    return g
  }

  ns.filterIntraARBridges = function(g){
    console.log(g)
    var nodesToRemove = g.nodes.filter(function(n){
      return n.attributes_byId.attr_type == 'Author'
    }).filter(function(n){
      // We search for nodes that have different WG in the same AR
      var ars = [1,2,3,4,5]
      ,wgByAr = {}
      ars.forEach(function(ar){
        wgByAr[ar] = []
      })
      n.attributes_byId.attr_1_4.split(' | ').forEach(function(d){
        var dsplit = d.split(' / ')
        ,wg = dsplit[0]
        ,ar = +dsplit[1].split(' ')[1]
        wgByAr[ar].push(wg)
      })
      return !ars.some(function(ar){
        return wgByAr[ar].length > 1
      })
    }).map(function(n){
      return n.id
    })

    g = json_graph_api.getBackbone(g)
    g.nodes = g.nodes.filter(function(n){
      return nodesToRemove.indexOf(n.id) < 0
    })
    g.edges = g.edges.filter(function(e){
      return nodesToRemove.indexOf(e.sourceID) < 0 && nodesToRemove.indexOf(e.targetID) < 0
    })

    json_graph_api.buildIndexes(g)

    return g
  }

  ns.filterByMultipleWG = function(g){
    var nodesToRemove = g.nodes.filter(function(n){
      return n.attributes_byId.attr_type == 'Author'
    }).filter(function(n){
      // Multiple WG will create a string with the pipe ("|") separator.
      // No pipe means: not a bridge
      return n.attributes_byId.attr_1_2.indexOf('|') < 0
    }).map(function(n){
      return n.id
    })

    g = json_graph_api.getBackbone(g)
    g.nodes = g.nodes.filter(function(n){
      return nodesToRemove.indexOf(n.id) < 0
    })
    g.edges = g.edges.filter(function(e){
      return nodesToRemove.indexOf(e.sourceID) < 0 && nodesToRemove.indexOf(e.targetID) < 0
    })

    json_graph_api.buildIndexes(g)

    return g
  }

  ns.setCoordinates = function(g, ar_list){
    var chapterCoordinates = {}
    ,chapterNames = {}
    ,x
    ,y
    ,i
    ,percent
    ,r = 1000 // Radius
    ,jitter = 10
    ,wgOrderedList = ['WG I', 'WG II', 'WG III']
    ,wgSizes = {}
    ,ar_current

    wgOrderedList.forEach(function(wg){
      wgSizes[wg] = 0
    })

    ar_list.forEach(function(ar){
      wgOrderedList.forEach(function(wg){
        for(var ch in ns.structure[ar][wg]){
          wgSizes[wg]++
        }
      })
    })
    wgOrderedList.forEach(function(wg){
      ar_current = 0
      ar_list.forEach(function(ar){
        i = 0
        for(var ch in ns.structure[ar][wg]){
          percent = (ar_current + i) / (wgSizes[wg] - 1)
          i++
          if(wg == 'WG I'){
            x = r * (-1/2 + percent)
            y = r * Math.sin(Math.PI / 3)
          } else if(wg == 'WG II'){
            x = r * (1 - 1/2 * percent)
            y = r * percent * Math.sin(-Math.PI / 3)
          } else if(wg == 'WG III'){
            x = r * (-1/2 - percent * 1/2)
            y = r * (Math.sin(-2 * Math.PI / 3) - percent * Math.sin(-2 * Math.PI / 3))
          }
          var key = wg.toLowerCase() + ' - ' + ch.toLowerCase() + ' - ' + ar
          chapterCoordinates[key] = {x: x, y: -y}
          chapterNames[key] = ns.structure[ar][wg][ch]
        }
        ar_current += i
      })
    })

    console.log('chapterCoordinates', chapterCoordinates)


    // Coordinates of Chapter nodes
    g.nodes.forEach(function(n){
      if(n.attributes_byId['attr_type'] == 'Chapter'){
        var c = chapterCoordinates[n.label]
        if(c === undefined){
          console.log('Unknown chapter', n.label)
        }
        if(c.x == 0 && c.y == 0){
          console.log('Zero coordinates', n.label)
        }
        n.x = c.x
        n.y = c.y
        n.label = chapterNames[n.label]
        // n.label = n.label.toUpperCase()
      }
    })

    // Coordinate of Author nodes
    g.nodes.forEach(function(n){
      if(n.attributes_byId['attr_type'] == 'Author'){
        n.label = ns.titleCase(n.label)
        // Barycenter
        var x = 0
        ,y = 0
        ,count = 0
        n.outEdges.forEach(function(e){
          var n2 = e.target
          ,w = e.attributes_byId.matchings_count
          if(n2.x !== undefined && n2.y !== undefined){
            x += n2.x * w
            y += n2.y * w
            count += w
          }
        })
        var angle = Math.random() * Math.PI * 2
        n.x = x / count + Math.random() * jitter * Math.cos(angle)
        n.y = y / count + Math.random() * jitter * Math.sin(angle)
      }
    })

  }

  ns.makeUp = function(g){
    g.nodes.forEach(function(n){
      if(n.attributes_byId['attr_type'] == 'Author')
        n.label = ns.titleCase(n.label)
    })
  }

  ns.titleCase = function (input) {
    var words = input.split(' ');
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].toLowerCase(); // lowercase everything to get rid of weird casing issues
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
  }

  ns.mergeNetworks = function(obsoleteGraph, resultGraph){
    obsoleteGraph.nodes.forEach(function(n){
      resultGraph.nodes.push(n)
    })
    resultGraph.edges = resultGraph.edges.concat(obsoleteGraph.edges)

    // Filter the nodes
    var remainingNodes = {}
    resultGraph.nodes.forEach(function(n){
      remainingNodes[n.id] = true
    })
    resultGraph.edges = resultGraph.edges.filter(function(e){
      return remainingNodes[e.sourceID] && remainingNodes[e.targetID]
    })
  }

})(window.script = window.script || {}, jQuery)

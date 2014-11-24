;(function(ns, $, undefined){
  'use strict';
  
  ns.sourceFile = 'bridge_authors_by_ar_wg_chapter.csv'
  ns.wgStructure = {}

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
      ns.wgStructure[obj.WG] = true
    })
    for(var wg in ns.wgStructure){
      ns.wgStructure[wg] = {}
    }
    data.forEach(function(obj){
      ns.wgStructure[obj.WG][obj['Chapter #']] = ns.wgStructure[obj.WG][obj['Chapter #']] || obj['Chapter Title']
    })
    console.log('Working Group Structure', ns.wgStructure)

    // Process each AR separately
    for(var ar = 1; ar <= 5; ar++){
      ns.processAR(data, ''+ar)
    }
  }

  ns.processAR = function(data, ar){
    
    // Filter nodes present in the right AR
    data.filter(function(obj){
      return obj.AR == ar
    })

    var table = data.map(function(obj){
      return [obj['Bridge Author'], obj['WG'] + ' - ' + obj['AR']]
    })

    // Build the network
    var settings = {
      mode: 'bipartite'
      ,nodesColumnId1: 0
      ,nodesMetadataColumnIds1: []
      ,nodesColumnId2: 1
      ,nodesMetadataColumnIds2: []
      ,jsonCallback: function(json){
        console.log('AR ' + ar, table, json)
      }
    }
    table2net.buildGraph(table, settings)

  }

})(window.script = window.script || {}, jQuery)
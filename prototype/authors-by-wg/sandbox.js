;(function(ns, $, undefined){
  'use strict';
  
  ns.sourceFile = 'participations_by_country_ar_wg_cumulated_in_same_ar.csv'
  
  d3.csv(ns.sourceFile, function(error, data){
    console.log('Parsed data', data)
    window.d = data // To have access in the console

    ns.drawCountryArDoughnut('#france1', data, 'France', '1')
    ns.drawCountryArDoughnut('#france2', data, 'France', '2')
    ns.drawCountryArDoughnut('#france3', data, 'France', '3')
    ns.drawCountryArDoughnut('#france4', data, 'France', '4')
    ns.drawCountryArDoughnut('#france5', data, 'France', '5')
    
  })
  
  ns.drawCountryArDoughnut = function(container, data, country, ar){
    var filteredData = data
      .filter(function(d){
        return d['Country'] == country && d['AR'] == ar
      })

   ns.drawDoughnut(container, filteredData, {
      column: 'Total Country Authors'
      ,labelColumn: 'Cumulated WG'
      ,width: 300
      ,height: 300
    })
  }

  ns.drawDoughnut = function(container, data, settings){

    // Normalize settings
    settings.width = settings.width || 960
    settings.height = settings.height || 500
    settings.radius = settings.radius || Math.min(settings.width, settings.height) / 2;
    settings.column = settings.column || 'data'
    settings.labelColumn = settings.labelColumn || settings.column

    // Put data as figures
    data.forEach(function(d){
      d[settings.column] = +d[settings.column]
    })

    var tripleBridges = 0
    data.forEach(function(d){
      if(d[settings.labelColumn] == 'WG1+2+3'){
        tripleBridges = d[settings.column]
      }
    })

    var colors = {
      'WG1': '#F38571'
      ,'WG1+2': '#BA7396'
      ,'WG2': '#8AA7D3'
      ,'WG2+3': '#2D9892'
      ,'WG3': '#73B66C'
      ,'WG1+3': '#9F8738'
    }
    ,order = {
      'WG1': 1
      ,'WG1+2': 2
      ,'WG2': 3
      ,'WG2+3': 4
      ,'WG3': 5
      ,'WG1+3': 6
    }

    var arc = d3.svg.arc()
      .outerRadius(settings.radius - 10)
      .innerRadius(settings.radius - 70);

    var pie = d3.layout.pie()
        .value(function(d) { return d[settings.column] })
        .sort(function(a, b){
          return order[a] - order[b]
        })

    var svg = d3.select(container).append("svg")
        .attr("width", settings.width)
        .attr("height", settings.height)
      .append("g")
        .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")");

    var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");
        
    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {return colors[d.data[settings.labelColumn]]; });

    g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) {

          // Label to display
          if(d.data[settings.column] > 0)
            return d.data[settings.labelColumn] + ': ' + d.data[settings.column]
          else
            return ''
        });

    // Center: WG1+2+3
    if(tripleBridges > 0){
      svg.append("text")
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          // Label to display (triple bridges)
          .text('WG1+2+3: ' + tripleBridges)
    }
  }

  


})(window.script = window.script || {}, jQuery)
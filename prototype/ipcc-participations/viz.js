/* visualisation settings */
var colorRange = ['#1E6D75','#EB983E','#581315','#A7252A','#F4D74C','#73A554'];

var margin = {top: 20, right: 80, bottom: 30, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

var xFormatter = d3.format("d");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(
    function(d) {
      return 'AR' + xFormatter(d);
    }
  );

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return x(d.AR); })
    .y(function(d) { return y(d.percentage); });

// Create svg
var svg = d3.select("#visualisation").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data.csv", function(error, data) {
  data.forEach(function(d) {
    d.wmo         = d['WMO Symbol'];
    d.percentage  = d['% WMO Region Participations'];
  });

  var data = data.filter(function(d) {
    return d.wmo != 'WMONA';
  });

  var color = d3.scale.ordinal()
    .domain(d3.set(data.map(function(d) { return d.wmo })).values())
    .range(colorRange);

  var continents = color.domain().map(function(wmo) {
    return {
      wmo: wmo,
      values: data.filter(function(d) { return d.wmo == wmo }).map(function(d) {
        return {AR: d.AR, percentage: d.percentage};
      })
    };
  });

  x.domain(d3.extent(data, function(d) { return d.AR; }));

  y.domain([
    d3.min(continents, function(d) { return d3.min(d.values, function(e) { return +e.percentage; }); }),
    d3.max(continents, function(d) { return d3.max(d.values, function(e) { return +e.percentage; }); })
  ]);

  // Add graph to svg
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Participations (%)");

  // Add lines to svg
  var continent = svg.selectAll(".continent")
      .data(continents)
    .enter().append("g")
      .attr("class", "continent");

  continent.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return color(d.wmo); })
      .style("opacity", 0.6);

  continent.append("text")
      .datum(function(d) { return {wmo: d.wmo, value: d.values[d.values.length - 1]}; })
      .attr("transform", function(d) { return "translate(" + x(d.value.AR) + "," + y(d.value.percentage) + ")"; })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) { return d.wmo; });

  // Add points to svg
  var circle = svg.selectAll(".circle")
      .data(d3.merge(continents.map(function(d){ return d.values.map(function(f){ return {AR:f.AR,percentage:f.percentage,wmo:d.wmo}; }); })))
    .enter().append("g")
      .attr("class", "circle");

  circle.append("circle")
      .attr("cx", function(d, i) { return x(d.AR); })
      .attr("cy", function(d, i) { return y(d.percentage); })
      .attr("r", 3)
      .style("fill", function(d) { return color(d.wmo); });
});
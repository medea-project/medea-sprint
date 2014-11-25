;(function(undefined) {
  'use strict';

  /**
   * MEDEA Power-law Histogram Viz
   * ==============================
   *
   * Load the participations.json file and display the three
   * relevant histograms.
   */

  /**
   * Helpers
   */
  function collect(prop) {
    return function(o) {
      return o[prop];
    };
  };

  function range(end) {
    return Array.apply(null, Array(end)).map(function (_, i) {return i;});
  }

  /**
   * Abstract
   */
  function Histogram() {

    // Properties
    this.data = null;
    this.dataNonBridge = null;
    this.dataBridge = null;
    this.defaultWidth = 400;
    this.defaultHeight = 200;
  }

  /**
   * Prototype
   */
  Histogram.prototype.load = function(path, callback) {
    var self = this;

    d3.json(path, function(participations) {
      self.data = participations;
      self.dataNonBridge = self.data.filter(function(d) {
        return !d.bridge;
      });
      self.dataBridge = self.data.filter(function(d) {
        return d.bridge;
      });
      if (typeof callback === 'function')
        callback();
    });
  };

  Histogram.prototype.drawChart = function(data, container, w, h) {
    var height = h || this.defaultHeight,
        width = w || this.defaultWidth;

    var y = d3.scale.linear()
      .range([height, 0])
      .domain([0, d3.max(data, function(d) { return d.nb_authors; })]);

    var yAxis = d3.svg.axis()
      .scale(d3.scale.linear().range([height, 0]).domain([0, 100]))
      .orient('left');

    var chart = d3.select(container)
      .append('svg')
        .attr('width', width + 30)
        .attr('height', height + 20 + 10);

    chart.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(25, 8)')
      .call(yAxis);

    var barWidth = (width - 30) / data.length;

    var bar = chart.selectAll('.bar')
        .data(data)
      .enter().append('g')
        .attr('transform', function(d, i) { return 'translate(' + (30 + i * barWidth) + ',10)'; });

    bar.append('rect')
      .attr('y', function(d) { return y(d.nb_authors); })
      .attr('height', function(d) { return height - y(d.nb_authors); })
      .attr('width', barWidth - 5);

    bar.append('text')
      .attr('x', barWidth / 2)
      .attr('y', height + 10)
      .attr('dy', '.75em')
      .text(function(d) { return d.nb_participations; });

    return chart;
  };

  Histogram.prototype.drawChartAll = function(container, w, h) {
    var max = Math.max.apply(null, this.data.map(collect('count'))),
        participations = range(max).map(function(i) {
          return {
            nb_participations: i + 1,
            nb_authors: 0
          };
        });

    this.data.forEach(function(a) {
      participations[a.count - 1].nb_authors++;
    });

    return this.drawChart(participations, container, w, h);
  };

  Histogram.prototype.drawChartNonBridge = function(container, w, h) {
    var max = Math.max.apply(null, this.data.map(collect('count'))),
        participations = range(max).map(function(i) {
          return {
            nb_participations: i + 1,
            nb_authors: 0
          };
        });

    this.dataNonBridge.forEach(function(a) {
      participations[a.count - 1].nb_authors++;
    });

    return this.drawChart(participations, container, w, h);
  };

  Histogram.prototype.drawChartBridge = function(container, w, h) {
    var max = Math.max.apply(null, this.data.map(collect('count'))),
        participations = range(max).map(function(i) {
          return {
            nb_participations: i + 1,
            nb_authors: 0
          };
        });

    this.dataBridge.forEach(function(a) {
      participations[a.count - 1].nb_authors++;
    });

    return this.drawChart(participations, container, w, h);
  };

  // Exporting
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = Histogram;
    exports.PowerLawHistogram = Histogram;
  } else if (typeof define === 'function' && define.amd)
    define('PowerLawHistogram', [], function() {
      return Histogram;
    });
  else
    this.PowerLawHistogram = Histogram;
}).call(this);

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
   * Abstract
   */
  function Histogram() {

    // Properties
    this.data = null;
    this.defaultWidth = 960;
    this.defaultHeight = 500;
  }

  /**
   * Prototype
   */
  Histogram.prototype.load = function(path, callback) {
    var self = this;

    d3.json(path, function(participations) {
      self.data = participations;
      if (typeof callback === 'function')
        callback();
    });
  };

  Histogram.prototype.drawChartAll = function(container, w, h) {
    var height = h || this.defaultHeight,
        width = w || this.defaultWidth,
        participations = [];

    this.data.forEach(function(a) {
      participations[a.count] = participations[a.count] || {
        nb_participations: a.count,
        nb_authors: 0
      };
      participations[a.count].nb_authors++;
    });

    participations = participations.filter(function(i) {
      return i;
    });

    var y = d3.scale.linear()
      .range([height, 0])
      .domain([0, d3.max(participations, function(d) { return d.nb_authors; })]);

    var chart = d3.select(container)
      .append('svg')
      .attr('width', width + 30)
      .attr('height', height + 20);

    var barWidth = width / participations.length;

    var bar = chart.selectAll('g')
        .data(participations)
      .enter().append('g')
        .attr('transform', function(d, i) { return 'translate(' + i * barWidth + ',0)'; });

    bar.append('rect')
        .attr('y', function(d) { return y(d.nb_authors); })
        .attr('height', function(d) { return height - y(d.nb_authors); })
        .attr('width', barWidth - 1);

    bar.append('text')
        .attr('x', barWidth / 2)
        .attr('y', height + 10)
        .attr('dy', '.75em')
        .text(function(d) { return d.nb_participations; });

    return chart;
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

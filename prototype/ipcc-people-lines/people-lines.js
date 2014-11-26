;(function(undefined) {
  'use strict';

  /**
   * IPCC People Lines Viz
   * ======================
   *
   * A shiny 'troupeau de lignes' displaying authors participations across
   * assesment reports.
   */

  /**
   * Abstract
   */
  function Viz() {

    // Properties
    this.data = null;
    this.defaultWidth = 700;
    // this.defaultHeight = 500;

    this.lineWidth = 2;
    this.lineMargin = 1;
  }


  /**
   * Prototype
   */
  Viz.prototype.load = function(path, callback) {
    d3.csv(path, (function(data) {
      this.data = data;
      if (typeof callback === 'function')
        callback();
    }).bind(this));
  };

  // NOTE: height is not relevant
  Viz.prototype.draw = function(container, w, h) {
    if (!this.data)
      throw Error('IPCCPeopleLines.draw: data was not loaded.');

    var width = w || this.defaultWidth,
        height = h || this.defaultHeight,
        lineSpace = this.lineWidth + this.lineMargin,
        arWidth = width / 5;

    var y = d3.scale.linear()
      // .domain([0, d3.max(this.data.map(function(d) {
      //   return [d.ar1, d.ar]
      // }))])
      .range(['yellow', 'red']);

    var chart = d3.select(container)
      .append('svg')
        .attr('width', width)
        .attr('height', this.data.length * (lineSpace));

    var group = chart.selectAll('.lines')
      .data(this.data)
      .enter().append('g');

    var line = group
      .append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', function(d, i) {
          return i * lineSpace;
        })
        .attr('y2', function(d, i) {
          return i * lineSpace;
        })
        .attr('stroke-width', this.lineWidth)
        .attr('stroke', '#ccc');

    [1, 2, 3, 4, 5].forEach(function(ar, ari) {
      var subline = group
        .append('line')
          .attr('x1', arWidth * ari)
          .attr('x2', arWidth * ari + arWidth)
          .attr('y1', function(d, i) {
            return i * lineSpace;
          })
          .attr('y2', function(d, i) {
            return i * lineSpace;
          })
          .attr('stroke-width', this.lineWidth)
          .attr('stroke', function(d) {
            return +d['ar' + ar] ? 'red' : '#ccc';
          });
    }, this);
  };

  // Exporting
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = Viz;
    exports.IPCCPeopleLines = Viz;
  } else if (typeof define === 'function' && define.amd)
    define('IPCCPeopleLines', [], function() {
      return Viz;
    });
  else
    this.IPCCPeopleLines = Viz;
}).call(this);


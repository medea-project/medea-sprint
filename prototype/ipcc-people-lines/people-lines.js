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
    this.countries = null;
    this.data = {};

    this.defaultCountry = "France";
    this.defaultWidth = 700;
    this.lineWidth = 2;
    this.lineMargin = 1;
  }


  /**
   * Prototype
   */
  Viz.prototype.load_countries = function(path, callback) {
    d3.json(path, (function(data) {
      this.countries = data;
      this.listCountries = Object.keys(data).sort();
      if (typeof callback === 'function')
        callback();
    }).bind(this));
  };

  Viz.prototype.load_country = function(country, callback) {
    if (!this.countries)
      throw Error('IPCCPeopleLines.load_country: countries data was not loaded.');
    if (!this.countries[country])
      throw Error('IPCCPeopleLines.load_country: country missing from countries data.');
    // Avoid reloading pre-cached country data
    if (this.data[this.countries[country]]) {
      if (typeof callback === 'function')
        return callback();
      return;
    }
    var path = "data/ipcc-people-participations-" + this.countries[country] + ".json";
    d3.json(path, (function(data) {
      this.data[this.countries[country]] = data;
      if (typeof callback === 'function')
        callback();
    }).bind(this));
  };

  Viz.prototype.draw_country = function(container, country, w) {
    if (!this.countries)
      throw Error('IPCCPeopleLines.draw: countries data was not loaded.');
    if (!this.countries[country])
      throw Error('IPCCPeopleLines.draw: country missing from countries data.');
    if (!this.data[this.countries[country]])
      throw Error('IPCCPeopleLines.draw: country data was not loaded.');

    var data = this.data[this.countries[country]],
        width = w || this.defaultWidth,
        lineSpace = this.lineWidth + this.lineMargin,
        arWidth = width / 9;

    var y = d3.scale.linear()
      .domain([1, 5])
      .range(['yellow', 'red']);

    var chart;
    if (d3.select(container).select('svg').empty()) {
      chart = d3.select(container)
        .append('svg')
          .attr('width', width)
          .attr('height', Object.keys(data).length * (lineSpace));
    }
    else {
      chart = d3.select(container).select('svg')
        .attr('width', width)
        .attr('height', Object.keys(data).length * (lineSpace));
      chart.selectAll('g').remove();
    }

    data.sort(function(a,b) {
        return a.total_ars - b.total_ars;
    });

    var group = chart.selectAll('.lines')
      .data(data)
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
          .attr('x1', arWidth * (2*ari))
          .attr('x2', arWidth * (2*ari + 1))
          .attr('y1', function(d, i) {
            return i * lineSpace;
          })
          .attr('y2', function(d, i) {
            return i * lineSpace;
          })
          .attr('stroke-width', this.lineWidth)
          .attr('stroke', function(d) {
            return +d['ar' + ar].total ? y(d.total_ars) : '#ccc';
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


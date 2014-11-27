;(function(undefined) {
  'use strict';

  var cleantext = function(text) {
    return text.replace(/ /g, "&nbsp;");
  };

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
    this.listCountries = null;
    this.data = {};

    this.defaultCountry = "France";
    this.defaultSort = "participation";
    this.defaultWidth = 700;
    this.lineWidth = 5;
    this.lineMargin = 15;
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

  Viz.tooltip = d3.select("body")
      .append("div")
      .attr("class", "linestooltip");

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

  Viz.prototype.draw_country = function(container, country, sort, w) {
    if (!this.countries)
      throw Error('IPCCPeopleLines.draw: countries data was not loaded.');
    if (!this.countries[country])
      throw Error('IPCCPeopleLines.draw: country missing from countries data.');
    if (!this.data[this.countries[country]])
      throw Error('IPCCPeopleLines.draw: country data was not loaded.');

    var data = this.data[this.countries[country]],
        sorting = sort || this.defaultSort,
        width = w || this.defaultWidth,
        lineWidth = this.lineWidth,
        lineMargin = this.lineMargin,
        lineSpace = lineWidth + lineMargin,
        arWidth = 3 * width / 20,
        maxParticipations = d3.max(data.map(function(d) {
          return [d.ar1.total, d.ar2.total, d.ar3.total, d.ar4.total, d.ar5.total];
        }).reduce(function(a, b) {
          return a.concat(b);
        }, []));

    var y = d3.scale.linear()
      .domain([0, maxParticipations])
      .range(['yellow', 'green']);

    data.sort(function(a,b) {
      if (sorting === "chrono") {
        if (a.first_ar != b.first_ar)
          return a.first_ar - b.first_ar;
        if (a.total_part != b.total_part)
          return b.total_part - a.total_part;
        return b.total_ars - a.total_ars;
      } else if (sorting === "participations") {
        if (a.total_part != b.total_part)
          return b.total_part - a.total_part;
        if (a.total_ars != b.total_ars)
          return b.total_ars - a.total_ars;
        return a.first_ar - b.first_ar;
      } else if (sorting === "reports") {
        if (a.total_ars != b.total_ars)
          return b.total_ars - a.total_ars;
        if (a.total_part != b.total_part)
          return b.total_part - a.total_part;
        return a.first_ar - b.first_ar;
      } else if (sorting === "alpha") {
        return a.name.localeCompare(b.name);
      }
    });

    var curY = 0,
        height = 10;
    data.forEach(function(d) {
      var wid = lineWidth * d.total_ars
      height += wid + lineMargin;
      d.y1 = curY + lineMargin + wid/2;
      curY = d.y1 + wid/2;
    });

    var chart;
    if (d3.select(container).select('svg').empty()) {
      chart = d3.select(container)
        .append('svg')
          .attr('width', width)
          .attr('height', height);
    }
    else {
      chart = d3.select(container).select('svg')
        .attr('width', width)
        .attr('height', height);
      chart.selectAll('g').remove();
    }

    var group = chart.selectAll('.lines')
      .data(data)
      .enter().append('g');
    var text = group.append('text')
      .attr('x', width / 4 - 5)
      .attr('y', function(d) {
        return d.y1 + 5;
       })
      .attr('text-anchor', 'end')
      .text(function(d) {
        return d.name;
      });

    [1, 2, 3, 4, 5].forEach(function(ar, ari) {
      var subline = group
        .append('line')
          .attr('x1', width / 4 + arWidth * (ari))
          .attr('x2', width / 4 + arWidth * (ari + 1))
          .attr('y1', function(d, i) {
            return d.y1;
          })
          .attr('y2', function(d, i) {
            return d.y1;
          })
          .attr('stroke-width', function(d) {
            return d['ar' + ar].total ? lineWidth * d.total_ars : 1;
          })
          .attr('stroke', function(d) {
            return d['ar' + ar].total ? y(d['ar' + ar].total) : '#ccc';
          })
          .filter(function(d) {
            return d['ar' + ar].total;
          })
          .on('mouseover', function(d) {
            Viz.tooltip.transition().style("opacity", .9);
            var contribs = "";
            d['ar' + ar].participations.forEach(function(p) {
              contribs += "<li>" + p.role + " for WG " + p.wg +
                " on chapter " + p.chapter + " (" + p.chapter_title + ")</li>";
            });
            return Viz.tooltip.html(
              "<h3>" + cleantext(d.name) + " (AR #" + ar + ")</h3>" +
              "<p><b>" + cleantext(d.institution) + "</b></p>" +
              "<ul>" + cleantext(contribs) + "</ul>"
            );
          })
          .on("mouseout", function(d) {
            return Viz.tooltip.transition().style("opacity", 0);
          })
          .on("mousemove", function(d) {
            return Viz.tooltip
              .style("left", (d3.event.pageX -
                Viz.tooltip.style("width").replace("px", "")/2) + "px")
              .style("top", (d3.event.pageY + 40) + "px");
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


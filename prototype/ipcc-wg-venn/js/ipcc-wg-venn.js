(function(venn) {
  "use strict";

  venn.display_data = function(div_id, width, height) {
    // define sets and set set intersections
    var sets = [{label: "WG1", size: 10}, {label: "WG2", size: 15}, {label: "WG3", size: 8}],
      overlaps = [{sets: [0,1], size: 8}, {sets:[0,2], size: 4}, {sets: [0,1,2], size: 2}, {sets: [1,2], size: 3}];

    // draw the diagram
    var diagram = venn.drawD3Diagram(
      d3.select(div_id),
      venn.venn(sets, overlaps),
      width, height
    );
      
    var colours = d3.scale.category10();
    diagram.circles.style("fill-opacity", .2)
      .style("stroke-width", 3)
      .style("stroke-opacity", .4)
      .style("fill", function(d,i) { return colours(i); })
      .style("stroke", function(d,i) { return colours(i); });
    diagram.text.style("fill", function(d,i) { return colours(i); })
      .style("font-family", "Arial")
      .style("font-size", "16px");

    d3.selection.prototype.moveParentToFront = function() {
      return this.each(function() {
        this.parentNode.parentNode.appendChild(this.parentNode);
      });
    };
    d3.selection.prototype.highlight = function(maxop) {
      return this.transition()
        .style("fill-opacity", maxop)
        .style("stroke-opacity", 1);
    };
    d3.selection.prototype.unhighlight = function(minop) {
      return this.transition()
        .style("fill-opacity", minop)
        .style("stroke-opacity", .4);
    };
    d3.selection.prototype.showTooltip = function(text) {
      this.transition().style("opacity", .9);
      return this.text(text);
    };
    d3.selection.prototype.hideTooltip = function() {
      return this.transition().style("opacity", 0);
    };
    d3.selection.prototype.moveTooltip = function() {
      return this.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    };

    // add a tooltip showing the size of each set/intersection
    var tooltip = d3.select("body")
      .append("div")
      .attr("class", "venntooltip");

    // hover on all the circles
    diagram.nodes
      .on("mouseover", function(d, i) {
        d3.select(this).select("circle")
          .moveParentToFront()
          .highlight(.5)
        console.log(d);
        tooltip.showTooltip(d.size + " people");
      })
      .on("mouseout", function(d, i) {
        d3.select(this).select("circle")
          .unhighlight(.2);
        tooltip.hideTooltip();
      })
      .on("mousemove", function(){
        tooltip.moveTooltip();
      });
    
    // draw a path around each intersection area, add hover there as well
    diagram.svg.selectAll("path")
      .data(overlaps)
      .enter()
      .append("path")
      .attr("d", function(d) { 
        return venn.intersectionAreaPath(d.sets.map(function(j) {
          return sets[j];
       })); 
      })
      .style("fill-opacity", 0)
      .style("fill", "black")
      .on("mouseover", function(d, i) {
        d3.select(this).highlight(.1);
        console.log(d);
        tooltip.showTooltip(d.size + " people");
      })
      .on("mouseout", function(d, i) {
        d3.select(this).unhighlight(0);
        tooltip.hideTooltip();
      })
      .on("mousemove", function() {
        tooltip.moveTooltip();
      })

    };
}(window.venn = window.venn || {}));


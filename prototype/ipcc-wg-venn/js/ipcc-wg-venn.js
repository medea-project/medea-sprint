(function(venn) {
  "use strict";

  venn.AR_data = null;
  venn.load_data = function(path, callback) {
    if (venn.AR_data) {
      return;
    }
    d3.json(path, function(data) {
      venn.AR_data = data;
      return callback();
    });
  };

  venn.plotGlobalAR = function(container, width, height) {
    venn.tooltip = d3.select(container)
      .append("div")
      .attr("class", "venntooltip");

    d3.select(container).append("h3")
      .style("class", "venntitle")
      .style("text-align", "center")
      .style("width", width + "px")
      .html("Distribution of IPCC authors among the 3 working groups<br/>all assessment reports aggregated");
    d3.select(container).append("div").attr("class", "venn");
    venn.display_data(container + " .venn", venn.AR_data["AR-global"], width, height);
  };

  venn.plotAnnualARs = function(container, width, height) {
    venn.tooltip = d3.select(container)
      .append("div")
      .attr("class", "venntooltip");

    d3.select(container).append("h3")
      .style("class", "venntitle")
      .style("text-align", "center")
      .style("width", width + "px")
      .html("Distribution of IPCC authors among the 3 working groups<br/>across assessment reports");
    d3.select(container).style("text-align", "center");
    [1,2,3,4,5].forEach(function(i) {
      var id = "AR-" + i;
      var div = d3.select(container).append("div")
        .attr("id", id)
        .style("float", "left");
      if (i == 4) {
        div.style("clear", "both")
          .style("margin-left", width/6);
      }
      div.append("div").attr("class", "venn");
      div.append("h3")
        .style("class", "venntitle")
        .style("text-align", "center")
        .style("width", width/3 + "px")
        .text(venn.AR_data["years"][id]);
     venn.display_data("#" + id + " .venn", venn.AR_data[id], width/3, height/2);
    });
  };

  venn.display_data = function(div_id, data, width, height) {
    // draw the diagram
    var diagram = venn.drawD3Diagram(
      d3.select(div_id),
      venn.venn(data["sets"], data["overlaps"]),
      width, height
    );
      
    diagram.circles
      .style("stroke", function(d) { return d.color; })
      .style("stroke-width", 3)
      .style("stroke-opacity", .4)
      .style("fill", function(d) { return d.color; })
      .style("fill-opacity", 1);
    diagram.text
      .style("fill", "#111")
      .style("font-family", "Arial")
      .style("font-size", "12px");

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
    d3.selection.prototype.showTooltip = function(d) {
      this.transition().style("opacity", .9);
      return this.html("<b>" +
        d.id.replace("WG", "Working Group")
          .replace(/&/g, "&nbsp;&amp;&nbsp;") +
        (d.label ? ": " + d.label : "") + "</b><br/>" +
        d.size + " contributors");
    };
    d3.selection.prototype.hideTooltip = function() {
      return this.transition().style("opacity", 0);
    };
    d3.selection.prototype.moveTooltip = function() {
      return this.style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 36) + "px");
    };
    
    // hover on all the circles
    diagram.nodes
      .on("mouseover", function(d, i) {
        console.log(d);
        d3.select(this).select("circle")
          .moveParentToFront();
      //    .highlight(1)
        venn.tooltip.showTooltip(d);
      })
      .on("mouseout", function(d, i) {
        //d3.select(this).select("circle")
        //  .unhighlight(1);
        venn.tooltip.hideTooltip();
      })
      .on("mousemove", function(){
        venn.tooltip.moveTooltip();
      });
    
    // draw a path around each intersection area, add hover there as well
    diagram.svg.selectAll("path")
      .data(data["overlaps"])
      .enter()
      .append("path")
      .attr("d", function(d) { 
        return venn.intersectionAreaPath(d.sets.map(function(j) {
          return data["sets"][j];
       })); 
      })
      .style("fill-opacity", 1)
      .style("fill", function(d) { return d.color;})
      .on("mouseover", function(d, i) {
        //d3.select(this).highlight(1);
        venn.tooltip.showTooltip(d);
      })
      .on("mouseout", function(d, i) {
        //d3.select(this).unhighlight(1);
        venn.tooltip.hideTooltip();
      })
      .on("mousemove", function() {
        venn.tooltip.moveTooltip();
      })
    };

}(window.venn = window.venn || {}));

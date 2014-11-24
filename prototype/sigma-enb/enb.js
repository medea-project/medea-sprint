;(function(undefined) {
  'use strict';

  /**
   * ENB Sigma Viz Bindings
   * =======================
   *
   * Load the ENB graph with sigma and exposes abstract methods to interact
   * with the graph later on.
   */

  // Safeguard
  if (!('sigma' in this))
    throw Error('enb: sigma is not in scope.');

  /**
   * Cluster Label Renderer
   */
  sigma.canvas.nodes.clusterLabel = function(node, context, settings) {
    var prefix = settings('prefix') || '',
        fontSize,
        size = node[prefix + 'size'];;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

    // Split lines and center
    function measure(string) {
      return context.measureText(string).width;
    }

    var lines = node.label.split('\\n'),
        longest = Math.max.apply(null, lines.map(measure));

    lines.forEach(function(string, i) {
      var width = measure(string);

      context.fillText(
        string,
        Math.round(node[prefix + 'x']) + (width !== longest ? (longest - width) / 2 : 0) - longest / 2,
        Math.round(node[prefix + 'y']) + (i * fontSize)
      );
    });

    // DEBUG
    // context.fillStyle = node.color || settings('defaultNodeColor');
    // context.beginPath();
    // context.arc(
    //   node[prefix + 'x'],
    //   node[prefix + 'y'],
    //   node[prefix + 'size'],
    //   0,
    //   Math.PI * 2,
    //   true
    // );

    context.closePath();
    context.fill();
  };

  sigma.canvas.hovers.clusterLabel = Function.prototype;
  sigma.canvas.labels.clusterLabel = Function.prototype;


  /**
   * Helpers
   */
  function first(a, fn, scope) {
    for (var i = 0, l = a.length; i < l; i++) {
      if (fn.call(scope || null, a[i]))
        return a[i];
    }
    return;
  }

  function fuzzyLabel(label) {
    return label.trim().toLowerCase();
  }

  /**
   * Abstract
   */
  function Abstract(container) {
    var self = this;

    // Properties
    this.sig = new sigma({
      settings: {
        singleHover: true
      }
    });
    this.camera = this.sig.addCamera('main');
    this.renderer = this.sig.addRenderer({
      name: 'main',
      container: container,
      camera: this.camera,
      type: 'canvas'
    });
  }

  /**
   * Prototype
   */

  // Loading the graph
  Abstract.prototype.load = function(path, callback) {
    var self = this;

    // Loading graph at init
    sigma.parsers.gexf(path, this.sig, function() {

      // Giving precise node types
      self.sig.graph.nodes().forEach(function(node) {
        if (node.attributes.type === 'normal')
          return;

        node.type = 'clusterLabel';
        node.size = 1;
      });

      // Refreshing view
      self.sig.refresh();

      callback();
    });
  };

  // Finding a node by label
  Abstract.prototype.findNodeByLabel = function(label) {
    return first(this.sig.graph.nodes(), function(node) {
      return fuzzyLabel(node.label) === fuzzyLabel(label);
    });
  };

  // Finding nodes by label
  // NOTE: this is hardly optimal to use a filter here...
  // NOTE: order of query is not returned
  Abstract.prototype.findNodesByLabel = function(labels) {
    var fuzzyLabels = labels.map(fuzzyLabel);

    return this.sig.graph.nodes().filter(function(node) {
      return ~fuzzyLabels.indexOf(fuzzyLabel(node.label));
    });
  };

  // Focusing on a precise node
  Abstract.prototype.focusOnNodeByLabel = function(label) {
    var node = this.findNodeByLabel(label);

    if (!node)
      throw Error('enb.focusOnNodeByLabel: inexistant node for label "' + label + '".');

    sigma.misc.animation.camera(
      this.camera,
      {
        x: node['read_cammain:x'],
        y: node['read_cammain:y'],
        ratio: 0.1
      },
      {duration: 150}
    );
  };

  // Focusing on a group of nodes
  Abstract.prototype.focuseOnGroupByLabels = function(labels) {
    var nodes = this.findNodesByLabel(labels);

    var collect = function(prop) {
      return function(node) {
        return node[prop];
      };
    };

    // Computing bouding rectangle's center
    var xs = nodes.map(collect('read_cammain:x')),
        ys = nodes.map(collect('read_cammain:y')),
        maxX = Math.max.apply(null, xs),
        maxY = Math.max.apply(null, ys),
        minX = Math.min.apply(null, xs),
        minY = Math.min.apply(null, ys),
        centerX = (maxX + minX) / 2,
        centerY = (maxY + minY) / 2,
        distance = Math.sqrt(
          Math.pow(maxX + centerX, 2) +
          Math.pow(maxY - centerY, 2)
        );

    sigma.misc.animation.camera(
      this.camera,
      {
        x: centerX,
        y: centerY,
        ratio: 0.08 / Math.log(distance)
      },
      {duration: 150}
    );
  };

  // Exporting
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
      exports = module.exports = Abstract;
    exports.ENBGraph = Abstract;
  } else if (typeof define === 'function' && define.amd)
    define('ENBGraph', [], function() {
      return Abstract;
    });
  else
    this.ENBGraph = Abstract;
}).call(this);

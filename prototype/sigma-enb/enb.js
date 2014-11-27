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

    fontSize = (true) ?
      12 :
      settings('labelSizeRatio') * size;

    context.font = 'bold ' + (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = node.attributes.color;

    // Split lines and center
    function measure(string) {
      return context.measureText(string).width;
    }

    var lines = node.label.split('\\n'),
        longest = Math.max.apply(null, lines.map(measure));

    lines.forEach(function(string, i) {
      var width = measure(string);

      context.fillText(
        string.toUpperCase(),
        Math.round(node[prefix + 'x']) + (width !== longest ? (longest - width) / 2 : 0) - longest / 2,
        Math.round(node[prefix + 'y']) + (i * fontSize)
      );
    });
  };

  sigma.canvas.hovers.clusterLabel = Function.prototype;
  sigma.canvas.labels.clusterLabel = Function.prototype;

  function measure(ctx, string) {
    return ctx.measureText(string).width;
  }

  sigma.canvas.labels.custom = function(node, context, settings) {
    var fontSize,
        prefix = settings('prefix') || '',
        size = node[prefix + 'size'];

    if (size < settings('labelThreshold'))
      return;

    if (typeof node.label !== 'string')
      return;

    fontSize = (settings('labelSize') === 'fixed') ?
      settings('defaultLabelSize') :
      settings('labelSizeRatio') * size;

    context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') +
      fontSize + 'px ' + settings('font');
    context.fillStyle = (settings('labelColor') === 'node') ?
      (node.color || settings('defaultNodeColor')) :
      settings('defaultLabelColor');

    context.fillText(
      node.label,
      Math.round(node[prefix + 'x'] + size + 3),
      Math.round(node[prefix + 'y'] + fontSize / 3)
    );
  };

  sigma.canvas.nodes.custom = function(node, context, settings) {
    var prefix = settings('prefix') || '';

    context.fillStyle = node.color || settings('defaultNodeColor');
    context.beginPath();
    context.arc(
     node[prefix + 'x'],
     node[prefix + 'y'],
     node[prefix + 'size'],
     0,
     Math.PI * 2,
     true
    );

    context.closePath();
    context.fill();

    context.lineWidth = node.borderWidth || 1;
    context.strokeStyle = node.borderColor || '#fff';
    context.stroke();
  };

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

  function collect(prop) {
    return function(o) {
      return o[prop];
    };
  };

  function fuzzyLabel(label) {
    return label.trim().toLowerCase();
  }

  function muteNode(node) {
    node.color = '#ddd';
  }

  function unmuteNode(node) {
    node.color = node.attributes.color;
  }

  function muteEdge(edge) {
    edge.hidden = true;
  }

  function unmuteEdge(edge) {
    delete edge.hidden;
  }

  /**
   * Abstract
   */
  function Abstract(container) {
    var self = this;

    // Properties
    this.index = null;
    this.size = 0;
    this.sig = new sigma({
      settings: {
        singleHover: true,
        minNodeSize: 4,
        maxNodeSize: 15,
        minEdgeSize: 0.5,
        maxEdgeSize: 10,
        labelSize: 'proportional',
        labelSizeRatio: 1.2
      }
    });
    this.camera = this.sig.addCamera('main');
    this.renderer = this.sig.addRenderer({
      id: 'main',
      container: container,
      camera: this.camera,
      type: 'canvas'
    });
  }

  /**
   * Prototype
   */

  // Loading the graph data and the paragraphs
  Abstract.prototype.load = function(graphPath, indexPath, callback) {
    var self = this,
        count = 0;

    // Loading graph at init
    sigma.parsers.gexf(graphPath, this.sig, function() {
      var nodes = self.sig.graph.nodes();

      // Giving precise node types
      nodes.forEach(function(node) {
        if (node.attributes.type !== 'clusterLabel') {
          node.color = node.attributes.color;
          node.size = node.attributes.weight;
          node.type = 'custom';
        }
        else {
          node.type = 'clusterLabel';
          node.size = 1;
        }
      });

      self.sig.graph.edges().forEach(function(e) {
        e.color = '#ddd';
        e.size = e.weigth;
      });

      // Refreshing view
      self.sig.refresh();

      // Binding actions
      self.sig.bind('clickNode', function(e) {
        var k = fuzzyLabel(e.data.node.label);

        // Neighborhood
        var neighbors = self.sig.graph.neighborhood(e.data.node.id),
            nextNodes = neighbors.nodes.map(function(n) {return n.id;}),
            nextEdges = neighbors.edges.map(function(e) {return e.id;});

        self.sig.graph.nodes().forEach(function(node) {
          if (~nextNodes.indexOf(node.id))
            unmuteNode(node);
          else
            muteNode(node);
        });

        self.sig.graph.edges().forEach(function(edge) {
          if (~nextEdges.indexOf(edge.id))
            unmuteEdge(edge)
          else
            muteEdge(edge);
        });

        if (typeof self.onNodeClick === 'function')
          self.onNodeClick(k, self.index[k] || []);

        self.sig.refresh();
      });

      self.sig.bind('clickStage', function(e) {
        if (e.data.captor.isDragging)
          return;

        self.sig.graph.nodes().forEach(unmuteNode);
        self.sig.graph.edges().forEach(unmuteEdge);
        self.sig.refresh();
      });

      // Size
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
            Math.pow(maxY + centerY, 2)
          );
      self.size = distance;

      if (++count === 2)
        callback();
    });

    d3.csv(indexPath, function(data) {
      self.index = {};

      data.forEach(function(line) {
        var keywords = line.keywords.split('|');

        keywords.forEach(function(k) {
          if (!self.index[k]) {
            self.index[k] = [];
          }
          self.index[k].push(line.paragraph);
        });
      });

      if (++count === 2)
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
          Math.pow(maxY + centerY, 2)
        );


    sigma.misc.animation.camera(
      this.camera,
      {
        x: centerX,
        y: centerY,
        ratio: 0.8 * distance / this.size
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

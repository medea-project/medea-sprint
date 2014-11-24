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
    throw Error('ENBGraph: sigma is not in scope.');

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
    this.sig = new sigma();
    this.camera = this.sig.addCamera('main');
    this.renderer = this.sig.addRenderer({
      name: 'main',
      container: container,
      camera: this.camera
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

  // Focusing on a precise node
  Abstract.prototype.focusOnNodeByLabel = function(label) {
    var node = this.findNodeByLabel(label);
    console.log(node);
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

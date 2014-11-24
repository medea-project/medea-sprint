;(function(undefined) {

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

  // Abstract
  function Abstract(container) {
    var self = this;

    // Properties
    this.sig = new sigma({
      container: container
    });
  }

  // Prototype
  Abstract.prototype.load = function(path, callback) {
    var self = this;

    // Loading graph at init
    sigma.parsers.gexf(path, this.sig, function() {
      self.sig.refresh();
      callback();
    });
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

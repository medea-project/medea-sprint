var csv = require('csv-parse'),
    fs = require('fs'),
    argv = require('yargs').argv;

if (!argv.input)
  throw Error('No input given: --input X');

var aIndex = {};

// Parsing input csv
// --0: author_id
csv(fs.readFileSync(argv.input, 'utf-8'), function(err, participations) {
  participations.forEach(function(p) {
    var id = p[5];

    if (!aIndex[id]) {
      aIndex[id] = {
        id: id,
        bridge: false,
        wg: p[2],
        participations: 1
      };
    }
    else {
      if (p[2] !== aIndex[id].wg) {
        aIndex[id].bridge = true;
      }
      aIndex[id].participations++;
    }
  });

  var output = [];
  Object.keys(aIndex).forEach(function(id) {
    var a = aIndex[id];
    output.push({bridge: a.bridge, count: a.participations});
  });

  // To stdout
  process.stdout.write(JSON.stringify(output));
});

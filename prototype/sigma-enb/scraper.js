// http://62.210.188.24/negociations/web_cop_simpler2new.html

var data = artoo.scrape('.google-visualization-table-table tr:not(:first)', {
  keywords: {
    sel: 'td:nth-child(6)',
    method: function($) {
      return $(this).find('i').scrape(function($) {
        return $(this).text().trim().toLowerCase();
      }).join('|');
    }
  },
  paragraph: {
    sel: 'td:nth-child(7)',
    method: function($) {
      var $e = $(this).clone();

      $e.find('b').replaceWith(function() {
        return $('<span class="highlight">' + $(this).text() + '</span>');
      });

      return $e.html();
    }
  }
});

data = data.filter(function(line) {
  return line.keywords;
});

artoo.saveCsv(data, 'enb.csv');

module.exports = function (esClient, app, core) {
  var Promise = require('promise');//, Nodeio = require('node.io');

  app.get('/api/front', function (req, res) {

    var p1 = new Promise(function (resolve, reject) {
      esClient.count({_index: core.INDEX}, { "term" : { "_type" : "drive" } }, function (err, data) { 
        if (err) reject(err);
        else resolve(data);
      });
    });

    var p2 = new Promise(function (resolve, reject) {
      esClient.search({_index: core.INDEX}, {
        facets: {
          history: {
            terms: {
              field: "q2.facet"
            }
          }
        },
        size: 0
      }, function (err, data) {
        if (err) reject(err);
        else resolve(data);
      });
    });

    Promise.all(p1, p2).then(function (data) {
      res.send(data);
    })
  });

  app.get('/api/scrape', function (req, res) {


    Nodeio.scrape(function() {
        this.getHtml('http://www.reddit.com/', function(err, $) {
            var stories = [];
            $('a.title').each(function(title) {
                stories.push(title.text);
            });
            // this.emit(stories);
            console.log(stories);
        });
    });

    res.send(core.ngSafe({
      header: "just a dummy title",
      content: "some silly content",
      tags: ["tag1", "tag2", "tag3"]
    }));
  });
};
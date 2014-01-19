var fs = require('fs');
var cheerio = require('cheerio');
var http = require('http');
var url = require('url');

var vowels = 'aāeēiīuūo';
var verbs = [];

['core', 'valerijs'].forEach(function(file) {
    $ = cheerio.load(fs.readFileSync('morphology/dist/Lexicon_' + file + '.xml')); // load xml file
    var array = $('*[Pamatforma$="t"], *[Pamatforma$="ties"]').map(function(index, e) { return e.attribs.pamatforma; }).toArray(); // infinitives ending in -t or -ties
    array = array.filter(function(value, index, self) { return self.indexOf(value) === index; }); // unique
    verbs = verbs.concat(array); // add to the list
});

console.log('Loaded ' + verbs.length + ' verbs');

http.createServer(function(req, res) {
    var query = url.parse(req.url, true).query;

    var verb = query.verb;
    var body = '<form action="?" method="get"><input type="text" name="verb" value="' + (verb || '') + '"><input type="submit"></form>';

    if (verb) {
        var matches =
            verbs.filter(function(candidate) {
                return candidate.substr(2) == verb ||
                       candidate.substr(3) == verb;
            }).filter(function(candidate) {
                var prefix = candidate.substr(0, candidate.length - verb.length);
                // prefix must have at least one vowel
                for (var i in prefix)
                    if (vowels.indexOf(prefix[i]) !== -1)
                        return true;
                return false;
            });

        body += matches.length ? '<ul><li>' + matches.join('</li><li>') + '</li></ul>' : '<p>Nothing found</p>';
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(body);
}).listen(8080);
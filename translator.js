var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
// parse application/json
app.use(bodyParser.json());

// add stic files
app.use(express.static(__dirname + '/views'));


var templating = require('consolidate');
app.engine('jade', templating.jade);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); // + '/views'


var request = require('request');
var urlutils = require('url');

app.get('/', function (req, res) {
    res.render('index', {
        title: 'Заполните форму для парсинга.'
    });
});


app.post('/', function (req, res) {


    if (req.body.site && req.body.items) {
        var titles = [];
        request(req.body.site, function (error, response, body) {
            if (error) {
                console.log("Error: " + error);
            }


            var $ = cheerio.load(body);
            if (req.body.site == 'https://news.ycombinator.com/news') {
                var countforNews = 0;
                $('span.comhead').each(function (i, element) {
                    ++countforNews;
                    if (countforNews <= req.body.items) {
                        var a = $(this).prev();
                        var rank = a.parent().parent().text();
                        var title = a.text();
                        var url = a.attr('href');
                        var subtext = a.parent().parent().next().children('.subtext').children();
                        var points = $(subtext).eq(0).text();
                        var username = $(subtext).eq(1).text();
                        var comments = $(subtext).eq(2).text();
                        // Our parsed meta data object
                        var metadata = {
                            rank: parseInt(rank),
                            title: title,
                            url: url,
                            points: parseInt(points),
                            username: username,
                            comments: parseInt(comments)
                        };
                        titles.push(metadata.title);
                        console.log(metadata.title);
                    }
                });
                res.render('index', {titles:titles});

            } else if (req.body.site == 'https://www.reddit.com') {
                var count = 0;
                $('div#siteTable > div.link').each(function (index) {
                    ++count;
                    if (count <= req.body.items) {
                        var title = $(this).find('p.title > a.title').text().trim();
                        titles.push(title);
                        console.log(title);

                    }
                });
                res.render('index', {titles:titles});
            }
        })
    }

    // var url = urlutils.format({
    //     protocol: 'https',
    //     hostname: 'translate.yandex.net',
    //     pathname: 'api/v1.5/tr.json/translate',
    //     query: {
    //         key: 'trnsl.1.1.20140416T130443Z.49db75a946e5d9df.baa803157e4482838c0612cb9c5aa513643049a4',
    //         lang: req.body.lang,
    //         text: req.body.text
    //     }
    // });
    //
    // request.get({
    //         url: url,
    //         json: true
    //     }, function (error, response, json) {
    //         var data = {};
    //
    //         if (error || json.code != 200) {
    //             data = {
    //                 title: "Ошибка при переводе слова " + req.body.text,
    //                 error: json.message
    //             }
    //         } else {
    //             data = {
    //                 title: 'Перевод слова ' + req.body.text + ": " + json.text
    //             }
    //         }
    //
    //         res.render('translator', data);
    //     }
    // );

});


app.listen(8080);
console.log('Express server listening on port 8080');

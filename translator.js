var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

//use cookies
app.use(cookieParser());
// app.use(express.cookieParser('asdasdasd'));

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
    if (req.cookies.rememberSite && req.cookies.rememberItems ){
        res.render('index', {
            title: 'Заполните форму для парсинга.',
            rememberSite: req.cookies.rememberSite,
            rememberItems: req.cookies.rememberItems
        });
    } else {
        res.render('index', {
            title: 'Заполните форму для парсинга.'
        });
    }
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
                res.cookie('rememberSite', 'https://news.ycombinator.com/news', { maxAge: 900000 });
                res.cookie('rememberItems', req.body.items, { maxAge: 900000 });
                res.render('index', {
                    titles:titles,
                    rememberSite:'https://news.ycombinator.com/news',
                    rememberItems:req.body.items
                });


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
                res.cookie('rememberSite', 'https://www.reddit.com', { maxAge: 900000 });
                res.cookie('rememberItems', req.body.items, { maxAge: 900000 });
                res.render('index', {
                    titles:titles,
                    rememberSite:'https://www.reddit.com',
                    rememberItems:req.body.items
                });
            }
        })
    }
});

app.listen(8080);
console.log('Express server listening on port 8080');

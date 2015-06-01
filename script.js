// this script.js is for the basic build
var express = require('express');
// var cons = require('consolidate');
var request = require('request');
var path = require( 'path' );
var expressHandlebar = require('express-handlebars')
var data;
var locale = 'en';
var template = 'example-module-a';
// Call data sources
// test template data
// var tmpldata = require('./data/tmpldata').data;
// MEGA - NAV  \m/
//var megadata = require(__dirname + '/assets/data/mega-nav').data;

var app = express();

var hbs = expressHandlebar.create({ defaultLayout: 'main-layout' , extname: '.hbs',
		layoutsDir: __dirname + '/assets/hbs-templates',
		partialsDir: __dirname + '/assets/hbs-templates'});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/assets/hbs-templates');
app.set('layoutsDir' , __dirname + '/assets/hbs-templates');

app.get('/', function(req, res) {	
	console.log(req.query);
	if(req.query.locale != null){
		locale = req.query.locale;
	}
	if(req.query.template != null){
		template = req.query.template;
	}
	var url = path.join( __dirname , '/assets/config/' , template +'',  locale + '.json');
	data = require(url);
	 console.log("data: " + JSON.stringify(data));
    res.render(template, {
        config: data
    });
});

app.get('/Module-A', function(req, res) {
	 data = require(__dirname + '/assets/config/example-module-a/en.json');
	 console.log("path: "+__dirname + '/assets/config/example-module-a/en.json');
	 console.log("data: " + JSON.stringify(data));
    res.render('example-module-a.hbs', {
      config: data
    });
});

app.get('/Module-B', function(req, res) {
    res.render('example-module-b', {
       // megadata: megadata
    });
});

/**
 * dynamic route where Node/Express will pull data from a drupal server
 * and inject as data into a dynamic handlebar template
 */
app.get('/node/:id', function(req, res) {

    var options = {
        host: '54.83.23.192',
        port: 80,
        path: '/voya/api/node/' + req.params.id,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    request({
            uri: 'http://' + options.host + options.path,
            method: "GET",
            timeout: 10000,
            followRedirect: true,
            maxRedirects: 10
        },

        function(error, response, body) {
            if (error != null) console.log(error);
            var body = JSON.parse(body);
            if (body) {
                var data = {
                    title: body.title,
                    body: body.body.und[0].value,
                    megadata: megadata
                }
                res.render('layout-dynamic.hbs', data);
            } else {
                res.render('layout.hbs', {megadata:megadata});
            }
        });
});


// maps static assets like img, styles, js
app.use(express.static(__dirname));

app.listen(9000, function() {
    console.log('Express server listening...');
});

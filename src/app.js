/**
 * Created by Jerek Wilson on 12/11/18.
 */
let express = require('express');
let bodyParser = require('body-parser');
let app = express();

app.use(bodyParser.json()); // for parsing application/json

let nconf = require('nconf');
let fs = require('fs-extra');

let GoogleGeoCodingRoutes = require('./routes/GoogleGeoCodingRoutes');
let GoogleTimeZoneRoutes = require('./routes/GoogleTimeZoneRoutes');


// Load configuration values from Arguments on command line, then JSON file
nconf.argv();
nconf.file(__dirname + '/config.json').env();


app.get('/ping', function(req, res) {
	res.send({
		message: "Google Web Service Ping Successul!"
	});
});

GoogleGeoCodingRoutes(app);
GoogleTimeZoneRoutes(app);

let server = app.listen(nconf.get("port"));


console.log('Notifier Listening on Port '+ nconf.get("port"));
console.log('info', 'Connected to Goggle Web Service');
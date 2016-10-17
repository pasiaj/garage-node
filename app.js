var express = require('express'),
	path = require('path'),
	config = require('./config'),
	async = require('async'),
	gpio = require('pi-gpio'),
 	rpio = require('rpio');
	app = express();

app.set('port', process.env.PORT || 3000);

app.use('/', express.static(__dirname + '/public'));

function delayPinWrite(pin, value, callback) {
	setTimeout(function() {
		rpio.write(pin, value);
		callback();
		//gpio.write(pin, value, callback);
	}, config.RELAY_TIMEOUT);
}

app.get("/api/ping", function(req, res) {
	res.json("pong");
});

app.post("/api/garage/left", function(req, res) {
	async.series([
		function(callback) {
			// Open pin for output
			rpio.open(config.LEFT_GARAGE_PIN, rpio.OUTPUT);
			callback();
			//gpio.open(config.LEFT_GARAGE_PIN, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			rpio.write(config.LEFT_GARAGE_PIN, config.RELAY_ON);
			callback();
			//gpio.write(config.LEFT_GARAGE_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.LEFT_GARAGE_PIN, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				rpio.close(config.LEFT_GARAGE_PIN);
				//gpio.close(config.LEFT_GARAGE_PIN);
				// Return json
				res.json("ok");
			}, config.RELAY_TIMEOUT);
		}
	]);
});

app.listen(app.get('port'));

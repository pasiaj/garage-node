var express = require('express'),
	path = require('path'),
	config = require('./config'),
	async = require('async'),
	gpio = require('pi-gpio'),
 	rpio = require('rpio');
	app = express();

app.set('port', process.env.PORT || 3000);

app.use('/', express.static(__dirname + '/public'));

var options = {
        gpiomem: true,          /* Use /dev/gpiomem */
        mapping: 'physical',    /* Use the P1-P40 numbering scheme */
}

rpio.init( options );

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

app.get("/api/garage/doorStatus", function(req, res) {
	var doorStatus;
	rpio.open(config.DOOR_SENSOR_PIN, rpio.INPUT);
	doorStatus = rpio.read(config.DOOR_SENSOR_PIN);
	rpio.close(config.DOOR_SENSOR_PIN);
	res.json(doorStatus);
});


app.post("/api/garage/left", function(req, res) {
	async.series([
		function(callback) {
			// Open pin for output
			rpio.open(config.GARAGE_PIN, rpio.OUTPUT, rpio.LOW);
			callback();
			//gpio.open(config.GARAGE_PIN, "output", callback);
		},
		function(callback) {
			// Turn the relay on
			rpio.write(config.GARAGE_PIN, config.RELAY_ON);
			callback();
			//gpio.write(config.GARAGE_PIN, config.RELAY_ON, callback);
		},
		function(callback) {
			// Turn the relay off after delay to simulate button press
			delayPinWrite(config.GARAGE_PIN, config.RELAY_OFF, callback);
		},
		function(err, results) {
			setTimeout(function() {
				// Close pin from further writing
				rpio.close(config.GARAGE_PIN);
				//gpio.close(config.GARAGE_PIN);
				// Return json
				res.json("ok");
			}, config.RELAY_TIMEOUT);
		}
	]);
});

app.listen(app.get('port'));

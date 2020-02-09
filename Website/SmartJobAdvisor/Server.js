var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

app.use(cors());
app.use(express.json());
app.set('port', 8090);

// Unnecessary, leaving as an example.
app.get('/', function (req, res, next) {
	res.json({ msg: 'this is simply a test' });
});

// Unnecessary, leaving as an example.
app.get('/test', function (req, res, next) {
	//res.send("Hello");
});

// Set the server up on the selected port
app.listen(app.get('port'));
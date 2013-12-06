var express = require('express');
var app = express();
app.use(express.static('parseApp/public'));
app.listen(8080);
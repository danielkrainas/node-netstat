var netstat = require('./index');

var i = 0;
netstat({}, function (result) {
	//if (++i < 10) {
	{
		console.log(result);
	}
});

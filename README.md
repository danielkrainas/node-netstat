# node-netstat

A library utility for reading netstat data. It's been tested on Ubuntu 14.04 and Windows 7. 

## Installation

node-netstat can be installed via **npm**:

	$ npm install node-netstat

## Usage

```js
var netstat = require('node-netstat');


netstat({
	// filter by any key in the parsedLine object
	filter: {
		pid: 4123,
		protocol: 'tcp',
	},
	limit: 5
}, function (parsedLine) {
	
});
```

## Bugs and Feedback

If you see a bug or have a suggestion, feel free to open an issue [here](https://github.com/danielkrainas/node-netstat/issues).

## Contributions

PR's welcome! There are no strict style guidelines, just follow best practices and try to keep with the general look & feel of the code present. All submissions must pass jslint and have a test to verify *(if applicable)*.

## License

[MIT License](http://opensource.org/licenses/MIT). Copyright 2015 Daniel Krainas [http://www.danielkrainas.com](http://www.danielkrainas.com)

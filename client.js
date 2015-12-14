var net = require('net');
var readline = require('readline');
var fs = require('fs');
var stdin = process.openStdin();
var lastSent;

var client = new net.Socket({
	allowHalfOpen: false,
	readable: true,
	writeable: true
});
var commands;
fs.readFile('client.data', 'utf-8', function(err, data) {
	if (err) throw err;
	commands = JSON.parse(data);
});


// WHen STDIN input is recieved, send it to the mud as is.
// If it starts with #, don't send, parse first
// TODO: This is ugly as hell, find a better solution
stdin.on('data', function(data) {
		var string = data.toString();
		console.log(string);
		if (!string) {
			console.log(lastSent);
			client.write(lastSent);
		}
		var initChar = string[0];
		// Preprocessor recognition.
		// TODO: Get rid of the repeated code here
		if (initChar == "!") {
			var split = string.split(' ');
			var toRem = {
				type: split[0].slice(1).trim(),
				match: split[1].trim()
			}
			console.log(toRem);
			console.log(commands[toRem.type])
			// TODO: Figure out why this shit isn't working
			var created = commands[toRem.type].created;
			for (var command in created) {
				console.log(JSON.stringify(command.match));
				console.log(toRem.match);
				if (command.match == toRem.match) {
					console.log("Should remove");
					console.log(command);
				}
			}
			return;
		}
		// TODO: Get rid of the repeated code here
		if (initChar == "#") {
			var split = string.split(' ');
			split[0] = split[0].slice(1);
			var info = {
				type: split[0],
				match: split[1],
				value: split[2]
			}
			if (!commands[info.type] || !commands[info.type].allowed) {
				console.log("Unrecognized Client Command");
				return;
			}
			console.log(info.type + " created. Will match {" + info.match + "} for value of {" + info.value + "}");
			commands[info.type].created.push({match: info.match, value: info.value});
			fs.writeFile('client.data', JSON.stringify(commands), function(err) {
				if (err) throw err;
			});
			console.log(JSON.stringify(commands));
			return;
		}
		lastSent = data;
    client.write(data);
});

client.connect(4000, 'aardmud.org', function() {
	console.log('Connected');
});

client.on('data', function(data) {
	console.log(data.toString());
});

client.on('close', function() {
	console.log('Connection closed');
});

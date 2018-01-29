Tail = require('tail').Tail;

tail = new Tail("serverlog.txt", {
	separator: '\n',
	fromBeginning: true,
	follow: true
});

tail.on("line", function(data) {
  console.log(data);
});

tail.on("error", function(error) {
  console.log('ERROR: ', error);
});

tail.watch();
console.log("watch start");
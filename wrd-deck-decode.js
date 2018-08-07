const bitwise = require('bitwise');


var deck = '@Hg8CCAFK5AQj1GgQ2mQJXbMj4MzzYkO1CBDG0tI8I6yo5JDCOwjsmfQaSPlD0i/Yv0sSTEUt5KbICCpIoVQTSZcmHDFUI4A=';

function show1(deckDesc, deck) {
  deck = deck.replace('@','');
  var deckBuffer = Buffer.from(deck, 'base64');
  var deckbw = bitwise.buffer.read(deckBuffer);
  console.log(deckDesc, bitwise.bits.toString(deckbw, 4, ' '));
}
// M151A1
show1('무특성', '@Hs8ACYk='); // '무특성', 
show1('차량', '@HsEACYk='); // '차량',
show1('기갑', '@HsMACYk='); // '기갑', 
show1('지원', '@HsUACYk='); // '지원', 
show1('해병', '@HscACYk='); // '해병', 
show1('기계', '@HskACYk='); // '기계', 
show1('공수', '@HssACYk='); // '공수', 
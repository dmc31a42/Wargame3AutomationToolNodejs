const bitwise = require('bitwise');
const BitArray = require('node-bitarray');
// ThematicConstraint:[
//   {value: -1, name: "No"},
//   {value: -2, name: "Any"},
//   {value: 0, name: "Motorised"},
//   {value: 1, name: "Armored"},
//   {value: 2, name: "Support"},
//   {value: 3, name: "Marine"},
//   {value: 4, name: "Mecanized"},
//   {value: 5, name: "Airborne"},
//   {value: 6, name: "Naval"}],
// NationConstraint:[
//   {value: -1, name: "No"},
//   {value: 0, name: "Nations and coalitions"},
//   {value: 1, name: "Nations only"},
//   {value: 2, name: "Coalitions only"}],
// DateConstraint:[
//   {value: -1, name: "No"},
//   {value: 0, name: "Post-85"},
//   {value: 1, name: "Post-80"}],

class Wargame3DeckUnit {
  constructor(){

  }
  getVeterancy(){
    return this.VeterancyFromInt(this.veterancy);
  }
  static VeterancyFromInt(number){
    switch(number){
      case 0b000: return 'rookie';
      case 0b001: return 'trained';
      case 0b010: return 'hardened';
      case 0b011: return 'veteran';
      case 0b100: return 'elit';
    }
  }
}

class Wargame3DeckWithoutTransports extends Wargame3DeckUnit { // 14 bits
  constructor(buffer, offset){
    super();
    var pos = offset;
    var leftBits = bitwise.buffer.read(buffer, pos);
    if(leftBits.length >=14){
      this.veterancy = bitwise.buffer.readUInt(buffer, pos, 3); pos+=3;
      this.unit = bitwise.buffer.readUInt(buffer, pos, 11); pos+=11;
      this.lastOffset = pos;
      this.EOF = false;
    } else {
      this.lastOffset = offset + leftBits.length;
      this.EOF = true;
    }
  }
  
}

class Wargame3DeckWithOneTransports extends Wargame3DeckUnit { // 25 bits
  constructor(buffer, offset){
    super();
    var pos = offset;
    var leftBits = bitwise.buffer.read(buffer, pos);
    if(leftBits.length >=25){
      this.veterancy = bitwise.buffer.readUInt(buffer, pos, 3); pos+=3;
      this.unit = bitwise.buffer.readUInt(buffer, pos, 11); pos+=11;
      this.transport1 = bitwise.buffer.readUInt(buffer, pos, 11); pos+=11;
      this.lastOffset = pos;
      this.EOF = false;
    } else {
      this.lastOffset = offset + leftBits.length;
      this.EOF = true;
    }
  }  
}

class Wargame3DeckWithTwoTransports extends Wargame3DeckUnit { // 36 bits
  constructor(buffer, offset){
    super();
    var pos = offset;
    var leftBits = bitwise.buffer.read(buffer, pos);
    if(leftBits.length >=36){
      this.veterancy = bitwise.buffer.readUInt(buffer, pos, 3); pos+=3;
      this.unit = bitwise.buffer.readUInt(buffer, pos, 11); pos+=11;
      this.transport1 = bitwise.buffer.readUInt(buffer, pos, 11); pos+=11;
      this.transport2 = bitwise.buffer.readUInt(buffer, pos, 11); pos+=11;
      this.lastOffset = pos;
      this.EOF = false;
    } else {
      this.lastOffset = offset + leftBits.length;
      this.EOF = true;
    }
  }  
}

class Wargame3DeckSpecializationEnum { // Bits 12...14
  constructor(){  }
  static get No(){return 0b111;}
  static get Motorised(){return 0b000;}
  static get Armored(){return 0b001;}
  static get Support(){return 0b010;}
  static get Marine(){return 0b011;}
  static get Mecanized(){return 0b100;}
  static get Airborne(){return 0b101;}
  static get Naval(){return 0b110;}
  static FindFromInt(number){
    switch(number){
      case 0b111: return 'No'; break;
      case 0b000: return 'Motorised'; break;
      case 0b001: return 'Armored'; break;
      case 0b010: return 'Support'; break;
      case 0b011: return 'Marine'; break;
      case 0b100: return 'Mecanized'; break;
      case 0b101: return 'Airborne'; break;
      case 0b110: return 'Naval'; break;
    }
  }
}

class Wargame3DeckEraEnum { // Bits 15...16
  constructor(){}
  static get No(){return 0b10;}
  static get Post85(){return 0b01;}
  static get Post80(){return 0b00;}
  static FindFromInt(number){
    switch(number){
      case 0b10: return 'No'; break;
      case 0b01: return 'Post85'; break;
      case 0b00: return 'Post80'; break;
    }
  }
}

class Wargame3Deck {
  constructor(deckCode){
    this.FromDeckCode(deckCode);
  }
  static get Enum(){return {
    Specialization:Wargame3DeckSpecializationEnum,
    Era:Wargame3DeckEraEnum
  };}

  FromDeckCode(deckCode){
    deckCode = deckCode.replace('@','');
    this._deckBuffer = Buffer.from(deckCode, 'base64');
    this._deckBits = bitwise.buffer.read(this._deckBuffer);
    this._deckBitsLength = this._deckBits.length;
    var pos = 0;
    this.nation = bitwise.buffer.readUInt(this._deckBuffer, pos, 12); pos+=12; // Bits 0...11
    this.specialization = bitwise.buffer.readUInt(this._deckBuffer, pos, 3); pos+=3; // Bits 12...14
    this.era = bitwise.buffer.readUInt(this._deckBuffer, pos, 2); pos+=2; // Bits 15...16
    this.numberOfWithTwoTransports = bitwise.buffer.readUInt(this._deckBuffer, pos, 4); pos+=4; // Bits 17...20
    this.numberOfWithOneTransports = bitwise.buffer.readUInt(this._deckBuffer, pos, 5); pos+=5; // Bits 21...26
    // withTwoTransports 3+11+11+11 = 36
    this.withTwoTransports = [];
    for(var i=0; i<this.numberOfWithTwoTransports; i++){
      var tempWithTwoTransports = new Wargame3DeckWithTwoTransports(this._deckBuffer, pos);
      this.withTwoTransports.push(tempWithTwoTransports);
      pos = tempWithTwoTransports.lastOffset;
    }
    // withOneTransports 3+11+11 = 25
    this.withOneTransports = [];
    for(var i=0; i<this.numberOfWithOneTransports; i++){
      var tempWithOneTransports = new Wargame3DeckWithOneTransports(this._deckBuffer, pos);
      this.withOneTransports.push(tempWithOneTransports);
      pos = tempWithOneTransports.lastOffset;
    }
    // withOutTransports 14 bits
    this.withoutTransports = [];
    while (true){
      var tempWithoutTransports = new Wargame3DeckWithoutTransports(this._deckBuffer, pos);
      pos = tempWithoutTransports.lastOffset
      if(tempWithoutTransports.EOF) 
      {
        break;
      } else {
        this.withoutTransports.push(tempWithoutTransports);
      }
    }    
  }

  toBuffer(){
    var bits = [];
    bits = bits.concat(IntToBits(this.nation, 12));
    bits = bits.concat(IntToBits(this.specialization, 3));
    bits = bits.concat(IntToBits(this.era, 2));
    bits = bits.concat(IntToBits(this.withTwoTransports.length, 4));
    bits = bits.concat(IntToBits(this.withOneTransports.length, 5));
    this.withTwoTransports.forEach(element => {
      bits = bits.concat(IntToBits(element.veterancy, 3));
      bits = bits.concat(IntToBits(element.unit, 11));
      bits = bits.concat(IntToBits(element.transport1, 11));
      bits = bits.concat(IntToBits(element.transport2, 11));
    });
    this.withOneTransports.forEach(element => {
      bits = bits.concat(IntToBits(element.veterancy, 3));
      bits = bits.concat(IntToBits(element.unit, 11));
      bits = bits.concat(IntToBits(element.transport1, 11));
    })
    this.withoutTransports.forEach(element => {
      bits = bits.concat(IntToBits(element.veterancy, 3));
      bits = bits.concat(IntToBits(element.unit, 11));
    });
    return bitwise.buffer.create(bits);
  }

  toBase64(){
    return this.toBuffer().toString('base64');
  }

  toDeckCode(){
    return '@' + this.toBuffer().toString('base64');
  }

  toJSON(){
    return {
      //nation: Wargame3DeckSpecializationEnum.FindFromInt(this.nation),
      specialization: Wargame3DeckSpecializationEnum.FindFromInt(this.specialization),
      era: Wargame3DeckEraEnum.FindFromInt(this.era),
      numberOfWithTwoTransports: this.numberOfWithTwoTransports,
      numberOfWithOneTransports: this.numberOfWithOneTransports,
      withTwoTransports: this.withTwoTransports,
      withOneTransports: this.withOneTransports,
      withoutTransports: this.withoutTransports
    };
  }
}

function IntToBits(number, bitLength){
  var bits = BitArray.parse(number);
  return Array(bitLength-bits.length).fill(0).concat(bits);
}

var deck = '@Hg8CCAFK5AQj1GgQ2mQJXbMj4MzzYkO1CBDG0tI8I6yo5JDCOwjsmfQaSPlD0i/Yv0sSTEUt5KbICCpIoVQTSZcmHDFUI4A=';

function show1(deckDesc, deck) {
  deck = deck.replace('@','');
  var deckBuffer = Buffer.from(deck, 'base64');
  var deckbw = bitwise.buffer.read(deckBuffer, 0);
  console.log(deckDesc, bitwise.bits.toString(deckbw, 4, ' '));
}
// M151A1 시대
show1('없음  ', '@Hs8ACKA='); // '무특성', 
show1('신병  ', '@Hs8ACKAI4A=='); // '무특성', 
show1('기간병', '@Hs8ACKAo4A=='); // '차량',
show1('숙련병', '@Hs8ACKBI4A=='); // '기갑', 
show1('정예병', '@Hs8ACKBo4A=='); // '지원', 
show1('최정예', '@Hs8ACKCI4A=='); // '지원',  
show1('동백구', '@Hs8ACKCI4iQQ'); // '지원',  
show1('탑승3', '@Hs8A0hwFqQ4DdIcTARQRHESC'); // '지원',  
show1('탑31', '@Hs8IygU0aPUhwFqQ4DdIcTARQRHESCA=');

var BlueFor = new Wargame3Deck('@Hs8IygU0aPUhwFqQ4DdIcTARQRHESCA=')
var RedFor = new Wargame3Deck('@Us8ACHc=');
console.log(BlueFor);
console.log(RedFor);

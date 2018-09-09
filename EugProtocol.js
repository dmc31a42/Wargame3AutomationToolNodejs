/**
 * @class
 */
class EugProtocol {
  /**@constructor */
  constructor(){}
  /**
   * 
   * @param {Buffer} data 
   */
  FromBuffer(data){
      var pos = 0;
      /**@type {number} */
      this.CommandLen = data.readUIntBE(pos,2); pos+=2;
      /**@type {number} */
      this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
      /**@type {Buffer} */
      this.Left = data.slice(pos, this.CommandLen+2);
  }
  /**
   * @returns {Buffer}
   */
  getBuffer(){
      var length = 3 + this.Left.length;
      var buf = new Buffer(length);
      var pos = 0;
      buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
      buf.writeUIntBE(0xE1, pos, 1); pos+=1; // CommandCode
      this.Left.copy(buf, pos);
      return buf;
  }
}

module.exports = EugProtocol
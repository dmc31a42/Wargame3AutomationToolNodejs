/**@class */
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

/**
 * @class Wargame3_E1_Send
 */
class Wargame3_E1_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xE1
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        var pos = 0;
        this.send = true;
        this.receive = false;
        /**
         * Automatically calculated in {@link Wargame3_E1_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**@type {number} */
        this.ServerPort = data.readUIntLE(pos, 2); pos+=2;
        /**
         * (Little Endian) Wargame3: 24, Steel Division: 25
         * @type {number} 
         */
        this.Version = data.readUIntBE(pos, 4); pos+=4;
        /**
         * Little Endian IPv4 address to binary(integer)
         * @type {number} 
         * @example
         * IPv4 address (number): 127.0.0.1
         * IPv4 address (hex):    7F.00.00.01
         * Big Endian: 7F000001
         * Little Endian: 0100007F
         * Integer: 2,130,706,433
         */
        this.ServerIP = data.readUIntLE(pos, 4); pos+=4;
        /**
         * UNKNOWN, Must be 0
         * @type {number}
         */
        this.Unknown2 = data.readUIntBE(pos, 1); pos+=1;
        /**
         * Automatically calculated in {@link Wargame3_E1_Send#getBuffer}
         * @type {number}
         */
        this.EugNetIdLen = data.readUIntBE(pos, 4); pos+=4;
        /**
         * PlayerUserId로 바뀌어야함 {@link EugPlayer#PlayerUserId}
         * @type {String} 
         */
        this.EugNetId = data.toString('utf8', pos, pos+this.EugNetIdLen); pos+=this.EugNetIdLen;
        /**
         * Automatically calculated in {@link Wargame3_E1_Send#getBuffer}
         * @type {number}
         */
        this.DedicatedKeyLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.DedicatedKey = data.toString('utf8', pos, pos+this.DedicatedKeyLen); pos+=this.DedicatedKeyLen;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var EugNetId = Buffer.from(this.EugNetId);
        var EugNetIdLen = EugNetId.length;
        var DedicatedKey = Buffer.from(this.DedicatedKey);
        var DedicatedKeyLen = DedicatedKey.length;
        var length = 22+ EugNetIdLen + DedicatedKeyLen;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xE1, pos, 1); pos+=1; // CommandCode
        buf.writeUIntLE(this.ServerPort, pos, 2); pos+=2; // ServerPort
        buf.writeUIntBE(this.Version, pos, 4); pos+=4; // Version
        buf.writeUIntLE(this.ServerIP, pos, 4); pos+=4; // ServerIP
        buf.writeUIntBE(this.Unknown2, pos, 1); pos+=1; // Unknown2
        buf.writeUIntBE(EugNetIdLen, pos, 4); pos+=4; // EugNetIdLen
        EugNetId.copy(buf, pos); pos+=EugNetIdLen; // EugNetId
        buf.writeUIntBE(DedicatedKeyLen, pos, 4); pos+=4; // DedicatedKeyLen
        DedicatedKey.copy(buf, pos); pos+=DedicatedKeyLen; // DedicatedKey
        return buf;
    }
}

/**@class */
class Wargame3_E1_Receive extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xE1;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**@type {number}*/
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         * Unknown. Must be 0x00
         * @type {number}
         */
        this.Unknown1 = data.readUIntBE(pos, 1); pos+=1;
        /**
         * Automatically calculated in {@link Wargame3_E1_Receive#getBuffer}
         * Maybe notice from EugNet
         * @type {number}
         */
        this.StringLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.String = data.toString('utf8', pos, pos+this.StringLen); pos+=this.StringLen;
        /**
         * Unknown. Must be 0x0400
         * @type {number}
         */
        this.Unknown2 = data.readUIntBE(pos, 2); pos+=2;
        /**@type {number} */
        this.ServerPort = data.readUIntLE(pos, 2); pos+=2;
        /**
         * Little Endian IPv4 address to binary(integer)
         * @type {number} 
         * @example
         * IPv4 address (number): 127.0.0.1
         * IPv4 address (hex):    7F.00.00.01
         * Big Endian: 7F000001
         * Little Endian: 0100007F
         * Integer: 2,130,706,433
         */
        this.ServerIP = data.readUIntLE(pos, 4); pos+=4;
        return this;
    }
    /**
     * @function
     * @returns {Buffer}
     */
    getBuffer(){
        var StringBuffer = Buffer.from(this.String);
        var StringLen = StringBuffer.length;
        var length = 16 + StringLen;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xE1, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.Unknown1, pos, 1); pos+=1;
        buf.writeUIntBE(this.StringLen, pos, 4); pos+=4;
        StringBuffer.copy(buf, pos); pos+=StringLen;
        buf.writeUIntBE(this.Unknown2, pos, 2); pos+=2;
        buf.writeUIntLE(this.ServerPort, pos, 2); pos+=2;
        buf.writeUIntLE(this.ServerIP, pos, 4); pos+=4;
        return buf;
    }
}

// class Wargame3_C2_All {
//     constructor(){}
//     FromBuffer(data){
//         this.data = data;
//         var pos = 0;
//         this.send = false;
//         this.receive = true;
//         this.CommandLen = data.readUIntBE(pos,2); pos+=2;
//         this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
//         this.WhoSend = data.readUIntBE(pos, 4); pos+=4;
//         if(this.WhoSend == 0){
//             this.EugNetId = data.readUIntBE(pos,4); pos+=4;
//             this.send = true;
//             this.receive = false;
//         }
//         this.Type = data.readUIntBE(pos, 1); pos+=1;
//         if(this.Type == 0x65) {
//             this.Unknown1 = data.readUIntBE(pos, 3); pos+=3;
//             this.ChatLength = data.readUIntBE(pos, 2); pos+=2;
//             this.Padding = data.readUIntBE(pos, 1); pos+=1;
//             this.Chat = data.toString('utf8', pos, pos+this.ChatLength); pos+=this.ChatLength;
//             this.Left = data.slice(pos, this.CommandLen+2);
//         } else {
//             this.Left = data.slice(pos, this.CommandLen+2);
//         }
//         return this;
//     }
//     getBuffer(){
//         if(this.CommandCode){
//             var buf = {};
//             var length = 0;
//             if(this.Type == 0x65){
//                 var chatBuffer = Buffer.from(this.Chat);
//                 if(this.WhoSend == 0){
//                     if(this.Left){
//                         length = 18+chatBuffer.length+this.Left.length;
//                     } else {
//                         length = 18+chatBuffer.length;
//                     }
//                 } else {
//                     if(this.Left){
//                         length = 14+chatBuffer.length+this.Left.length;
//                     } else {
//                         length = 14+chatBuffer.length;
//                     }
//                 }
//                 buf = new Buffer(length);
//                 var pos = 0;
//                 buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
//                 buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
//                 buf.writeUIntBE(this.WhoSend, pos, 4); pos+=4;
//                 if(this.WhoSend==0){
//                     buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
//                 }
//                 buf.writeUIntBE(this.Type, pos, 1); pos+=1;
//                 buf.writeUIntBE(this.Unknown1, pos, 3); pos+=3;
//                 buf.writeUIntBE(chatBuffer.length, pos, 2); pos+=2;
//                 buf.writeUIntBE(this.Padding, pos, 1); pos+=1;
//                 chatBuffer.copy(buf, pos); pos+=chatBuffer.length;
//                 if(this.Left){
//                     this.Left.copy(buf, pos);
//                 }
//             } else {
//                 if(this.WhoSend == 0){
//                     if(this.Left){
//                         length = 12+this.Left.length;
//                     } else {
//                         length = 12;
//                     }
//                 } else {
//                     if(this.Left){
//                         length = 8+this.Left.length;
//                     } else {
//                         length = 8;
//                     }
//                 }  
//                 buf = new Buffer(length);
//                 var pos = 0;
//                 buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
//                 buf.writeUIntBE(this.CommandCode, pos, 1); pos+=1; // CommandCode
//                 buf.writeUIntBE(this.WhoSend, pos, 4); pos+=4;
//                 if(this.WhoSend==0){
//                     buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
//                 }
//                 buf.writeUIntBE(this.Type, pos, 1); pos+=1;
//                 if(this.Left){
//                     this.Left.copy(buf, pos);
//                 }
//             }
//             return buf;
//         } else {
//             return ;
//         }
//     }
// }

/**@class */
class Wargame3_C2_Receive extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC2;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Wargame3_C2_Receive#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /** 
         * If player send to dedicated server, WhoSend is 0xFFFFFFFF.
         * Else (dedicated server send to all player), WhoSend is 0x00000000.
         * So it is fixed as 0xFFFFFFFF
         * @type {number}
        */
        this.WhoSend = data.readUIntBE(pos, 4); pos+=4;
        /**
         * If chat, Type is 0x65.
         * And there are unknown 0x64, 0x67.
         * @type {number}
         */
        this.Type = data.readUIntBE(pos, 1); pos+=1;
        if(this.Type == 0x65) {
            /**
             * Unknown. Maybe Timer/Counter. It seems as Little Endian.
             * It should be changed as LE. 
             * @type {number}
             */
            this.Unknown1 = data.readUIntBE(pos, 3); pos+=3;
            /**
             * Automatically calculated in {@link Wargame3_C2_Receive#getBuffer}
             * @type {number}
             */
            this.ChatLength = data.readUIntBE(pos, 2); pos+=2;
            /**
             * Unknown. Must be 0x00
             * @type {number}
             */
            this.Padding = data.readUIntBE(pos, 1); pos+=1;
            /**
             * chat.
             * @type {String}
             */
            this.Chat = data.toString('utf8', pos, pos+this.ChatLength); pos+=this.ChatLength;
        }
        /**
         * If {@link Wargame3_C2_Receive#Type} is not 0x65, left byte are in {@link Wargame3_C2_Receive#Left}
         * @type {Buffer}
         */
        this.Left = data.slice(pos, this.CommandLen+2);
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var buf = {};
        var length = 0;
        var chatBuffer;
        if(this.Type == 0x65){
            chatBuffer = Buffer.from(this.Chat);
            length = 14+chatBuffer.length;
        }
        else {
            length = 8;
        }
        if(this.Left){
            length += this.Left.length;
        }
        buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC2, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.WhoSend, pos, 4); pos+=4;
        buf.writeUIntBE(this.Type, pos, 1); pos+=1;
        if(this.Type == 0x65) {
            buf.writeUIntBE(this.Unknown1, pos, 3); pos+=3;
            buf.writeUIntBE(chatBuffer.length, pos, 2); pos+=2;
            buf.writeUIntBE(this.Padding, pos, 1); pos+=1;
            chatBuffer.copy(buf, pos); pos+=chatBuffer.length;
        }
        if(this.Left){
            this.Left.copy(buf, pos);
        }
        return buf;
    }
}

/**@class */
class Wargame3_C2_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC2;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = true;
        this.receive = false;
        /**
         * Automatically calculated in {@link Wargame3_C2_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /** 
         * If player send to dedicated server, WhoSend is 0xFFFFFFFF.
         * Else (dedicated server send to all player), WhoSend is 0x00000000.
         * So it is fixed as 0x00000000
         * @type {number}
        */
        this.WhoSend = data.readUIntBE(pos, 4); pos+=4;
        /**
         * It should be changed as PlayerUserId
         * @type {number}
         */
        this.EugNetId = data.readUIntBE(pos,4); pos+=4;  
        /**
         * If chat, Type is 0x65.
         * And there are unknown 0x64, 0x67.
         * @type {number}
         */  
        this.Type = data.readUIntBE(pos, 1); pos+=1;
        if(this.Type == 0x65) {
            /**
             * Unknown. Maybe Timer/Counter. It seems as Little Endian.
             * It should be changed as LE. 
             * @type {number}
             */
            this.Unknown1 = data.readUIntBE(pos, 3); pos+=3;
            /**
             * Automatically calculated in {@link Wargame3_C2_Send#getBuffer}
             * @type {number}
             */
            this.ChatLength = data.readUIntBE(pos, 2); pos+=2;
            /**
             * Unknown. Must be 0x00
             * @type {number}
             */
            this.Padding = data.readUIntBE(pos, 1); pos+=1;
            /**
             * chat.
             * @type {String}
             */
            this.Chat = data.toString('utf8', pos, pos+this.ChatLength); pos+=this.ChatLength;
        }
        /**
         * If {@link Wargame3_C2_Send#Type} is not 0x65, left byte are in {@link Wargame3_C2_Send#Left}
         * @type {Buffer}
         */
        this.Left = data.slice(pos, this.CommandLen+2);
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var buf = {};
        var length = 0;
        var chatBuffer;
        if(this.Type == 0x65){
            var chatBuffer = Buffer.from(this.Chat);
            length = 18+chatBuffer.length;
        } else {
            length = 12;
        }
        if(this.Left){
            length += this.Left.length;
        }                
        buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC2, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.WhoSend, pos, 4); pos+=4;
        buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
        buf.writeUIntBE(this.Type, pos, 1); pos+=1;
        if(this.Type == 0x65) {
            buf.writeUIntBE(this.Unknown1, pos, 3); pos+=3;
            buf.writeUIntBE(chatBuffer.length, pos, 2); pos+=2;
            buf.writeUIntBE(this.Padding, pos, 1); pos+=1;
            chatBuffer.copy(buf, pos); pos+=chatBuffer.length;
        }
        if(this.Left){
            this.Left.copy(buf, pos);
        }
        return buf;
    }
}
/**@class */
class Wargame3_C1_Receive extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC1;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Wargame3_C1_Receive#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         * Unknown. Must be 0x00000000
         * @type {number}
         */
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        /**
         * It should be changed as PlayerUserId
         * @type {number}
         */
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        /**
         * Unknown. Maybe abount authentication.
         * @type {Buffer}
         */
        this.Unknown2 = data.slice(pos, pos+128); pos+=128;
        /**
         * Automatically calculated in {@link Wargame3_C1_Receive#getBuffer}
         * @type {number}
         */
        this.VersionLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Version = data.toString('utf8', pos, pos+this.VersionLen); pos+=this.VersionLen;
        /**
         * Unknown. Must be 0x00
         * @type {number}
         */
        this.Unknown3 = data.readUIntBE(pos, 1); pos+=1;
        /**
         * Automatically calculated in {@link Wargame3_C1_Receive#getBuffer}
         * @type {number}
         */
        this.PasswordLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Password = data.toString('utf8', pos, pos+this.PasswordLen); pos+=this.PasswordLen;
        return this;
    }
    /**@returns {Buffer} */
    getBuffer(){
        var Version = Buffer.from(this.Version);
        var VersionLen = Version.length;
        var Password = Buffer.from(this.Password);
        var PasswordLen = Password.length;
        var Unknown2Len = this.Unknown2.length;
        var length = 20 + VersionLen + PasswordLen + Unknown2Len;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC1, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
        buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
        this.Unknown2.copy(buf, pos); pos+=Unknown2Len;
        buf.writeUIntBE(VersionLen, pos, 4); pos+=4;
        Version.copy(buf, pos); pos+=VersionLen;
        buf.writeUIntBE(this.Unknown3, pos, 1); pos+=1;
        buf.writeUIntBE(PasswordLen, pos, 4); pos+=4;
        Password.copy(buf, pos); pos+=PasswordLen;
        return buf;
    }
}

/**@class */
class Wargame3_C1_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC1;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Wargame3_C1_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         * Dedicated Server tell you what your UserSessionId(->PlayerNumber) is
         * It should be changed as PlayerNumber. because not sure UserSessionId and PlayerNumber are same or not
         * @type {number}
         */
        this.UserSessionId = data.readUIntBE(pos, 4); pos+=4;
        /**
         * @see Wargame3_C1_Send#ClientObsMod
         * @type {number}
         */
        this.Unknown1 = data.slice(pos, pos+1); pos+=1;
        /**
         * Maybe(in steel division case) about Client or Observer(Spector)
         * In steel division, Client: 0x00, Observer(Spector): 0x35. 
         * but which Unknown1 or ClientObsMod is correct or not(1 byte / 4 byte or 4 byte / 1 byte)
         * @type {number} 
         */
        this.ClientObsMod = data.slice(pos, pos+4); pos+=4;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var length = 12;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC1, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.UserSessionId, pos, 4); pos+=4;
        buf.writeUIntBE(this.Unknown1, pos, 1); pos+=1;
        buf.writeUIntBE(this.ClientObsMod, pos, 4); pos+=4;
        return buf;
    }
}

/**@class */
class Steel_C1_Receive extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC1;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Steel_C1_Receive#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         * Unknown. Must be 0x00000000
         * @type {number}
         */
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        /**
         * It should be changed as PlayerUserId
         * @type {number}
         */
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        /**
         * Unknown. Maybe abount authentication.
         * @type {Buffer}
         */
        this.Unknown2 = data.slice(pos, pos+128); pos+=128;
        /**
         * Automatically calculated in {@link Wargame3_C1_Receive#getBuffer}
         * @type {number}
         */
        this.VersionLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Version = data.toString('utf8', pos, pos+this.VersionLen); pos+=this.VersionLen;
        /**
         * Unknown. Must be 0x00
         * @type {number}
         */
        this.Unknown3 = data.readUIntBE(pos, 2); pos+=2;
        /**
         * Automatically calculated in {@link Wargame3_C1_Receive#getBuffer}
         * @type {number}
         */
        this.PasswordLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Password = data.toString('utf8', pos, pos+this.PasswordLen); pos+=this.PasswordLen;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var Version = Buffer.from(this.Version);
        var VersionLen = Version.length;
        var Password = Buffer.from(this.Password);
        var PasswordLen = Password.length;
        var Unknown2Len = this.Unknown2.length;
        var length = 21 + VersionLen + PasswordLen + Unknown2Len;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC1, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
        buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
        this.Unknown2.copy(buf, pos); pos+=Unknown2Len;
        buf.writeUIntBE(VersionLen, pos, 4); pos+=4;
        Version.copy(buf, pos); pos+=VersionLen;
        buf.writeUIntBE(this.Unknown3, pos, 2); pos+=2;
        buf.writeUIntBE(PasswordLen, pos, 4); pos+=4;
        Password.copy(buf, pos); pos+=PasswordLen;
        return buf;
    }
}

/**@class */
class Steel_C1_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC1;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Steel_C1_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         * Dedicated Server tell you what your UserSessionId(->PlayerNumber) is
         * It should be changed as PlayerNumber. because not sure UserSessionId and PlayerNumber are same or not
         * @type {number}
         */
        this.UserSessionId = data.readUIntBE(pos, 4); pos+=4;
        /**
         * Maybe(in steel division case) about Client or Observer(Spector)
         * In steel division, Client: 0x00, Observer(Spector): 0x35. 
         * but which Unknown1 or ClientObsMod is correct or not(1 byte / 4 byte or 4 byte / 1 byte)
         * @type {number} 
         */
        this.ClientObsMod = data.slice(pos, pos+4); pos+=4;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var length = 11;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC1, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.UserSessionId, pos, 4); pos+=4;
        buf.writeUIntBE(this.ClientObsMod, pos, 4); pos+=4;
        return buf;
    }
}

/**@class */
class Wargame3_C8_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC8;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Wargame3_C8_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         *  Unknown. Maybe This player is ready? loaded? 0 not ready, 1 ready, 2 special(like spector)?
         * @type {number}
         */
        this.UnknownMod = data.readUIntBE(pos, 1); pos+=1;
        /**
         * Unknown. It should be 0x00000000
         * @type {number}
         */
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        /**
         * It should be changed as PlayerUserId
         * @type {number}
         */
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        /**
         * Maybe change between Unknown2 and PlayerNumber each other.
         * Maybe this is PlayerNumber.
         * @type {number}
         */
        this.Unknown2 = data.readUIntBE(pos, 1); pos+=1;
        /**
         * Maybe change between Unknown2 and PlayerNumber each other.
         * Maybe this is opposition of {@link Wargame3_C8_Send#UnknownMod}
         * This value works in reverse. 
         * @type {number}
         */
        this.PlayerNumber = data.readUIntBE(pos, 4); pos+=4;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var length = 17;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC8, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.UnknownMod, pos, 1); pos+=1;
        buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
        buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
        buf.writeUIntBE(this.Unknown2, pos, 1); pos+=1;
        buf.writeUIntBE(this.PlayerNumber, pos, 4); pos+=4;
        return buf;
    }
}

/**@class */
class Steel_C8_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC8;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Steel_C8_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         *  Unknown. Maybe This player is ready? loaded? 0 not ready, 1 ready, 2 special(like spector)?
         * @type {number}
         */
        this.UnknownMod = data.readUIntBE(pos, 1); pos+=1;
        /**
         * Unknown. It should be 0x00000000
         * @type {number}
         */
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        /**
         * It should be changed as PlayerUserId
         * @type {number}
         */
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        /**.
         * Maybe this is PlayerNumber.
         * @type {number}
         */
        this.PlayerNumber = data.readUIntBE(pos, 4); pos+=4;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var length = 16;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC8, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.UnknownMod, pos, 1); pos+=1;
        buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
        buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
        buf.writeUIntBE(this.PlayerNumber, pos, 4); pos+=4;
        return buf;
    }
}

/**
 * Dedicated server send to all player about player's propertys
 * @class
 */
class Wargame3_CA_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xCA;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Wargame3_CA_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**@type {number} */
        this.PlayerNumber = data.readUIntBE(pos, 4); pos+=4;
        /**
         * Automatically calculated in {@link Wargame3_CA_Send#getBuffer}
         * @type {number}
         */
        this.PropertyLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Property = data.toString('utf8', pos, pos+this.PropertyLen); pos+=this.PropertyLen;
        /**
         * Automatically calculated in {@link Wargame3_CA_Send#getBuffer}
         * @type {number}
         */
        this.ValueLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Value = data.toString('utf8', pos, pos+this.ValueLen); pos+=this.ValueLen;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var Property = Buffer.from(this.Property);
        var PropertyLen = Property.length;
        var Value = Buffer.from(this.Value);
        var ValueLen = Value.length;
        var length = 15 + PropertyLen + ValueLen;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xCA, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.PlayerNumber, pos, 4); pos+=4;
        buf.writeUIntBE(PropertyLen, pos, 4); pos+=4;
        Property.copy(buf, pos); pos+=PropertyLen;
        buf.writeUIntBE(ValueLen, pos, 4); pos+=4;
        Value.copy(buf, pos); pos+=ValueLen;
        return buf;
    }
}

/**
 * Dedicated server send to all player about server's propertys
 * @class
 */
class Wargame3_C9_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xC9;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Wargame3_C9_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         * Automatically calculated in {@link Wargame3_C9_Send#getBuffer}
         * @type {number}
         */
        this.PropertyLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Property = data.toString('utf8', pos, pos+this.PropertyLen); pos+=this.PropertyLen;
        /**
         * Automatically calculated in {@link Wargame3_C9_Send#getBuffer}
         * @type {number}
         */
        this.ValueLen = data.readUIntBE(pos, 4); pos+=4;
        /**@type {String} */
        this.Value = data.toString('utf8', pos, pos+this.ValueLen); pos+=this.ValueLen;
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var Property = Buffer.from(this.Property);
        var PropertyLen = Property.length;
        var Value = Buffer.from(this.Value);
        var ValueLen = Value.length;
        var length = 11 + PropertyLen + ValueLen;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xC9, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(PropertyLen, pos, 4); pos+=4;
        Property.copy(buf, pos); pos+=PropertyLen;
        buf.writeUIntBE(ValueLen, pos, 4); pos+=4;
        Value.copy(buf, pos); pos+=ValueLen;
        return buf;
    }
}

/**
 * Dedicated server send replay file to observer(spector) player in stream
 */
class Steel_CF_Send extends EugProtocol{
    constructor(){
        super();
        /**@type {number} */
        this.CommandCode = 0xCF;
    }
    /**
     * 
     * @param {Buffer} data 
     */
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        /**
         * Automatically calculated in {@link Steel_CF_Send#getBuffer}
         * @type {number}
         */
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        // this.CommandCode = data.readUIntBE(pos, 1); 
        pos+=1;
        /**
         * Maybe padding 0x00000000
         * @type {number} 
         * */
        this.Padding = data.readUIntBE(pos, 4); pos+=4;
        /** 
         * Replay file stream
         * @type {Buffer}
         */
        this.Buffer = data.slice(pos);
        return this;
    }
    /**
     * @returns {Buffer}
     */
    getBuffer(){
        var length = 7 + this.Buffer.length;
        var buf = new Buffer(length);
        var pos = 0;
        buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
        buf.writeUIntBE(0xCF, pos, 1); pos+=1; // CommandCode
        buf.writeUIntBE(this.Padding, pos, 4); pos+=4;
        this.Buffer.copy(buf, pos); pos+=this.Buffer.length;
        return buf;
    }
}

module.exports = {
    Wargame3_E1_Send: Wargame3_E1_Send,
    Wargame3_E1_Receive: Wargame3_E1_Receive,
    //Wargame3_C2_All: Wargame3_C2_All,
    Wargame3_C2_Receive: Wargame3_C2_Receive,
    Wargame3_C2_Send: Wargame3_C2_Send,
    Wargame3_C1_Receive: Wargame3_C1_Receive,
    Wargame3_C1_Send: Wargame3_C1_Send,
    Steel_C1_Receive: Steel_C1_Receive,
    Steel_C1_Send: Steel_C1_Send,
    Wargame3_C8_Send: Wargame3_C8_Send,
    Steel_C8_Send: Steel_C8_Send,
    Wargame3_CA_Send: Wargame3_CA_Send,
    Wargame3_C9_Send: Wargame3_C9_Send,
    Steel_CF_Send: Steel_CF_Send,
    Wargame3: {
        DedicatedToEug: {
            E1: Wargame3_E1_Send
        },
        EugToDedicated: {
            E1: Wargame3_E1_Receive,
        },
        UserToDedicated: {
            //C2: Wargame3_C2_All,
            C2: Wargame3_C2_Receive,
            C1: Wargame3_C1_Receive,
        },
        DedicatedToUser: {
            //C2: Wargame3_C2_All,
            C2: Wargame3_C2_Send,
            C1: Wargame3_C1_Send,
            C8: Wargame3_C8_Send,
            CA: Wargame3_CA_Send,
            C9: Wargame3_C9_Send,
        }
    },
    Steel: {
        DedicatedToEug: {
            E1: Wargame3_E1_Send
        },
        EugToDedicated: {
            E1: Wargame3_E1_Receive,
        },
        UserToDedicated: {
            //C2: Wargame3_C2_All,
            C2: Wargame3_C2_Receive,
            C1: Steel_C1_Receive,
        },
        DedicatedToUser: {
            //C2: Wargame3_C2_All,
            C2: Wargame3_C2_Send,
            C1: Steel_C1_Send,
            C8: Steel_C8_Send,
            CA: Wargame3_CA_Send,
            C9: Wargame3_C9_Send,
            CF: Steel_CF_Send,
        }
    }
}

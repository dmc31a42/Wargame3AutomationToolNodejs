class Wargame3_E1_Send {
    constructor(){
    }
    FromBuffer(data){
        var pos = 0;
        this.send = true;
        this.receive = false;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.ServerPort = data.readUIntLE(pos, 2); pos+=2;
        this.Version = data.readUIntBE(pos, 4); pos+=4;
        this.ServerIP = data.readUIntLE(pos, 4); pos+=4;
        this.Unknown2 = data.readUIntBE(pos, 1); pos+=1;
        this.EugNetIdLen = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.toString('utf8', pos, pos+this.EugNetIdLen); pos+=this.EugNetIdLen;
        this.DedicatedKeyLen = data.readUIntBE(pos, 4); pos+=4;
        this.DedicatedKey = data.toString('utf8', pos, pos+this.DedicatedKeyLen); pos+=this.DedicatedKeyLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
    }
}

class Wargame3_E1_Receive {
    constructor(){}
    FromBuffer(data){
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 1); pos+=1;
        this.StringLen = data.readUIntBE(pos, 4); pos+=4;
        this.String = data.toString('utf8', pos, pos+this.StringLen); pos+=this.StringLen;
        this.Unknown2 = data.readUIntBE(pos, 2); pos+=2;
        this.ServerPort = data.readUIntLE(pos, 2); pos+=2;
        this.ServerIP = data.readUIntLE(pos, 4); pos+=4;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
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

class Wargame3_C2_Receive {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.WhoSend = data.readUIntBE(pos, 4); pos+=4;
        this.Type = data.readUIntBE(pos, 1); pos+=1;
        if(this.Type == 0x65) {
            this.Unknown1 = data.readUIntBE(pos, 3); pos+=3;
            this.ChatLength = data.readUIntBE(pos, 2); pos+=2;
            this.Padding = data.readUIntBE(pos, 1); pos+=1;
            this.Chat = data.toString('utf8', pos, pos+this.ChatLength); pos+=this.ChatLength;
        }
        this.Left = data.slice(pos, this.CommandLen+2);
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
    }
}

class Wargame3_C2_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = true;
        this.receive = false;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.WhoSend = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos,4); pos+=4;    
        this.Type = data.readUIntBE(pos, 1); pos+=1;
        if(this.Type == 0x65) {
            this.Unknown1 = data.readUIntBE(pos, 3); pos+=3;
            this.ChatLength = data.readUIntBE(pos, 2); pos+=2;
            this.Padding = data.readUIntBE(pos, 1); pos+=1;
            this.Chat = data.toString('utf8', pos, pos+this.ChatLength); pos+=this.ChatLength;
        }
        this.Left = data.slice(pos, this.CommandLen+2);
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
    }
}

class Wargame3_C1_Receive {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown2 = data.slice(pos, pos+128); pos+=128;
        this.VersionLen = data.readUIntBE(pos, 4); pos+=4;
        this.Version = data.toString('utf8', pos, pos+this.VersionLen); pos+=this.VersionLen;
        this.Unknown3 = data.readUIntBE(pos, 1); pos+=1;
        this.PasswordLen = data.readUIntBE(pos, 4); pos+=4;
        this.Password = data.toString('utf8', pos, pos+this.PasswordLen); pos+=this.PasswordLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
    }
}

class Wargame3_C1_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UserSessionId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown1 = data.slice(pos, pos+1); pos+=1; // Client:0x00, Obs: 0x35??
        this.ClientObsMod = data.slice(pos, pos+4); pos+=4; // i don't know exactly 1 byte / 4byte or 4byte / 1byte
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 12;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(0xC1, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UserSessionId, pos, 4); pos+=4;
            buf.writeUIntBE(this.Unknown1, pos, 1); pos+=1;
            buf.writeUIntBE(this.ClientObsMod, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Steel_C1_Receive {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown2 = data.slice(pos, pos+128); pos+=128;
        this.VersionLen = data.readUIntBE(pos, 4); pos+=4;
        this.Version = data.toString('utf8', pos, pos+this.VersionLen); pos+=this.VersionLen;
        this.Unknown3 = data.readUIntBE(pos, 2); pos+=2;
        this.PasswordLen = data.readUIntBE(pos, 4); pos+=4;
        this.Password = data.toString('utf8', pos, pos+this.PasswordLen); pos+=this.PasswordLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
    }
}

class Steel_C1_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UserSessionId = data.readUIntBE(pos, 4); pos+=4;
        this.ClientObsMod = data.slice(pos, pos+4); pos+=4; // Client:0x00, Obs: 0x35
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 11;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(0xC1, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UserSessionId, pos, 4); pos+=4;
            buf.writeUIntBE(this.ClientObsMod, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_C8_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UnknownMod = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.Unknown2 = data.readUIntBE(pos, 1); pos+=1;
        this.PlayerNumber = data.readUIntLE(pos, 4); pos+=4;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 17;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(0xC8, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UnknownMod, pos, 1); pos+=1;
            buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
            buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
            buf.writeUIntBE(this.Unknown2, pos, 1); pos+=1;
            buf.writeUIntLE(this.PlayerNumber, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Steel_C8_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.UnknownMod = data.readUIntBE(pos, 1); pos+=1;
        this.Unknown1 = data.readUIntBE(pos, 4); pos+=4;
        this.EugNetId = data.readUIntBE(pos, 4); pos+=4;
        this.PlayerNumber = data.readUIntLE(pos, 4); pos+=4;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 16;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(0xC8, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.UnknownMod, pos, 1); pos+=1;
            buf.writeUIntBE(this.Unknown1, pos, 4); pos+=4;
            buf.writeUIntBE(this.EugNetId, pos, 4); pos+=4;
            buf.writeUIntLE(this.PlayerNumber, pos, 4); pos+=4;
            return buf;
        } else {
            return ;
        }
    }
}

class Wargame3_CA_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.PlayerNumber = data.readUIntBE(pos, 4); pos+=4;
        this.PropertyLen = data.readUIntBE(pos, 4); pos+=4;
        this.Property = data.toString('utf8', pos, pos+this.PropertyLen); pos+=this.PropertyLen;
        this.ValueLen = data.readUIntBE(pos, 4); pos+=4;
        this.Value = data.toString('utf8', pos, pos+this.ValueLen); pos+=this.ValueLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
    }
}

class Wargame3_C9_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.PropertyLen = data.readUIntBE(pos, 4); pos+=4;
        this.Property = data.toString('utf8', pos, pos+this.PropertyLen); pos+=this.PropertyLen;
        this.ValueLen = data.readUIntBE(pos, 4); pos+=4;
        this.Value = data.toString('utf8', pos, pos+this.ValueLen); pos+=this.ValueLen;
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
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
        } else {
            return ;
        }
    }
}

class Steel_CF_Send {
    constructor(){}
    FromBuffer(data){
        this.data = data;
        var pos = 0;
        this.send = false;
        this.receive = true;
        this.CommandLen = data.readUIntBE(pos,2); pos+=2;
        this.CommandCode = data.readUIntBE(pos, 1); pos+=1;
        this.Padding = data.readUIntBE(pos, 4); pos+=4;
        this.Buffer = data.slice(pos);
        return this;
    }
    getBuffer(){
        if(this.CommandCode){
            var length = 7 + this.Buffer.length;
            var buf = new Buffer(length);
            var pos = 0;
            buf.writeUIntBE(length-2, pos, 2); pos+=2; // CommandLen
            buf.writeUIntBE(0xCF, pos, 1); pos+=1; // CommandCode
            buf.writeUIntBE(this.Padding, pos, 4); pos+=4;
            this.Buffer.copy(buf, pos); pos+=this.Buffer.length;
            return buf;
        } else {
            return ;
        }
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

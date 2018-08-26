var dgram = require('dgram');
var events = require('events');
var util = require('util');
var net = require('net');

class Wargame3_UDP_Receive {
    constructor(){}
    FromBuffer(data){
        this.Buffer = data;
        this.Code = data.toString('utf8', 0, data.length);
        return this;
    }
    getBuffer(){
        var buf = Buffer.from(this.Code);
        return buf;
    }
}

class Wargame3_UDP_Send {
    constructor(){}
    FromBuffer(data){
        var pos = 0;
        this.Buffer = data;
        this.Code = data.toString('utf8', pos, 4); pos+=4; pos+=1;
        while(pos<data.length){
            var propertyEnd = data.indexOf(0x01, pos);
            if(propertyEnd>-1){
                var property = data.toString('utf8', pos, propertyEnd); pos=propertyEnd+1;
                var valueEnd = data.indexOf(0x01, pos);
                var valueLength = valueEnd - pos;
                switch (property) {
                    case "DateConstraint":
                        this.DateConstraint = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "DebriefingTimeMax":
                        this.DebriefingTimeMax = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "DeltaMaxTeamSize":
                        this.DeltaMaxTeamSize = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "DeploiementTimeMax":
                        this.DeploiementTimeMax = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "GameState":
                        this.GameState = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "GameType":
                        this.GameType = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "IncomeRate":
                        this.IncomeRate = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "InitMoney":
                        this.InitMoney = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "LoadingTimeMax":
                        this.LoadingTimeMax = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Map":
                        this.Map = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "MaxTeamSize":
                        this.MaxTeamSize = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NationConstraint":
                        this.NationConstraint = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbIA":
                        this.NbIA = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbMaxPlayer":
                        this.NbMaxPlayer = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbMinPlayer":
                        this.NbMinPlayer = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbPlayer":
                        this.NbPlayer = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NeedPassword":
                        this.NeedPassword = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Password":
                        this.Password = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Private":
                        this.Private = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ScoreLimit":
                        this.ScoreLimit = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Seed":
                        this.Seed = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ServerName":
                        this.ServerName = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ServerProtocol":
                        this.ServerProtocol = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ThematicConstraint":
                        this.ThematicConstraint = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "TimeLeft":
                        this.TimeLeft = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "TimeLimit":
                        this.TimeLimit = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Version":
                        this.Version = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "VictoryCond":
                        this.VictoryCond = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "WarmupCountdown":
                        this.WarmupCountdown = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "WithHost":
                        this.WithHost = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    default:
                        throw ("UnknownProperty");
                }
            } else {
                break;
            }
            pos+=1;
        }
        return this;
    }
    getBuffer(){
        try{
        var Code = Buffer.from(this.Code);
        var DateConstraint = Buffer.from(this.DateConstraint);
        var DebriefingTimeMax = Buffer.from(this.DebriefingTimeMax);
        var DeltaMaxTeamSize = Buffer.from(this.DeltaMaxTeamSize);
        var DeploiementTimeMax = Buffer.from(this.DeploiementTimeMax);
        var GameState = Buffer.from(this.GameState);
        var GameType = Buffer.from(this.GameType);
        var IncomeRate = Buffer.from(this.IncomeRate);
        var InitMoney = Buffer.from(this.InitMoney);
        var LoadingTimeMax = Buffer.from(this.LoadingTimeMax);
        var _Map = Buffer.from(this.Map);
        var MaxTeamSize = Buffer.from(this.MaxTeamSize);
        var NationConstraint = Buffer.from(this.NationConstraint);
        var NbIA = Buffer.from(this.NbIA);
        var NbMaxPlayer = Buffer.from(this.NbMaxPlayer);
        var NbMinPlayer = Buffer.from(this.NbMinPlayer);
        var NbPlayer = Buffer.from(this.NbPlayer);
        var NeedPassword = Buffer.from(this.NeedPassword);
        var Password = Buffer.from(this.Password);
        var Private = Buffer.from(this.Private);
        var ScoreLimit = Buffer.from(this.ScoreLimit);
        var Seed = Buffer.from(this.Seed);
        var ServerName = Buffer.from(this.ServerName);
        var ServerProtocol = Buffer.from(this.ServerProtocol);
        var ThematicConstraint = Buffer.from(this.ThematicConstraint);
        var TimeLeft = Buffer.from(this.TimeLeft);
        var TimeLimit = Buffer.from(this.TimeLimit);
        var Version = Buffer.from(this.Version);
        var VictoryCond = Buffer.from(this.VictoryCond);
        var WarmupCountdown = Buffer.from(this.WarmupCountdown);
        var WithHost = Buffer.from(this.WithHost);
        var length = 320+61
            +Code.length
            +DateConstraint.length
            +DebriefingTimeMax.length
            +DeltaMaxTeamSize.length
            +DeploiementTimeMax.length
            +GameState.length
            +GameType.length
            +IncomeRate.length
            +InitMoney.length
            +LoadingTimeMax.length
            +_Map.length
            +MaxTeamSize.length
            +NationConstraint.length
            +NbIA.length
            +NbMaxPlayer.length
            +NbMinPlayer.length
            +NbPlayer.length
            +NeedPassword.length
            +Password.length
            +Private.length
            +ScoreLimit.length
            +Seed.length
            +ServerName.length
            +ServerProtocol.length
            +ThematicConstraint.length
            +TimeLeft.length
            +TimeLimit.length
            +Version.length
            +VictoryCond.length
            +WarmupCountdown.length
            +WithHost.length;
        var pos = 0;
        var buf = Buffer.alloc(length);
        Code.copy(buf, pos); pos+=Code.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("DateConstraint", pos); pos+=14;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        DateConstraint.copy(buf, pos); pos+=DateConstraint.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("DebriefingTimeMax", pos); pos+=17;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        DebriefingTimeMax.copy(buf, pos); pos+=DebriefingTimeMax.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("DeltaMaxTeamSize", pos); pos+=16;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        DeltaMaxTeamSize.copy(buf, pos); pos+=DeltaMaxTeamSize.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("DeploiementTimeMax", pos); pos+=18;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        DeploiementTimeMax.copy(buf, pos); pos+=DeploiementTimeMax.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("GameState", pos); pos+=9;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        GameState.copy(buf, pos); pos+=GameState.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("GameType", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        GameType.copy(buf, pos); pos+=GameType.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("IncomeRate", pos); pos+=10;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        IncomeRate.copy(buf, pos); pos+=IncomeRate.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("InitMoney", pos); pos+=9;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        InitMoney.copy(buf, pos); pos+=InitMoney.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("LoadingTimeMax", pos); pos+=14;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        LoadingTimeMax.copy(buf, pos); pos+=LoadingTimeMax.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Map", pos); pos+=3;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        _Map.copy(buf, pos); pos+=_Map.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("MaxTeamSize", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        MaxTeamSize.copy(buf, pos); pos+=MaxTeamSize.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NationConstraint", pos); pos+=16;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NationConstraint.copy(buf, pos); pos+=NationConstraint.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbIA", pos); pos+=4;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbIA.copy(buf, pos); pos+=NbIA.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbMaxPlayer", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbMaxPlayer.copy(buf, pos); pos+=NbMaxPlayer.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbMinPlayer", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbMinPlayer.copy(buf, pos); pos+=NbMinPlayer.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbPlayer", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbPlayer.copy(buf, pos); pos+=NbPlayer.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NeedPassword", pos); pos+=12;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NeedPassword.copy(buf, pos); pos+=NeedPassword.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Password", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Password.copy(buf, pos); pos+=Password.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Private", pos); pos+=7;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Private.copy(buf, pos); pos+=Private.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ScoreLimit", pos); pos+=10;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ScoreLimit.copy(buf, pos); pos+=ScoreLimit.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Seed", pos); pos+=4;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Seed.copy(buf, pos); pos+=Seed.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ServerName", pos); pos+=10;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ServerName.copy(buf, pos); pos+=ServerName.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ServerProtocol", pos); pos+=14;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ServerProtocol.copy(buf, pos); pos+=ServerProtocol.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ThematicConstraint", pos); pos+=18;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ThematicConstraint.copy(buf, pos); pos+=ThematicConstraint.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("TimeLeft", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        TimeLeft.copy(buf, pos); pos+=TimeLeft.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("TimeLimit", pos); pos+=9;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        TimeLimit.copy(buf, pos); pos+=TimeLimit.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Version", pos); pos+=7;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Version.copy(buf, pos); pos+=Version.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("VictoryCond", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        VictoryCond.copy(buf, pos); pos+=VictoryCond.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("WarmupCountdown", pos); pos+=15;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        WarmupCountdown.copy(buf, pos); pos+=WarmupCountdown.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("WithHost", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        WithHost.copy(buf, pos); pos+=WithHost.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        return buf;
        }
        catch(e)
        {
            return Buffer.alloc(0);
        }
    }
}

class Steel_UDP_Receive{
    constructor(){}
    FromBuffer(data){
        this.Buffer = data;
        this.Code = data.toString('utf8', 0, data.length);
        return this;
    }
    getBuffer(){
        var buf = Buffer.from(this.Code);
        return buf;
    }
}
class Steel_UDP_Send {
    constructor(){}
    FromBuffer(data){
        var pos = 0;
        this.Buffer = data;
        this.Code = data.toString('utf8', pos, 4); pos+=4; pos+=1;
        while(pos<data.length){
            var propertyEnd = data.indexOf(0x01, pos);
            if(propertyEnd>-1){
                var property = data.toString('utf8', pos, propertyEnd); pos=propertyEnd+1;
                var valueEnd = data.indexOf(0x01, pos);
                var valueLength = valueEnd - pos;
                switch (property) {
                    case "AllowObservers":
                        this.AllowObservers = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "DebriefingTimeMax":
                        this.DebriefingTimeMax = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "DeltaMaxTeamSize":
                        this.DeltaMaxTeamSize = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "DeploiementTimeMax":
                        this.DeploiementTimeMax = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "GameState":
                        this.GameState = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "GameType":
                        this.GameType = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "IncomeRate":
                        this.IncomeRate = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "InitMoney":
                        this.InitMoney = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "LoadingTimeMax":
                        this.LoadingTimeMax = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Map":
                        this.Map = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "MaxTeamSize":
                        this.MaxTeamSize = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ModList":
                        this.ModList = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbIA":
                        this.NbIA = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbMaxPlayer":
                        this.NbMaxPlayer = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbMinPlayer":
                        this.NbMinPlayer = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NbPlayersAndIA":
                        this.NbPlayersAndIA = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "NeedPassword":
                        this.NeedPassword = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ObserverDelay":
                        this.ObserverDelay = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Password":
                        this.Password = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Private":
                        this.Private = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ScoreLimit":
                        this.ScoreLimit = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Seed":
                        this.Seed = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ServerName":
                        this.ServerName = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ServerProtocol":
                        this.ServerProtocol = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "ThematicConstraint":
                        this.ThematicConstraint = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "TickRate":
                        this.TickRate = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "TimeLeft":
                        this.TimeLeft = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "TimeLimit":
                        this.TimeLimit = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "UniqueSessionId":
                        this.UniqueSessionId = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "Version":
                        this.Version = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "VictoryCond":
                        this.VictoryCond = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "WarmupCountdown":
                        this.WarmupCountdown = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    case "WithHost":
                        this.WithHost = data.toString('utf8', pos, valueEnd); pos=(valueEnd);
                        break;
                    default:
                        throw ("UnknownProperty");
                }
            } else {
                break;
            }
            pos+=1;
        }
        return this;
    }
    getBuffer(){
        try{
        var Code = Buffer.from(this.Code);
        var AllowObservers = Buffer.from(this.AllowObservers);
        var DebriefingTimeMax = Buffer.from(this.DebriefingTimeMax);
        var DeltaMaxTeamSize = Buffer.from(this.DeltaMaxTeamSize);
        var DeploiementTimeMax = Buffer.from(this.DeploiementTimeMax);
        var GameState = Buffer.from(this.GameState);
        var GameType = Buffer.from(this.GameType);
        var IncomeRate = Buffer.from(this.IncomeRate);
        var InitMoney = Buffer.from(this.InitMoney);
        var LoadingTimeMax = Buffer.from(this.LoadingTimeMax);
        var _Map = Buffer.from(this.Map);
        var MaxTeamSize = Buffer.from(this.MaxTeamSize);
        var ModList = Buffer.from(this.ModList);
        var NbIA = Buffer.from(this.NbIA);
        var NbMaxPlayer = Buffer.from(this.NbMaxPlayer);
        var NbMinPlayer = Buffer.from(this.NbMinPlayer);
        var NbPlayersAndIA = Buffer.from(this.NbPlayersAndIA);
        var NeedPassword = Buffer.from(this.NeedPassword);
        var ObserverDelay = Buffer.from(this.ObserverDelay);
        var Password = Buffer.from(this.Password);
        var Private = Buffer.from(this.Private);
        var ScoreLimit = Buffer.from(this.ScoreLimit);
        var Seed = Buffer.from(this.Seed);
        var ServerName = Buffer.from(this.ServerName);
        var ServerProtocol = Buffer.from(this.ServerProtocol);
        var TickRate = Buffer.from(this.TickRate);
        var TimeLeft = Buffer.from(this.TimeLeft);
        var TimeLimit = Buffer.from(this.TimeLimit);
        var UniqueSessionId = Buffer.from(this.UniqueSessionId);
        var Version = Buffer.from(this.Version);
        var VictoryCond = Buffer.from(this.VictoryCond);
        var WarmupCountdown = Buffer.from(this.WarmupCountdown);
        var WithHost = Buffer.from(this.WithHost);
        var length = 335+65
            +Code.length
            +AllowObservers.length
            +DebriefingTimeMax.length
            +DeltaMaxTeamSize.length
            +DeploiementTimeMax.length
            +GameState.length
            +GameType.length
            +IncomeRate.length
            +InitMoney.length
            +LoadingTimeMax.length
            +_Map.length
            +MaxTeamSize.length
            +ModList.length
            +NbIA.length
            +NbMaxPlayer.length
            +NbMinPlayer.length
            +NbPlayersAndIA.length
            +ObserverDelay.length
            +NeedPassword.length
            +Password.length
            +Private.length
            +ScoreLimit.length
            +Seed.length
            +ServerName.length
            +ServerProtocol.length
            +TickRate.length
            +TimeLeft.length
            +TimeLimit.length
            +UniqueSessionId.length
            +Version.length
            +VictoryCond.length
            +WarmupCountdown.length
            +WithHost.length;
        var pos = 0;
        var buf = Buffer.alloc(length);
        Code.copy(buf, pos); pos+=Code.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("AllowObservers", pos); pos+=14;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        AllowObservers.copy(buf, pos); pos+=AllowObservers.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("DebriefingTimeMax", pos); pos+=17;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        DebriefingTimeMax.copy(buf, pos); pos+=DebriefingTimeMax.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("DeltaMaxTeamSize", pos); pos+=16;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        DeltaMaxTeamSize.copy(buf, pos); pos+=DeltaMaxTeamSize.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("DeploiementTimeMax", pos); pos+=18;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        DeploiementTimeMax.copy(buf, pos); pos+=DeploiementTimeMax.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("GameState", pos); pos+=9;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        GameState.copy(buf, pos); pos+=GameState.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("GameType", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        GameType.copy(buf, pos); pos+=GameType.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("IncomeRate", pos); pos+=10;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        IncomeRate.copy(buf, pos); pos+=IncomeRate.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("InitMoney", pos); pos+=9;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        InitMoney.copy(buf, pos); pos+=InitMoney.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("LoadingTimeMax", pos); pos+=14;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        LoadingTimeMax.copy(buf, pos); pos+=LoadingTimeMax.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Map", pos); pos+=3;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        _Map.copy(buf, pos); pos+=_Map.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("MaxTeamSize", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        MaxTeamSize.copy(buf, pos); pos+=MaxTeamSize.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ModList", pos); pos+=7;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ModList.copy(buf, pos); pos+=ModList.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbIA", pos); pos+=4;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbIA.copy(buf, pos); pos+=NbIA.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbMaxPlayer", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbMaxPlayer.copy(buf, pos); pos+=NbMaxPlayer.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbMinPlayer", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbMinPlayer.copy(buf, pos); pos+=NbMinPlayer.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NbPlayersAndIA", pos); pos+=14;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NbPlayersAndIA.copy(buf, pos); pos+=NbPlayersAndIA.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("NeedPassword", pos); pos+=12;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        NeedPassword.copy(buf, pos); pos+=NeedPassword.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ObserverDelay", pos); pos+=13;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ObserverDelay.copy(buf, pos); pos+=ObserverDelay.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Password", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Password.copy(buf, pos); pos+=Password.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Private", pos); pos+=7;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Private.copy(buf, pos); pos+=Private.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ScoreLimit", pos); pos+=10;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ScoreLimit.copy(buf, pos); pos+=ScoreLimit.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Seed", pos); pos+=4;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Seed.copy(buf, pos); pos+=Seed.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ServerName", pos); pos+=10;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ServerName.copy(buf, pos); pos+=ServerName.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("ServerProtocol", pos); pos+=14;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        ServerProtocol.copy(buf, pos); pos+=ServerProtocol.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("TickRate", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        TickRate.copy(buf, pos); pos+=TickRate.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("TimeLeft", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        TimeLeft.copy(buf, pos); pos+=TimeLeft.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("TimeLimit", pos); pos+=9;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        TimeLimit.copy(buf, pos); pos+=TimeLimit.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("UniqueSessionId", pos); pos+=15;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        UniqueSessionId.copy(buf, pos); pos+=UniqueSessionId.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("Version", pos); pos+=7;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        Version.copy(buf, pos); pos+=Version.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("VictoryCond", pos); pos+=11;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        VictoryCond.copy(buf, pos); pos+=VictoryCond.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("WarmupCountdown", pos); pos+=15;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        WarmupCountdown.copy(buf, pos); pos+=WarmupCountdown.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        buf.write("WithHost", pos); pos+=8;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        WithHost.copy(buf, pos); pos+=WithHost.length;
        buf.writeUIntBE(0x01, pos, 1); pos+=1;
        return buf;
        }
        catch(e)
        {
            return Buffer.alloc(0);
        }
    }
}

function getWargame3_UDP_SendFromSteel_UDP_Send(steel_UDP_Receive) {
    var wargame3_UDP_Send = new Wargame3_UDP_Send();
    wargame3_UDP_Send.Code = steel_UDP_Receive.Code;
    wargame3_UDP_Send.DateConstraint = "-1";
    wargame3_UDP_Send.DebriefingTimeMax = steel_UDP_Receive.DebriefingTimeMax;
    wargame3_UDP_Send.DeltaMaxTeamSize = steel_UDP_Receive.DeltaMaxTeamSize;
    wargame3_UDP_Send.DeploiementTimeMax = steel_UDP_Receive.DeploiementTimeMax;
    wargame3_UDP_Send.GameState = steel_UDP_Receive.GameState;
    wargame3_UDP_Send.GameType = steel_UDP_Receive.GameType;
    wargame3_UDP_Send.IncomeRate = steel_UDP_Receive.IncomeRate;
    wargame3_UDP_Send.InitMoney = steel_UDP_Receive.InitMoney;
    wargame3_UDP_Send.LoadingTimeMax = steel_UDP_Receive.LoadingTimeMax;
    wargame3_UDP_Send.Map = steel_UDP_Receive.Map;
    wargame3_UDP_Send.MaxTeamSize = steel_UDP_Receive.MaxTeamSize;
    wargame3_UDP_Send.NationConstraint = "-1";
    wargame3_UDP_Send.NbIA = steel_UDP_Receive.NbIA;
    wargame3_UDP_Send.NbMaxPlayer = steel_UDP_Receive.NbMaxPlayer;
    wargame3_UDP_Send.NbMinPlayer = steel_UDP_Receive.NbMinPlayer;
    wargame3_UDP_Send.NbPlayer = steel_UDP_Receive.NbPlayersAndIA;
    wargame3_UDP_Send.NeedPassword = steel_UDP_Receive.NeedPassword;
    wargame3_UDP_Send.Password = steel_UDP_Receive.Password;
    wargame3_UDP_Send.Private = steel_UDP_Receive.Private;
    wargame3_UDP_Send.ScoreLimit = steel_UDP_Receive.ScoreLimit;
    wargame3_UDP_Send.Seed = steel_UDP_Receive.Seed;
    wargame3_UDP_Send.ServerName = steel_UDP_Receive.ServerName;
    wargame3_UDP_Send.ServerProtocol = steel_UDP_Receive.ServerProtocol;
    wargame3_UDP_Send.ThematicConstraint = "-1";
    wargame3_UDP_Send.TimeLeft = steel_UDP_Receive.TimeLeft;
    wargame3_UDP_Send.TimeLimit = steel_UDP_Receive.TimeLimit;
    wargame3_UDP_Send.Version = steel_UDP_Receive.Version;
    wargame3_UDP_Send.VictoryCond = steel_UDP_Receive.VictoryCond;
    wargame3_UDP_Send.WarmupCountdown = steel_UDP_Receive.WarmupCountdown;
    wargame3_UDP_Send.WithHost = steel_UDP_Receive.WithHost;
    return wargame3_UDP_Send;
}

var UdpProxy = function (options) {
    "use strict";
    var proxy = this;
    var localUdpType = 'udp4';
    var localfamily = 'IPv4';
    var serverPort = options.localport || 0;
    var serverHost = options.localaddress || '0.0.0.0';
    var proxyHost = options.proxyaddress || '0.0.0.0';
    this.tOutTime = options.timeOutTime || 10000;
    this.family = 'IPv4';
    this.udpType = 'udp4';
    this.host = options.address || 'localhost';
    this.port = options.port || 41234;
    this.connections = {};
    if (options.ipv6) {
        this.udpType = 'udp6';
        this.family = 'IPv6';
        proxyHost = net.isIPv6(options.proxyaddress) ? options.proxyaddress : '::0';
    }
    this._details = {
        target: {
            address: this.host,
            family: this.family,
            port: this.port
        }
    };
    this._detailKeys = Object.keys(this._details);
    if (options.localipv6) {
        localUdpType = 'udp6';
        serverHost = net.isIPv6(options.localaddress) ? options.localaddress : '::0';
    }
    this._server = dgram.createSocket(localUdpType);
    this._server.on('listening', function () {
        var details = proxy.getDetails({server: this.address()});
        setImmediate(function() {
            proxy.emit('listening', details);
        });
    }).on('message', function (msg, sender) {
        var client = proxy.createClient(msg, sender);
        if (!client._bound) client.bind(0, proxyHost);
        else {
            //console.log(msg);
            var wargame3Protocol = new Wargame3_UDP_Receive().FromBuffer(msg);
            //console.log(wargame3Protocol);
            client.emit('send', wargame3Protocol.getBuffer(), sender);
        }
    }).on('error', function (err) {
        this.close();
        proxy.emit('error', err);
    }).on('close', function () {
        proxy.emit('close');
    }).bind(serverPort, serverHost);
};

util.inherits(UdpProxy, events.EventEmitter);

UdpProxy.prototype.getDetails = function getDetails(initialObj) {
    var self = this;
    return this._detailKeys.reduce(function (obj, key) {
        obj[key] = self._details[key];
        return obj;
    }, initialObj);
};

UdpProxy.prototype.hashD = function hashD(address) {
    return (address.address + address.port).replace(/\./g, '');
};

UdpProxy.prototype.send = function send(msg, port, address, callback) {
    this._server.send(msg, 0, msg.length, port, address, callback);
};

UdpProxy.prototype.createClient = function createClient(msg, sender) {
    var senderD = this.hashD(sender);
    var proxy = this;
     if (this.connections.hasOwnProperty(senderD)) {
        client = this.connections[senderD];
        clearTimeout(client.t);
        client.t = null;
        return client;
    }
    client = dgram.createSocket(this.udpType);
    client.once('listening', function () {
        var details = proxy.getDetails({route: this.address(), peer: sender});
        this.peer = sender;
        this._bound = true;
        proxy.emit('bound', details);
        this.emit('send', msg, sender);
    }).on('message', function (msg, sender) {
        //console.log(msg);
        var wargame3Protocol = new Wargame3_UDP_Send().FromBuffer(msg);
        //console.log(wargame3Protocol);
        proxy.send(wargame3Protocol.getBuffer(), this.peer.port, this.peer.address, function (err, bytes) {
            if (err) proxy.emit('proxyError', err);
        });
        proxy.emit('proxyMsg', msg, sender);
    }).on('close', function () {
        proxy.emit('proxyClose', this.peer);
        this.removeAllListeners();
        delete proxy.connections[senderD];
    }).on('error', function (err) {
        this.close();
        proxy.emit('proxyError', err);
    }).on('send', function (msg, sender) {
        var self = this;
        console.log(msg);
        proxy.emit('message', msg, sender);
        this.send(msg, 0, msg.length, proxy.port, proxy.host, function (err, bytes) {
            if (err) proxy.emit('proxyError', err);
            if (!self.t) self.t = setTimeout(function () {
                self.close();
            }, proxy.tOutTime);
        });
    });
    this.connections[senderD] = client;
    return client;
};

UdpProxy.prototype.end = function(){
    this._server.close();
    for(var key in this.connections){
        this.connections[key].unref();
    }
}

exports.createServer = function (options) {
    return new UdpProxy(options);
};

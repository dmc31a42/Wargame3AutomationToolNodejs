var ServerConfig = require('./server-config.json');
var http = require('http');
class Player{
    constructor(){
        this._connectCorrectly = false;
    }
    
    // 반드시 IP port 부분은 웹에서 제거해줘야함
    set IP(str) {
        this._IP = str;
        this._CountryPromise = this.getCountryCodeName();
    }
    get IP() {return this._IP;}

    set Port(str) {this._Port = str;}
    get Port() {return this._Port;}

    set UserSessionId(str) {this._UserSessionId = parseInt(str);}
    get UserSessionId() {return this._UserSessionId;}

    //set country_code(str) {this._country_code = str;}
    get country_code() {return this._country_code;}

    //set country_name(str) {this._country_name = str;}
    get country_name() {return this._country_name;}

    set deck(str) {this._deck = str;}
    get deck() {return this._deck;}
    set PlayerDeckContent(str) {this._deck = str;}
    get PlayerDeckContent() {return this._deck;}

    set elo(str) {this._elo = parseFloat(str);}
    get elo() {return this._elo;}
    set PlayerElo(str) {this._elo = parseFloat(str);}
    get PlayerElo() {return this._elo;}

    set level(str) {this._level = parseInt(str);}
    get level() {return this._level;}
    set PlayerLevel(str) {this._level = parseInt(str);}
    get PlayerLevel() {return this._level;}

    set name(str) {this._name = str;}
    get name() {return this._name;}

    set playerid(str) {
        this._playerid = parseInt(str);
        if(!this._U24Promise){
            this._U24Promise = this.getU24();
        }
    }
    get playerid() {return this._playerid;}
    set EugNetId(str) {
        this._playerid = parseInt(str);
        if(!this._U24Promise){
            this._U24Promise = this.getU24();
        }
    }
    get EugNetId() {return this._playerid;}
    set PlayerUserId(str) {
        this._playerid = parseInt(str);
        if(!this._U24Promise){
            this._U24Promise = this.getU24();
        }
    }
    get PlayerUserId() {return this._playerid}

    set side(str) {this._side = parseInt(str);}
    get side() {return this._side;}
    set PlayerAlliance(str) {this._side = parseInt(str);}
    get PlayerAlliance() {return this._side;}

    set socket(str) {this._socket = parseInt(str);}
    get socket() {return this._socket;}

    // serverlog에서 추출한 것이 아닌것
    //set u24(object) {this._u24 = object;}
    get u24() {return this._u24;}

    set PlayerAvatar(str) {this._PlayerAvatar = str;}
    get PlayerAvatar() {return this._PlayerAvatar;}

    set PlayerDeckName(str) {this._PlayerDeckName = str;}
    get PlayerDeckName() {return this._PlayerDeckName;}

    set PlayerObserver(str) {this._PlayerObserver = parseInt(str);}
    get PlayerObserver() {return this._PlayerObserver;}

    set PlayerNumber(str) {this._PlayerNumber = parseInt(str);}
    get PlayerNumber() {return this._PlayerNumber;}

    set PlayerReady(str) {this._PlayerReady = parseInt(str);}
    get PlayerReady() {return this._PlayerReady;}

    set PlayerTeamName(str) {this._PlayerTeamName = str;}
    get PlayerTeamName() {return this._PlayerTeamName;}

    static get Enum() {
        return  {
            Side: {
                Bluefor:0,
                Redfor:1
            }
        }
    }    

    getCountryCodeName() {
        var player = this;
        return new Promise((resolve, reject)=>{
            if(player._IP.match("192.168.") && player._IP.match("192.168.").index != -1) {
                player._country_code = "__";
                player._country_name = "Special";
                resolve();
            } else if(ServerConfig.ipstack_API_KEY && ServerConfig.ipstack_API_KEY != '') {
                var option = {
                    hostname: 'api.ipstack.com',
                    port: 80,
                    path: '/'+ this._IP + '?access_key=' + ServerConfig.ipstack_API_KEY,
                    method: 'GET'
                };
                var req = http.request(option, function(res) {
                    //console.log(res);
                    var responseData = '';
                    res.on('data', function(chunk){
                        responseData = responseData + chunk;
                    });
                    res.on('end', function(){
                        var JSONData = JSON.parse(responseData.toString())
                        if(player && JSONData.country_code && JSONData.country_code != '') {
                            player._country_code = JSONData.country_code;
                            player._country_name = JSONData.country_name;
                            resolve();
                        } else {
                            // players[playerid].country_code = 'XX';
                            // players[playerid].country_name = JSONData.country_name;
                        }
                    })
                })
                req.on('error', (e) => {
                  console.error(e);
                  reject(e);
                });
                req.end();
            }
        })
    }

    getU24() {
        var player = this;
        return new Promise((resolve, reject)=>{
            var req_u24 = http.request({
                hostname: '178.32.126.73',
                port: 8080,
                path: '/stats/u24_' + player._playerid,
                method: 'GET'
            }, function(res){
                var responseData = '';
                res.on('data', function(chunk){
                    responseData = responseData + chunk;
                });
                res.on('end', function(){
                    var JSONData = JSON.parse(responseData.toString());
                    if(this && JSONData._id){
                        player._u24 = JSONData;
                        resolve();
                    }
                })
            })
            req_u24.on('error', (e) => {
                console.error(e);
                reject(e);
            });
            req_u24.end();
        })
    }
    
    getAsync(){
        var promises = [];
        if(this._CountryPromise){
            promises.push(this._CountryPromise)
        }
        if(this._U24Promise){
            promises.push(this._U24Promise)
        }
        // var promises = [this._CountryPromise, this._U24Promise];
        return Promise.all(promises)
        .then((values)=>{
            return Promise.resolve(this);
        });
    }

    toJSON(){
        return {
            IP: this._IP,
            Port: this._Port,
            UserSessionId: this._UserSessionId,
            country_code: this._country_code,
            country_name: this._country_name,
            deck: this._deck,
            elo: this._elo,
            level: this._level,
            name: this._name,
            playerid: this._playerid,
            side: this._side,
            socket: this._socket,
            u24: this._u24,
            PlayerAvatar: this._PlayerAvatar,
            PlayerDeckName: this._PlayerDeckName,
        };
    }
}

module.exports = Player
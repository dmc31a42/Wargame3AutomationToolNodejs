var ServerConfig = require('./server-config.json');
var http = require('http');
/**
 * Dedicated 서버에 접속한 플레이어에 대한 정보를 담고있는 클래스
 * @class
 */
class EugPlayer{
    /**@constructor */
    constructor(){
        /**
         * 이 객체(플레이어)가 {@link EugTcpProxy}에서만 처리되었는지(false)) {@link EugLogTail}에서도 처리되었는지(true) 기록 
         * @type {boolean}
         */
        this._connectCorrectly = false;
    }
    
    /**
     * IPv6로 표현되어있는 플레이어의 IP 주소. {@link EugTcpProxy}에서 넣어줌
     * IP를 설정하면 {@link EugPlayer#getCountryCodeName}를 통해 플레이어가 접속한 국가를 검색함
     * @type {String}
     */
    set IP(str) {
        this._IP = str;
        this._CountryPromise = this.getCountryCodeName();
    }
    get IP() {return this._IP;}

    /**
     * 플레이어가 접속한 Port 번호. {@link EugTcpProxy}에서 넣어줌
     * @type {number}
     */
    set Port(str) {this._Port = str;}
    get Port() {return this._Port;}

    /**@type {number} */
    set UserSessionId(str) {this._UserSessionId = parseInt(str);}
    get UserSessionId() {return this._UserSessionId;}

    /**
     * {@link EugPlayer#IP}가 설정되면 {@link EugPlayer#getU24}에서 API를 통해 국가의 ISO 3166-1 alpha-2 코드를 저장한다.
     * @type {String} 
     */
    //set country_code(str) {this._country_code = str;}
    get country_code() {return this._country_code;}

    /**
     * {@link EugPlayer#IP}가 설정되면 {@link EugPlayer#getU24}에서 API를 통해 국가의 이름을 저장한다.
     * @type {String} 
     */
    //set country_name(str) {this._country_name = str;}
    get country_name() {return this._country_name;}

    /** 
     * @type {String}
     * @see EugPlayer#PlayerDeckContent
     */
    set deck(str) {this._deck = str;}
    get deck() {return this._deck;}
    
    /**@type {String}*/
    set PlayerDeckContent(str) {this._deck = str;}
    get PlayerDeckContent() {return this._deck;}

    /**
     * @type {float}
     * @see EugPlayer#PlayerElo
     */
    set elo(str) {this._elo = parseFloat(str);}
    get elo() {return this._elo;}
    /**@type {float} */
    set PlayerElo(str) {this._elo = parseFloat(str);}
    get PlayerElo() {return this._elo;}

    /**
     * @type {number}
     * @see EugPlayer#PlayerLevel
     */
    set level(str) {this._level = parseInt(str);}
    get level() {return this._level;}
    /**@type {number} */
    set PlayerLevel(str) {this._level = parseInt(str);}
    get PlayerLevel() {return this._level;}

    /**@type {String} */
    set name(str) {this._name = str;}
    get name() {return this._name;}

    /**
     * @type {number}
     * @see EugPlayer#PlayerUserId
     */
    set playerid(str) {
        this._playerid = parseInt(str);
        if(!this._U24Promise){
            this._U24Promise = this.getU24();
        }
    }
    get playerid() {return this._playerid;}
    /**
     * @type {number}
     * @see EugPlayer#PlayerUserId
     */
    set EugNetId(str) {
        this._playerid = parseInt(str);
        if(!this._U24Promise){
            this._U24Promise = this.getU24();
        }
    }
    get EugNetId() {return this._playerid;}
    /**
     * PlayerId를 설정하면 {@link EugPlayer#getU24}에서 EugNet API를 통해 플레이어의 전적 정보를 가져온다.
     * @type {number}
     */
    set PlayerUserId(str) {
        this._playerid = parseInt(str);
        if(!this._U24Promise){
            this._U24Promise = this.getU24();
        }
    }
    get PlayerUserId() {return this._playerid}

    /**
     * @type {number}
     * @see EugPlayer#PlayerAlliance
     */
    set side(str) {this._side = parseInt(str);}
    get side() {return this._side;}
    /**@type {number} */
    set PlayerAlliance(str) {this._side = parseInt(str);}
    get PlayerAlliance() {return this._side;}

    /**@type {number} */
    set socket(str) {this._socket = parseInt(str);}
    get socket() {return this._socket;}

    // serverlog에서 추출한 것이 아닌것
    //set u24(object) {this._u24 = object;}
    /**@type {Object} */
    get u24() {return this._u24;}

    /**@type {String} */
    set PlayerAvatar(str) {this._PlayerAvatar = str;}
    get PlayerAvatar() {return this._PlayerAvatar;}

    /**@type {String} */
    set PlayerDeckName(str) {this._PlayerDeckName = str;}
    get PlayerDeckName() {return this._PlayerDeckName;}

    /**@type {number} */
    set PlayerObserver(str) {this._PlayerObserver = parseInt(str);}
    get PlayerObserver() {return this._PlayerObserver;}

    /**
     * Dedicated server에서 플레이어를 1번 플레이어부터 순서로 부를 때 사용
     * @type {number} 
     */
    set PlayerNumber(str) {this._PlayerNumber = parseInt(str);}
    get PlayerNumber() {return this._PlayerNumber;}

    /**@type {number} */
    set PlayerReady(str) {this._PlayerReady = parseInt(str);}
    get PlayerReady() {return this._PlayerReady;}

    /**@type {String} */
    set PlayerTeamName(str) {this._PlayerTeamName = str;}
    get PlayerTeamName() {return this._PlayerTeamName;}

    // /**
    //  * @namespace EugPlayer.EnumTypes
    //  * @property {EugPlayer.EnumTypes.PlayerAllianceTypes} PlayerAlliance
    //  */
    // /**@type {EugPlayer.EnumTypes} */
    static get Enum() {
        return  {
            // /**
            //  * @namespace EugPlayer.EnumTypes.PlayerAllianceTypes
            //  * @property {EugPlayer.PlayerAllianceType} Bluefor - 0
            //  * @property {EugPlayer.PlayerAllianceType} Redfor - 1
            //  */
            // PlayerAlliance: {
            //     Bluefor:0,
            //     Redfor:1,
            //     toString: function(PlayerAlliance){
            //         switch(PlayerAlliance){
            //             case 0:
            //                 return "Bluefor";
            //             case 1:
            //                 return "Redfor";
            //             default:
            //                 return "UNKNOWN";
            //         }
            //     }
            // }
        }
    }    

    /**
     * {@link EugPlayer#IP}로 플레이어가 접속한 국가를 찾는 함수
     * @function
     * @return {Promise}
     */
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
    /**
     * 플레이어의 레벨, 플레이 시간, 승패 전적 등을 EugNet에서 가져오는 함수
     * @function
     * @returns {Promise}
     */
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
    /**
     * getCountryCodeName과 getU24를 둘다 수행하고 수행이 다 되어있을 때를 Promise를 반환
     * @function
     * @returns {Promise}
     */
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
            // IP: this._IP,
            // Port: this._Port,
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

module.exports = EugPlayer
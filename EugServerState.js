/**
 * 서버의 상태와 {@link EugPlayer}를 멤버로 가지고 있는 클래스
 * @class
 */
class EugServerState{
    /**
     * @constructor
     */
    constructor(){
        this.players = {};
    }
    set DateConstraint(str) {this._DateConstraint = parseInt(str);}
    get DateConstraint() {return this._DateConstraint;}

    set DebriefingTimeMax(str) {this._DebriefingTimeMax = parseInt(str);}
    get DebriefingTimeMax() {return this._DebriefingTimeMax;}

    set DeltaMaxTeamSize(str) {this._DeltaMaxTeamSize = parseInt(str);}
    get DeltaMaxTeamSize() {return this._DeltaMaxTeamSize;}

    set DeploiementTimeMax(str) {this._DeploiementTimeMax = parseInt(str);}
    get DeploiementTimeMax() {return this._DeploiementTimeMax;}

    set GameState(str) {this._GameState = parseInt(str);}
    get GameState() {return this._GameState;}

    set GameType(str) {this._GameType = parseInt(str);}
    get GameType() {return this._GameType;}

    set IncomeRate(str) {this._IncomeRate = parseInt(str);}
    get IncomeRate() {return this._IncomeRate;}

    set InitMoney(str) {this._InitMoney = parseInt(str);}
    get InitMoney() {return this._InitMoney;}

    set LoadingTimeMax(str) {this._LoadingTimeMax = parseInt(str);}
    get LoadingTimeMax() {return this._LoadingTimeMax;}

    set Map(str) {this._Map = str;}
    get Map() {return this._Map;}

    set MaxTeamSize(str) {this._MaxTeamSize = parseInt(str);}
    get MaxTeamSize() {return this._MaxTeamSize;}

    set NationConstraint(str) {this._NationConstraint = parseInt(str);}
    get NationConstraint() {return this._NationConstraint}

    set NbIA(str) {this._NbIA = parseInt(str);}
    get NbIA() {return this._NbIA;}

    set NbMaxPlayer(str) {this._NbMaxPlayer = parseInt(str);}
    get NbMaxPlayer() {return this._NbMaxPlayer;}

    set NbMinPlayer(str) {this._NbMinPlayer = parseInt(str);}
    get NbMinPlayer() {return this._NbMinPlayer;}

    set NbPlayer(str) {this._NbPlayer = parseInt(str);}
    get NbPlayer() {return this._NbPlayer}

    set NeedPassword(str) {this._NeedPassword = parseInt(str);}
    get NeedPassword() {return this._NeedPassword;}

    set Password(str) {this._Password = str;}
    get Password() {return this._Password;}

    set Private(str) {this._Private = parseInt(str);}
    get Private() {return this._Private}

    set ScoreLimit(str) {this._ScoreLimit = parseInt(str);}
    get ScoreLimit() {return this._ScoreLimit;}

    set Seed(str) {this._Seed = parseInt(str);}
    get Seed() {return this._Seed;}

    set ServerName(str) {this._ServerName = str}
    get ServerName() {return this._ServerName;}

    set ServerProtocol(str) {this._ServerProtocol = str;}
    get ServerProtocol() {return this._ServerProtocol;}

    set ThematicConstraint(str) {this._ThematicConstraint = parseInt(str);}
    get ThematicConstraint() {return this._ThematicConstraint;}

    set TimeLeft(str) {this._TimeLeft = parseInt(str);}
    get TimeLeft() {return this._TimeLeft;}

    set TimeLimit(str) {this._TimeLimit = parseInt(str);}
    get TimeLimit() {return this._TimeLimit;}

    set Version(str) {this._Version = parseInt(str);}
    get Version() {return this._Version;}

    set VictoryCond(str) {this._VictoryCond = parseInt(str);}
    get VictoryCond() {return this._VictoryCond;}

    set WarmupCountdown(str) {this._WarmupCountdown = parseInt(str);}
    get WarmupCountdown() {return this._WarmupCountdown;}

    set WithHost(str) {this._WithHost = parseInt(str);}
    get WithHost() {return this._WithHost;}

    set AutoLaunchCond(str) {this._AutoLaunchCond = parseInt(str);}
    get AutoLaunchCond() {return this._AutoLaunchCond;}

    static get Enum() {
        return {
            GameState: {
                Lobby: 0,
                Loading: 51,
                Deployment: 52,
                Game: 53,
                Debriefing: 101,
                Launch: 4,
                toString: function(GameState){
                    switch(GameState){
                        case 0:
                            return "Lobby";
                        case 51:
                            return "Loading";
                        case 52:
                            return "Deployment";
                        case 53:
                            return "Game";
                        case 101:
                            return "Debriefing";
                        case 4:
                            return "Launch";
                        default:
                            return "UNKNOWN";
                    }
                }
            }
        }
    } 
    /**
     * 서버의 상태 정보를 JSON으로 정리하여 가져올 수 있는 함수
     * @method EugServerState.toJSON
     * @return {EugServerStateStruct}
     */
    toJSON() {
        /**
         * @typedef {Object} EugServerStateStruct
         */
        return {
            /**
             * @property {number} EugServerStateStruct.DateConstraint
             */
            DateConstraint: this.DateConstraint,
            /**
             * @property {number}
             */
            DebriefingTimeMax: this.DebriefingTimeMax,
            DeltaMaxTeamSize: this.DeltaMaxTeamSize,
            DeploiementTimeMax: this.DeploiementTimeMax,
            GameState: this.GameState,
            GameType: this.GameType,
            IncomeRate: this.IncomeRate,
            InitMoney: this.InitMoney,
            LoadingTimeMax: this.LoadingTimeMax,
            Map: this.Map,
            MaxTeamSize: this.MaxTeamSize,
            NationConstraint: this.NationConstraint,
            NbIA: this.NbIA,
            NbMaxPlayer: this.NbMaxPlayer,
            NbMinPlayer: this.NbMinPlayer,
            NbPlayer: this.NbPlayer,
            NeedPassword: this.NeedPassword,
            Password: this.Password,
            Private: this.Private,
            ScoreLimit: this.ScoreLimit,
            Seed: this.Seed,
            ServerName: this.ServerName,
            ServerProtocol: this.ServerProtocol,
            ThematicConstraint: this.ThematicConstraint,
            TimeLeft: this.TimeLeft,
            TimeLimit: this.TimeLimit,
            Version: this.Version,
            VictoryCond: this.VictoryCond,
            WarmupCountdown: this.WarmupCountdown,
            WithHost: this.WithHost,
            players: this.players,
            AutoLaunchCond: this.AutoLaunchCond
        }
    }
}

module.exports = EugServerState
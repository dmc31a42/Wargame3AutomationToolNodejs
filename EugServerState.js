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
    /**
     * @typedef {number} EugServerState.DateConstraintType
     */
    /**
     * @member {EugServerState.DateConstraintType}
     */
    set DateConstraint(str) {this._DateConstraint = parseInt(str);}
    get DateConstraint() {return this._DateConstraint;}

    set DebriefingTimeMax(str) {this._DebriefingTimeMax = parseInt(str);}
    get DebriefingTimeMax() {return this._DebriefingTimeMax;}

    set DeltaMaxTeamSize(str) {this._DeltaMaxTeamSize = parseInt(str);}
    get DeltaMaxTeamSize() {return this._DeltaMaxTeamSize;}

    set DeploiementTimeMax(str) {this._DeploiementTimeMax = parseInt(str);}
    get DeploiementTimeMax() {return this._DeploiementTimeMax;}

    /**
     * @typedef {number} EugServerState.GameStateType
     */
    /**
     * @member {EugServerState.GameStateType}
     */
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
    /**@typedef {number} EugServerState.NationConstraintType */
    /**@member {EugServerState.NationConstraintType}*/
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
    /**@typedef EugServerState.ThematicConstraintType */
    /**@member {EugServerState.ThematicConstraintType} */
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

    /**
     * @namespace EugServerState.EnumTypes
     * @property {EugServerState.EnumTypes.DateConstraintTypes} DateConstraint
     * @property {EugServerState.EnumTypes.GameStateTypes} GameState
     * @property {EugServerState.EnumTypes.GameTypeTypes} GameType
     * @property {EugServerState.EnumTypes.NationConstraintTypes} NationConstraint
     * @property {EugServerState.EnumTypes.ThematicConstraintTypes} ThematicConstraint
     */
    /**
     * @member {EugServerState.EnumTypes}
     */
    static get Enum() {
        return {
            /**
             * @namespace EugServerState.EnumTypes.DateConstraintTypes
             * @property {EugServerState.DateConstraintType} No - -1
             * @property {EugServerState.DateConstraintType} Post85 - 0
             * @property {EugServerState.DateConstraintType} Post80 - 1
             */
            DateConstraint: {
                No: -1,
                Post85: 0,
                Post80: 1,
                /**
                 * @function toString
                 * @memberof EugServerState.EnumTypes.DateConstraintTypes
                 * @param {EugServerState.DateConstraintType} DateConstraint
                 */
                toString: function(DateConstraint){
                    switch(DateConstraint){
                        case -1:
                            return "No";
                        case 0:
                            return "Post85";
                        case 1:
                            return "Post80";
                    }
                }
            },
            /**
             * @namespace EugServerState.EnumTypes.GameStateTypes
             * @property {EugServerState.GameStateType} Lobby - 1
             * @property {EugServerState.GameStateType} Loading - 51
             * @property {EugServerState.GameStateType} Deployment - 52
             * @property {EugServerState.GameStateType} Game - 53
             * @property {EugServerState.GameStateType} Debriefing - 101
             * @property {EugServerState.GameStateType} Launch - 4
             */
            GameState: {
                Lobby: 0,
                Loading: 51,
                Deployment: 52,
                Game: 53,
                Debriefing: 101,
                Launch: 4,
                /**
                 * @memberof! EugServerState.EnumTypes.GameStateTypes
                 * @function toString
                 * @param {EugServerState.GameStateType} GameState
                 * @returns {String}
                 */
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
            },
            /**
             * @namespace EugServerState.EnumTypes.GameTypeTypes
             * @property {EugServerState.GameTypeType} Confrontation - 0
             * @property {EugServerState.GameTypeType} BlueFor - 1
             * @property {EugServerState.GameTypeType} RedFor - 2
             */
            GameType: {
                Confrontation: 0,
                BlueFor: 1,
                RedFor: 2,
                /**
                 * @memberof! EugServerState.EnumTypes.GameTypeTypes
                 * @function toString
                 * @param {EugServerState.GameTypeType} GameType
                 * @returns {String}
                 */
                toString: function(GameType){
                    switch(GameType){
                        case 0:
                            return "Confrontation";
                        case 1:
                            return "BlueFor";
                        case 2:
                            return "RedFor";
                        default:
                            return "UNKNOWN";
                    }
                }
            },
            /**
             * @namespace EugServerState.EnumTypes.NationConstraintTypes
             * @property {EugServerState.NationConstraintType} No - -1
             * @property {EugServerState.NationConstraintType} NationsAndCoalitions - 0
             * @property {EugServerState.NationConstraintType} NationsOnly - 1
             * @property {EugServerState.NationConstraintType} CoalitionsOnly -2
             */
            NationConstraint: {
                No: -1,
                NationsAndCoalitions: 0,
                NationsOnly: 1,
                CoalitionsOnly: 2,
                /**
                 * @memberof! EugServerState.EnumTypes.NationConstraintTypes
                 * @function toString
                 * @param {EugServerState.NationConstraintType} NationConstraint
                 * @returns {String}
                 */
                toString: function(NationConstraint){
                    switch(NationConstraint){
                        case -1:
                            return "No";
                        case 0:
                            return "NationsAndCoalitions";
                        case 1:
                            return "NationsOnly";
                        case 2:
                            return "CoalitionsOnly";
                        default:
                            return "UNKNOWN";
                    }
                }
            },
            /**
             * @namespace EugServerState.EnumTypes.ThematicConstraintTypes
             * @property {EugServerState.ThematicConstraintType} No - -1
             * @property {EugServerState.ThematicConstraintType} Any - -2
             * @property {EugServerState.ThematicConstraintType} Motorised - 0
             * @property {EugServerState.ThematicConstraintType} Armored - 1
             * @property {EugServerState.ThematicConstraintType} Support - 2
             * @property {EugServerState.ThematicConstraintType} Marine - 3
             * @property {EugServerState.ThematicConstraintType} Mecanized - 4
             * @property {EugServerState.ThematicConstraintType} Airborne - 5
             * @property {EugServerState.ThematicConstraintType} Naval -6
             */
            ThematicConstraint: {
                No: -1,
                Any: -2,
                Motorised: 0,
                Armored: 1,
                Support: 2,
                Marine: 3,
                Mecanized: 4,
                Airborne: 5,
                Naval: 6,
                /**
                * @memberof! EugServerState.EnumTypes.ThematicConstraintTypes
                * @function toString
                * @param {EugServerState.ThematicConstraintType} ThematicConstraint
                * @returns {String}
                */
                toString:function(ThematicConstraint){
                    switch(ThematicConstraint) {
                        case -1:
                            return "No";
                        case -2:
                            return "Any";
                        case 0:
                            return "Motorised";
                        case 1:
                            return "Armored";
                        case 2:
                            return "Support";
                        case 3:
                            return "Marine";
                        case 4:
                            return "Mecanized";
                        case 5:
                            return "Airborne";
                        case 6:
                            return "Navel";
                        default:
                            return "UNKNOWN";
                    }
                }
            }
            
        }
    } 
    toJSON() {
        return {
            DateConstraint: this.DateConstraint,
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
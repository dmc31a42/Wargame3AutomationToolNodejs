const EugProtocolModular = require('./EugProtocolModular')
const EugPacketStruct = require('./EugPacketStruct')
const Express = require('express')()
const Router = require('express').Router;
const EugProtocolModulars = require('./EugProtocolModulars')
const EugServerState = require('./EugServerState')
const EventEmitter = require('events')
class EugEmitter extends EventEmitter{}
const EugRCON = require('./EugRCON')

/**
 * @class
 */
class BtwProxyAndServiceModule {
    /**
     * @constructor
     * @param {EugServerState} serverState 
     * @param {EugEmitter} eugEmitter 
     * @param {EugRCON} eugRCON 
     * @param {BtwProxyAndServiceModule[]} importedModules 
     * @param {String} absolutePath 
     */
    constructor(serverState, eugEmitter, eugRCON, importedModules, absolutePath){
        this.serverState = serverState;
        this.eugEmitter = eugEmitter;
        this.eugRCON = eugRCON;
        this.importedModules = importedModules;
        this.absolutePath = absolutePath;
        /**
         * @type {{name:String, path:String}} 
        */
        this.moduleInfo;
    }
    /**@member {boolean} */
    set enabled(value){this._enabled = value}
    get enabled() {return this._enabled}
    
    /** 
     * @function
     * @param {SocketIO.Server} io
     * @returns {Express | Router}
     */
    publicRouter(io){
    }

    /** 
     * @function
     * @param {SocketIO.Server} io
     * @returns {Express | Router}
     */
    adminRouter(io){
    }

    /**
     * @function
     */
    close(){

    }
    /**
     * @function
     * @returns {EugProtocolModulars}
     */
    get ProtocolModulars() {
        return {
            proxyToService: new Object(),
            serviceToProxy: new Object(),
        }
    }
}

module.exports = BtwProxyAndServiceModule
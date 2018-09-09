const EugProtocolModular = require('./EugProtocolModular')
const EugPacketStruct = require('./EugPacketStruct')
const Express = require('express')()
const Router = require('express').Router;
const EugProtocolModulars = require('./EugProtocolModulars')

/**@interface */
class BtwProxyAndServiceModule {
    constructor(){
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
  const EugProtocol = require('./EugProtocol')
  const EugServerState = require('./EugServerState')
  const EugProtocolModifierFunction = require('./EugProtocolModifierFunction')
  const SocketContext = require('./SocketContext')
  
  /**
   * @typedef {function(EugProtocol, {pre:EugProtocol[], post:EugProtocol[]}, EugServerState, SocketContext): {protocol:EugProtocol, extraProtocols:{pre:EugProtocol[], post:EugProtocol[]}}} EugProtocolModifierFunction 
   * @param {EugProtocol} protocol
   * @param {{pre:EugProtocol[], post:EugProtocol[]}} extraProtocols
   * @param {EugServerState} serverState
   * @param {SocketContext} context
   */

   /**@type {EugProtocolModifierFunction} */
   module.exports = function(){}
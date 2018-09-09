const EugPlayer = require('./EugPlayer')
var net = require("net");

/**
 * @typedef SocketContext
 * @property {Buffer[]} buffers
 * @property {Boolean} connected
 * @property {Socket} proxySockets
 * @property {EugPlayer} user
 */

 /**@type {SocketContext} */
 module.exports = new Object();
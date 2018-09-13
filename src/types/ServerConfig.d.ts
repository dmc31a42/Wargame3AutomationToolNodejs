interface ServerConfig {
  rconPath: string,
  rconRemoteHost: string,
  rconRemotePort: string,
  rconPassword: string,
  AdminCode: string,
  ServicePort: number,
  IPInfoDB_API_KEY?: string,
  ipstack_API_KEY?: string,
  ip_mms: string,
  port_mms: number,
  game_external_port: number,
  game_local_port: number,
  external_ip: string,
  SESSION: {
    secret: string
  }
  serverAdminEugNetId: number
}
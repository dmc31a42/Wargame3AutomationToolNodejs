
import a from "../config/server-config.json"
const serverConfig:ServerConfig = <ServerConfig> a
import * as http from 'http'
import {U24} from './U24'

export * from "./U24"
export {EugPlayer}
/**
 * Dedicated 서버에 접속한 플레이어에 대한 정보를 담고있는 클래스
 */
export default class EugPlayer{

  connectCorrectly: boolean = false;
  CountryPromise: Promise<undefined> = new Promise((resolve, reject)=>{
    resolve();
  });
  private _U24Promise: Promise<undefined> = new Promise((resolve, reject)=>{
    resolve();
  })

  private _IP: string = "::ffff:127.0.0.1";
  private _Port:number = 0;
  private _UserSessionId:number = 0;
  private _PlayerDeckContent:string = "";
  private _PlayerElo:number = 0.0;
  private _PlayerLevel:number = 0;
  private _PlayerName:string = "";
  private _PlayerUserId:number = 0;
  private _PlayerAlliance:number = 0;

  private _countryCode: string = "XX";
  private _countryName: string = "UNKNWON";
  private _SocketNumber: number = 0;
  private _PlayerAvatar: string = "";
  private _PlayerDeckName: string = "";
  private _PlayerObserver: number = 0;
  private _PlayerNumber: number = 0;
  private _PlayerReady: number = 0;
  private _PlayerTeamName: string = "";
  private _u24?: U24;
  constructor(){
  }

  /*PlayerProperty */
  set IP(value:string) {
    this._IP = value;
  }
  get IP(){
    return this._IP;
  }

  set Port(value:number | string){
    this._Port = parseInt(<string>value);
  }
  get Port():number | string {
    return this._Port;
  }

  set UserSessionId(value:number | string){
    this._UserSessionId = parseInt(<string>value);
  }
  get UserSessionId():number | string {
    return this._UserSessionId;
  }

  set PlayerDeckContent(value:string){
    this._PlayerDeckContent = value;
  }
  get PlayerDeckContent():string {
    return this._PlayerDeckContent;
  }
  /**
   * @see EugPlayer.PlayerDeckContent
   * @deprecated
   */
  set deck(value:string){
    this._PlayerDeckContent = value;
  }
  get deck():string {
    return this._PlayerDeckContent;
  }

  set PlayerElo(value:number | string){
    this._PlayerElo = parseInt(<string>value);
  }
  get PlayerElo():number | string {
    return this._PlayerElo;
  }
  /**
   * @see EugPlayer.PlayerElo
   * @deprecated
   */
  set elo(value:number | string){
    this._PlayerElo = parseInt(<string>value);
  }
  get elo():number | string {
    return this._PlayerElo;
  }

  set PlayerLevel(value:number | string){
    this._PlayerLevel = parseInt(<string>value);
  }
  get PlayerLevel():number | string{
    return this._PlayerLevel;
  }
  /**
   * @see EugPlayer.PlayerLevel
   * @deprecated
   */
  set level(value:number | string) {
    this._PlayerLevel = parseInt(<string>value);
  }
  get level():number | string {
    return this._PlayerLevel;
  }

  set PlayerName(value:string) {
    this._PlayerName = value;
  }
  get PlayerName():string {
    return this._PlayerName;
  }
  /**
   * @see EugPlayer.PlayerName
   * @deprecated
   */
  set name(value:string) {
    this._PlayerName = value;
  }
  get name():string {
    return this._PlayerName;
  }

  set PlayerUserId(value:number | string) {
    this._PlayerUserId = parseInt(<string>value);
    this._U24Promise = this.getU24();
  }
  get PlayerUserId(): number | string {
    return this._PlayerUserId;
  }
  /**
   * @see EugPlayer.PlayerUserId
   * @deprecated
   */
  set EugNetId(value:number | string) {
    this.PlayerUserId = value;
  }
  get EugNetId():number | string {
    return this.PlayerUserId;
  }
  /**
   * @see EugPlayer.PlayerUserId
   * @deprecated
   */
  set playerid(value:number | string) {
    this.PlayerUserId = value;
  }
  get playerid():number | string {
    return this.PlayerUserId;
  }

  set PlayerAlliance(value:number | string) {
    this._PlayerAlliance = parseInt(<string>value);
  }
  get PlayerAlliance():number | string {
    return this._PlayerAlliance;
  }
  /**
   * @see EugPlayer.PlayerAlliance
   * @deprecated
   */
  set side(value:number | string) {
    this.PlayerAlliance = value;
  }
  get side():number | string {
    return this.PlayerAlliance;
  }

  

  /*else*/
  set CountryCode(value:string){
    this._countryCode = value;
  }
  get CountryCode(){
    return this._countryCode;
  }

  set CountryName(value:string){
    this._countryName = value;
  }
  get CountryName(){
    return this._countryName;
  }

  set SocketNumber(value:number | string) {
    this._SocketNumber = parseInt(<string>value);
  }
  get SocketNumber(): number | string {
    return this._SocketNumber;
  }
  /**
   * @see EugPlayer.SocketNumber
   * @deprecated
   */
  set socket(value:number | string){
    this.SocketNumber = value;
  }
  get socket():number | string {
    return this.SocketNumber;
  }

  // get u24() {return this._u24;}

  set PlayerAvatar(value:string) {
    this._PlayerAvatar = value;
  }
  get PlayerAvatar():string {
    return this._PlayerAvatar;
  }

  set PlayerDeckName(value:string) {
    this._PlayerDeckName = value;
  }
  get PlayerDeckName(): string {
    return this._PlayerDeckName;
  }

  set PlayerObserver(value:number | string) {
    this._PlayerObserver = parseInt(<string>value);
  }
  get PlayerObserver(): number | string {
    return this._PlayerObserver;
  }

  set PlayerNumber(value:number | string) {
    this._PlayerNumber = parseInt(<string>value);
  }
  get PlayerNumber(): number | string {
    return this._PlayerNumber;
  }

  set PlayerReady(value:number | string) {
    this._PlayerReady = parseInt(<string>value);
  }
  get PlayerReady(): number | string {
    return this._PlayerReady;
  }

  set PlayerTeamName(value: string) {
    this._PlayerTeamName = value;
  }
  get PlayerTeamName(): string {
    return this._PlayerTeamName;
  }

  get u24(): U24 | undefined{
    return this._u24;
  }

  getCountryCodeName():Promise<undefined>{
    const player:EugPlayer = this
    return new Promise((resolve, reject)=>{
      if(player._IP.match(/192\.168\./) != null){
        player._countryCode = "__";
        player._countryName = "Special";
        resolve();
      } else if(serverConfig.ipstack_API_KEY!=null && serverConfig.ipstack_API_KEY! != ""){
        const httpRequestOptions: http.RequestOptions = {
          hostname: 'api.ipstack.com',
          port: 80,
          path: '/' + player._IP + '?access_key=' + serverConfig.ipstack_API_KEY,
          method: 'GET'
        }
        const req = http.request(httpRequestOptions, (res)=>{
          let responseData:string = '';
          res.on('data', (chunk)=>{
            responseData = responseData + chunk;
          });
          res.on('end', ()=>{
            const JSONData:any = JSON.parse(responseData.toString());
            if(player && JSONData.country_code !== undefined && JSONData.country_code != '') {
              player._countryCode = <string>JSONData.country_code;
              player._countryName = <string>JSONData.country_name;
              resolve();
            } else {
              reject("JSON not correct");
            }
          });
        });
        req.on('error', (e)=>{
          console.error(e);
          reject(e);
        });
        req.end();
      }
    })
  }

  getU24():Promise<undefined> {
    const player:EugPlayer = this;
    return new Promise((resolve, reject)=>{
      const req_u24 = http.request({
        hostname: '178.32.126.73',
          port: 8080,
          path: '/stats/u24_' + player._PlayerUserId,
          method: 'GET'
      }, (res)=>{
        let responseData:string = "";
        res.on("data", (chunk)=>{
          responseData = responseData + chunk;
        });
        res.on("end", ()=>{
          const JSONData:any = JSON.parse(responseData.toString());
          if(player === undefined){
            reject("[EugPlayer.getU24] Player is deleted");
          } else if(JSONData._id === undefined){
            reject("[EugPlayer.getU24] Received uncorrect data");
          } else {
            player._u24 = new U24(JSONData);
            resolve();
          }
        })
      })
      req_u24.on("error", (e) =>{
        console.error(e);
        reject(e);
      });
      req_u24.end();
    })
  }
}
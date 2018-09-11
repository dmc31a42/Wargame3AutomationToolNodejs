
/**
 * Dedicated 서버에 접속한 플레이어에 대한 정보를 담고있는 클래스
 */
class EugPlayer{

  connectCorrectly:boolean
  _IP: string | null


  constructor(){
    this.connectCorrectly = false;
    this._IP = null;
  }

  set IP(value:string) {
    this._IP = value;
  }
  get IP(){
    return this._IP!;
  }


}
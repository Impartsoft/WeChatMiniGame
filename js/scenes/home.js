import Player from '../player/index'
import Enemy from '../npc/enemy'
import Scene from './scene'
import databus    from '../databus.js';

export default class Home extends Scene{
   constructor  (){
    super();
   }

   launch(gameServer) {
    this.gameServer = gameServer;
    databus.matchPattern = void 0;
  }
}
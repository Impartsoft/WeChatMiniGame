import Player from './player/index'
import Enemy from './npc/enemy'
import Scene from './scene'
import databus    from '../databus.js';

export default class Battle extends Scene{
   constructor  (){
    super();
   }

   launch(gameServer) {
    this.gameServer = gameServer;
    databus.matchPattern = void 0;
    this.appendOpBtn();
  }
}
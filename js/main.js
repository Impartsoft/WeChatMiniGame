import Player from './player/index'
import Battle from './scenes/battle'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import dataBus from './databus'
import login from './base/login.js'
import gameServer  from './gameserver.js';

const ctx = canvas.getContext('2d')


/**
 * 游戏主函数
 */
export default class Main {
    constructor() {

      if ( !wx.getGameServerManager ) {
        return showTip('当前微信版本不支持帧同步框架');
    }
    this.server   = wx.getGameServerManager();

    // 维护当前requestAnimationFrame的id
    this.aniId = 0

    login.do(() => {
      gameServer.login().then(() => {
           this.scenesInit();
      });
    });
}

runScene(Scene) {
  // let old = this.stage.getChildByName('scene');

  // while (old) {
  //     if ( old._destroy ) {
  //         old._destroy();
  //     }
  //     old.destroy(true);
  //     // this.stage.removeChild(old);
  //     // old = this.stage.getChildByName('scene');
  // }

  let scene = new Scene();
  scene.name = 'scene';
  scene.sceneName = Scene.name;
  scene.launch(gameServer);
  // this.stage.addChild(scene);

  return scene;
}

joinToRoom() {
  wx.showLoading({ title: '加入房间中'});
  gameServer.joinRoom(databus.currAccessInfo).then(res => {
      wx.hideLoading();
      let data = res.data || {};

      databus.selfClientId = data.clientId;
      gameServer.accessInfo = databus.currAccessInfo;
      this.runScene(Room);

      console.log('join', data);
  }).catch(e=> {
      console.log(e);
  });
}


scenesInit() {
  // 从会话点进来的场景
  if ( databus.currAccessInfo ) {
      // this.joinToRoom();
  } else {
      this.runScene(Battle);
  }

  gameServer.event.on('backHome', () => {
      this.runScene(Home);
  });

  gameServer.event.on('createRoom', () => {
      // this.runScene(Room);
  });

  gameServer.event.on('onGameStart', () => {
      databus.gameInstance = this.runScene(Battle);
  });

  gameServer.event.on('onGameEnd', () => {
     gameServer.gameResult.forEach((member) => {
          var isSelf = member.nickname === databus.userInfo.nickName;
          isSelf && wx.showModal({
              content: member.win ? "你已获得胜利" : "你输了",
              confirmText: "返回首页",
              confirmColor: "#02BB00",
              showCancel: false,
              success: () => {
                 gameServer.clear();
              }
          });
      });
  });
}

  createRoom(){
    this.server.startMatch({
      match_id: "QVkc_1bkpiBbycePNaaZd_zbNCJNgHHHmJ3FR2-uCCE",
    });

    this.server.createRoom({
      maxMemberNum: 2,
      startPercent: 100,
      needUserInfo: true,
  }).then(res => {
      console.log('创建房间')
      console.log(res.data)
  });
  }
}

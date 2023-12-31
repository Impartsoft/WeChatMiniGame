import Pool from './base/pool'

/**
 * 全局状态管理器
 */
class DataBus {
  constructor() {
    this.pool = new Pool()
    this.userInfo = {};
    this.reset()
  }

  reset() {
    this.frame = 0
    this.score = 0
    this.bullets = []
    this.enemys = []
    this.animations = []
    this.gameOver = false

    this.gameover       = false;
    this.currAccessInfo = '';
    this.bullets        = [];
    this.playerMap      = {};
    this.playerList     = [];
    this.selfPosNum     = 0;
    this.selfClientId   = 1;
    this.selfMemberInfo = {};
    this.debugMsg       = [];
    this.matchPattern   = void 0;
  }

    /**
     * 回收子弹，进入对象池
     * 此后不进入帧循环
     */
    removeBullets(bullet) {
      this.bullets.splice(this.bullets.indexOf(bullet), 1);

      bullet.parent.removeChild(bullet);
  }
  
  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   */
  removeEnemey(enemy) {
    const temp = this.enemys.shift()

    temp.visible = false

    this.pool.recover('enemy', enemy)
  }

  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   */
  removeBullets(bullet) {
    const temp = this.bullets.shift()

    temp.visible = false

    this.pool.recover('bullet', bullet)
  }
}

export default new DataBus();

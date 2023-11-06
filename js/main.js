import Player from './player/index'
import Enemy from './npc/enemy'
import BackGround from './runtime/background'
import GameInfo from './runtime/gameinfo'
import Music from './runtime/music'
import DataBus from './databus'
import login from './base/login.js'

const ctx = canvas.getContext('2d')
const databus = new DataBus()

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

    // this.restart()
    // wx.cloud.init()
    wx.cloud.init({
      traceUser: true
    })

    login.do(() => {

      this.login()

      // gameServer.login().then(() => {
      //     this.scenesInit();
      // });
  });
    // this.createRoom()
    // this.test()
    // this.test1()
  }

  login() {
    console.log('login test')
    return this.server.login().then(() => {
      console.log('createRoom test')
      this.createRoom()
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

  // Get请求是通的
  test1(){
      console.log('Test1')
      // 确认已经在 onLaunch 中调用过 wx.cloud.init 初始化环境（任意环境均可，可以填空）
      const res =  wx.cloud.callContainer({
        config: {
          env: 'prod-5g3a4l1541838b0c', // 微信云托管的环境ID
        },
        path: '/api/count', // 填入业务自定义路径和参数，根目录，就是 / 
        method: 'GET', // 按照自己的业务开发，选择对应的方法
        header: {
          'X-WX-SERVICE': 'websockettest', // xxx中填入服务名称（微信云托管 - 服务管理 - 服务列表 - 服务名称）
          // 其他header参数
        }
        // dataType:'text', // 默认不填是以JSON形式解析返回结果，若不想让SDK自己解析，可以填text
        // 其余参数同 wx.request
      });


      debugger
      console.log(res);

  }

  // 请求是通了，但是没有返回结果， socketTask 也未 undefined
 test() {
    console.log("Test websocket") 
    const { socketTask } =   wx.cloud.connectContainer({
      config: {
        env: 'prod-5g3a4l1541838b0c',  // 微信云托管的环境ID
      },
      service: 'websockettest',        // 服务名
      path: '/ws'             // 不填默认根目录 
    })
    socketTask.onMessage(function (res) {
      console.log('【WEBSOCKET】', res.data)
    })
    socketTask.onOpen(function (res) {
      console.log('【WEBSOCKET】', '链接成功！')
      socketTask.send({
        data: '这是小程序消息'
      })
    })
    socketTask.onClose(function (res) {
      console.log('【WEBSOCKET】链接关闭！')
    })
  }

  restart() {
    databus.reset()

    canvas.removeEventListener(
      'touchstart',
      this.touchHandler
    )

    this.bg = new BackGround(ctx)
    this.player = new Player(ctx)
    this.gameinfo = new GameInfo()
    this.music = new Music()

    this.bindLoop = this.loop.bind(this)
    this.hasEventBind = false

    // 清除上一局的动画
    window.cancelAnimationFrame(this.aniId)

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }

  /**
   * 随着帧数变化的敌机生成逻辑
   * 帧数取模定义成生成的频率
   */
  enemyGenerate() {
    if (databus.frame % 30 === 0) {
      const enemy = databus.pool.getItemByClass('enemy', Enemy)
      enemy.init(6)
      databus.enemys.push(enemy)
    }
  }

  // 全局碰撞检测
  collisionDetection() {
    const that = this

    databus.bullets.forEach((bullet) => {
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        const enemy = databus.enemys[i]

        if (!enemy.isPlaying && enemy.isCollideWith(bullet)) {
          enemy.playAnimation()
          that.music.playExplosion()

          bullet.visible = false
          databus.score += 1

          break
        }
      }
    })

    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      const enemy = databus.enemys[i]

      if (this.player.isCollideWith(enemy)) {
        databus.gameOver = true

        break
      }
    }
  }

  // 游戏结束后的触摸事件处理逻辑
  touchEventHandler(e) {
    e.preventDefault()

    const x = e.touches[0].clientX
    const y = e.touches[0].clientY

    const area = this.gameinfo.btnArea

    if (x >= area.startX
        && x <= area.endX
        && y >= area.startY
        && y <= area.endY) this.restart()
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    this.bg.render(ctx)

    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.drawToCanvas(ctx)
      })

    this.player.drawToCanvas(ctx)

    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx)
      }
    })

    this.gameinfo.renderGameScore(ctx, databus.score)

    // 游戏结束停止帧循环
    if (databus.gameOver) {
      this.gameinfo.renderGameOver(ctx, databus.score)

      if (!this.hasEventBind) {
        this.hasEventBind = true
        this.touchHandler = this.touchEventHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandler)
      }
    }
  }

  // 游戏逻辑更新主函数
  update() {
    if (databus.gameOver) return

    this.bg.update()

    databus.bullets
      .concat(databus.enemys)
      .forEach((item) => {
        item.update()
      })

    this.enemyGenerate()

    this.collisionDetection()

    if (databus.frame % 20 === 0) {
      this.player.shoot()
      this.music.playShoot()
    }
  }

  // 实现游戏帧循环
  loop() {
    databus.frame++

    this.update()
    this.render()

    this.aniId = window.requestAnimationFrame(
      this.bindLoop,
      canvas
    )
  }
}

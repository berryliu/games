/**
 * @desc 斗地主起始文件
 */

// 页面高宽
var winHeight = window.innerHeight
var winWidth = window.innerWidth

var h = winHeight * 960 / winWidth
var game = new Phaser.Game(960, h, Phaser.AUTO, 'game')

// 选手位置
PW = 90
PH = 120

// 初始化
var Boot = {
  preload: function () {
    this.load.image('preloadBar', 'assets/images/preload.png')
  },

  create: function () {
    this.input.maxPointers = 1  // 最大 input 数
    this.stage.disableVisibilityChange = true // 浏览器 tab 切换仍继续游戏
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL // 非全屏下的拉伸方式
    this.onSizeChange()
    this.state.start('Preload')
  },

  onSizeChange: function () {
    this.scale.minWidth = 480
    this.scale.minHeight = 270
    this.scale.maxWidth = winWidth
    this.scale.maxHeight = winHeight
    this.scale.pageAlignHorizontally = true // 水平对齐
    this.scale.pageAlignVertically = true // 垂直对齐
    this.scale.forceOrientation(true) // 强制水平方向
  }
}

// 预加载
var Preload = {
  preload: function () {
    var preloadBar = this.game.add.sprite(120, 200, 'preloadBar')
    this.load.setPreloadSprite(preloadBar)  // 设置预加载精灵

    // 加载音效
    this.load.audio('music_bg', 'assets/sounds/bg3.ogg')
    this.load.audio('music_win', 'assets/sounds/win.ogg')
    this.load.audio('music_lose', 'assets/sounds/lose.ogg')

    // 加载图片 和 图片序列
    this.load.image('bg', 'assets/images/bg.png')
    this.load.atlas('btn', 'assets/images/btn.png', 'assets/images/btn.json')

    this.load.spritesheet('poker', 'assets/images/poker.png', 90, 120)  // 每帧大小
    this.load.json('rule', 'assets/rule.json')  // 棋牌规则枚举...
  },

  create: function () {
    this.state.start('Main')

    var music_bg = this.game.add.audio('music_bg')  // 音乐必须放在 Main 之后，否则场景切换就不播了（为啥要放全局变量？
    music_bg.loop = true
    music_bg.loopFull()
    music_bg.play()
  }

}

// 主页面
var Main = {
  create: function () {
    this.stage.backgroundColor = '#182d3b'
    var bg = this.game.add.sprite(this.game.width / 2, 0, 'bg')
    bg.anchor.set(0.5, 0)

    var aiRoom = this.game.add.button(this.game.world.width / 2, this.game.world.height / 4, 'btn', this.gotoAiRoom, this, 'quick.png', 'quick.png', 'quick.png')
    aiRoom.anchor.set(0.5)
    this.game.world.add(aiRoom) // 加在最顶层

    var style = { font: "28px Arial", fill: "#fff", align: "right" }
    var text = this.game.add.text(this.game.world.width - 4, 4, "蓝莓调调，欢迎回来！", style)
    text.addColor('#cc00cc', 4)
    text.anchor.set(1, 0)
    // this.state.start('Game', true, false, 1)
  },

  gotoAiRoom: function () {
    // start(key, clearWorld, clearCache, parameter), clearCache 会清理加载的资源，parameter 会传给 State.init
    this.state.start('Game', true, false, 1)
  },

}

var Game = {
  roomId: 1,
  players: [],
  titleBar: null,
  shotLayer: null,  // 操作浮层
  whoseTurn: 0, // 谁先开始
  tablePoker: [], // 桌面上的牌
  tablePokerPic: {}, // 桌面上的牌
  lastShotPlayer: null, // 最近的出牌人

  create: function () {
    this.stage.backgroundColor = '#182d3b'
    this.players.push(createPlay(0))
    this.players.push(createPlay(1))
    this.players.push(createPlay(2))
    this.createTitleBar()
    this.dealPoker()
  },
  createTitleBar: function () {
    var style = {
      font: "22px Arial",
      fill: "#fff",
      align: "center"
    }

    this.titleBar = this.game.add.text(this.game.world.centerX, 0, '房间：', style)
  },

  /**
   * @desc 打乱数组
   * @param array
   */
  shuffle: function (array) {
    function getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    for (var i = array.length - 1; i > 0; i--) {
      var j = getRandomInt(0, i);
      // swap
      var t = array[ i ];
      array[ i ] = array[ j ];
      array[ j ] = t;
    }

    return array
  },

  /**
   * @desc 分牌, 确定谁先出
   */
  dealPoker: function () {
    var self = this

    var whoseTurn = Math.floor(Math.random() * 3)
    var poker = new Array(54).fill(0).map(function (v, i) {
      return i
    })
    poker = this.shuffle(poker)

    var pokerInHand = [ [], [], [] ]
    for (var i = 0; i < 51; ++i) {
      pokerInHand[ i % 3 ].push(poker[ i ])
    }
    pokerInHand.forEach(function (v, i) {
      self.players[ i ].pokerInHand = v
    })

    var tablePoker = []

    for (var i = 51; i < 54; ++i) {
      var pid = poker[ i ]
      var p = new Poker(this, pid, pid)
      p.id = pid
      tablePoker.push(p)
    }
    this.tablePoker = tablePoker

    this.players[ whoseTurn ].setLandlord()
    this.players[ 0 ].dealPoker();
    this.players[ 1 ].dealPoker();
    this.players[ 2 ].dealPoker();
  },

  /**
   * @desc 展示最后 3 张牌
   */
  showLastThreePoker: function () {
    this.tablePoker.forEach(function (v) {
      game.add.tween(v).to({
        x: game.world.width / 2 + (i - 1) * 60
      }, 600, null, true)
    })

    game.time.events.add(1500, this.dealLastThreePoker, this)
  },

  /**
   * @desc 分 3 张牌
   */
  dealLastThreePoker: function () {
    var self = this
    var turnPlayer = this.players[ this.whoseTurn ]
    this.tablePoker.forEach(function (v) {
      turnPlayer.pokerInHand.push(v.id)
      turnPlayer.pushAPoker(v)
    })
    turnPlayer.sortPoker()
    turnPlayer.arrangePoker()

    this.tablePoker.forEach(function (v) {
      var tween = game.add.tween(v).to({
        y: game.world.height - PH * 0.8
      }, 400, null, true)

      tween.onComplete.add(function (v) {
        var tween = game.add.tween(v).to({
          y: game.world.height - PH / 2
        }, 400, null, true, 400)  // 最后一个是 delay
      }, this, v)
    })

    this.tablePoker = []  // 清空
    this.lastShotPlayer = turnPlayer
    if (this.whoseTurn === 0) {
      this.startPlay()
    }
  },

  /**
   * @desc 是否是最近的出牌人
   */
  isLastShotPlayer: function () {
    return this.players[ this.whoseTurn ].uid === this.lastShotPlayer.uid
  },
  /**
   * @desc 开始游戏
   */
  startPlay: function () {
    if (this.isLastShotPlayer()) {
      this.players[ 0 ].playPoker([])
    } else {
      this.players[ 0 ].playPoker(this.tablePoker)
    }

  }
}

/**
 * @desc 创建选手
 * @param seat
 */
function createPlay (seat) {
  var player = seat === 0 ? new Player(seat) : new NetPlayer(seat)
  var pos = [
    PW / 2, game.world.height - PH - 10,
    game.world.width - PW / 2, 94,
    PW / 2, 94
  ]
  player.initUI(pos[ seat * 2 ], pos [ seat * 2 + 1 ])
  if (seat === 0) {
    player.initShotLayer()
  } else if (seat === 1) {
    player.uiHead.scale.set(-1, 1)
  }
  return player

}

/**
 * @desc 选手
 * @param seat
 * @constructor
 */
function Player (seat) {
  this.uid = seat
  this.seat = seat
  this.uiHead = null
  this.pokerInHand = [] // 手里的牌
  this._pokerPic = {}
  this.isDraging = false  // 选中待出牌
  this.hintPoker = [] // 选中的牌
  this.isLandLord = false // 是否地主
  this.lastTurnPoker = [] // 最近的台面牌
}

Player.prototype = {
  constructor: Player,

  /**
   * @desc 初始化头像
   * @param x
   * @param y
   */
  initUI: function (x, y) {
    this.uiHead = game.add.sprite(x, y, 'btn', 'icon_farmer.png') // 先初始化农民
    this.uiHead.anchor.set(0.5, 1)
  },

  /**
   * @desc 更新用户信息
   * @param uid
   */
  updateInfo: function (uid) {
    this.uid = uid
    if (uid === -1) {
      this.uiHead.frameName = 'icon_default.png'
    } else {
      this.uiHead.frameName = 'icon_farmer.png'
    }

  },

  /**
   * @desc 设置地主
   */
  setLandlord: function () {
    this.isLandLord = true
    this.uiHead.frameName = 'icon_landlord.png'
  },

  /**
   * @desc 初始化操作浮层
   */
  initShotLayer: function () {
    this.shotLayer = game.add.group()
    var group = this.shotLayer

    var y = game.world.height * 0.6

    var pass = game.make.button(0, y, 'btn', this.onPass, this, 'pass.png', 'pass.png', 'pass.png')
    pass.anchor.set(0.5, 0)
    group.add(pass)

    var hint = game.make.button(0, y, 'btn', this.onHint, this, 'hint.png', 'hint.png', 'hint.png')
    hint.anchor.set(0.5, 0)
    group.add(hint)

    var shot = game.make.button(0, y, 'btn', this.onShot, this, 'shot.png', 'shot.png', 'shot.png')
    shot.anchor.set(0.5, 0)
    group.add(shot)

    group.forEach(function (child) {
      child.kill()  // 存在缓存里
    })
  },

  /**
   * @desc 过
   * @param btn
   */
  onPass: function (btn) {

  },

  /**
   * @desc 提示
   * @param btn
   */
  onHint: function () {

  },

  /**
   * @desc 出牌?
   * @param btn
   */
  onShot: function () {

  },

  /**
   * @desc 分牌
   */
  dealPoker: function () {
    var self = this

    this.sortPoker()
    this.pokerInHand.forEach(function (v, i) {
      var p = new Poker(v, v)
      game.world.add(p)
      self.pushAPoker(p)
      self.dealPokerAnim(p, i)
    })

  },

  /**
   * @desc 牌排序
   */
  sortPoker: function () {
    this.pokerInHand.sort(Poker.comparePoker)
  },

  /**
   * @desc 接收一张牌，并绑定事件
   * @param poker
   */
  pushAPoker: function (poker) {
    poker.events.onInputDown.add(this.onInputDown, this)
    poker.events.onInputUp.add(this.onInputUp, this)
    poker.events.onInputOver.add(this.onInputOver, this)

    this._pokerPic[ poker.id ] = poker  // 一个 sprite
  },

  onInputDown: function (poker, pointer) {
    this.isDraging = true;
    this.onSelectPoker(poker, pointer);
  },

  onInputUp: function (poker, pointer) {
    this.isDraging = false;
    //this.onSelectPoker(poker, pointer);
  },

  onInputOver: function (poker, pointer) {
    if (this.isDraging) {
      this.onSelectPoker(poker, pointer);
    }
  },

  /**
   * @desc 选中或反选中牌
   * @param poker
   * @param pointer
   */
  onSelectPoker: function (poker, pointer) {
    var index = this.hintPoker.indexOf(poker.id)
    if (index === -1) {
      poker.y = game.world.height - PH * 0.8
      this.hintPoker.push(poker.id)
    } else {
      poker.y = game.world.height - PH * 0.5
      this.hintPoker.splice(index, 1)
    }

  },

  /**
   * @desc 分牌动画
   * @param poker
   * @param i
   */
  dealPokerAnim: function (poker, i) {
    game.add.tween(poker).to({
      x: game.world.width / 2 + PW * 0.44 * (i - 85),
      y: game.world.height - PH / 2
    }, 500, null, true, 50 * i)
  },

  /**
   * @desc 开始玩牌
   * @param lastTurnPoker
   */
  playPoker: function (lastTurnPoker) {
    this.lastTurnPoker = lastTurnPoker

    var group = this.shotLayer
    var step = game.world.width / 6
    var x = game.world.width / 2 - 0.5 * step // 三个按钮中间的那个位置

    if (!Game.isLastShotPlayer()) { // 当前人不是最近出牌人才可以 pass
      x -= 0.5 * step
      var pass = group.getAt(0)
      pass.centerX = x
      x += step
      pass.revive() // 从缓存里恢复
    }
    var hint = group.getAt(1);
    hint.centerX = sx;
    hint.revive();

    var shot = group.getAt(2);
    shot.centerX = sx + step;
    shot.revive();

    this.enableInput()
  },

  /**
   * @desc 允许控制牌
   */
  enableInput: function () {
    var self = this
    this.pokerInHand.forEach(function (v) {
      var p = self.findAPoker(v)
      p.inputEnabled = true
    })
  },

  /**
   * @desc 找到一张牌
   * @param pid
   * @returns {*}
   */
  findAPoker: function (pid) {
    var poker = this._pokerPic[ pid ]
    if (poker === undefined) {
      console.log('Error: FIND POKER ', pid)
    }
    return poker
  }

}

/**
 * @desc AI
 * @param seat
 * @constructor
 */
function NetPlayer (seat) {
  Player.call(this, seat)
}

var netPlayerPrototype = Object.assign(Player.prototype, {
  /**
   * @desc 分牌动画
   * @param poker
   * @param i
   */
  dealPokerAnim: function (poker, i) {
    var width = game.world.width
    if (poker.id > 53) {
      game.add.tween(poker).to({
        x: this.seat === 1 ? width - PW / 2 : PW / 2,
        y: this.seat === 1 ? this.uiHead.y + PH / 2 + 10 : this.uiHead.y + PH / 2 + 10
      }, 500, null, true, 25 + 50 * i)
    } else {
      game.add.tween(poker).to({
        x: this.seat == 1 ? (width - PW / 2) - (i * PW * 0.44) : PW / 2 + i * PW * 0.44,
        y: this.seat == 1 ? this.uiHead.y + PH / 2 + 10 : this.uiHead.y + PH * 1.5 + 20
      }, 500, null, true, 25 + 50 * i)
    }
  },

})

NetPlayer.prototype = Object.create(netPlayerPrototype)
NetPlayer.prototype.constructor = NetPlayer

/**
 * @desc 牌
 * @param id
 * @param frame
 * @constructor
 */
function Poker (id, frame) {
  Phaser.Sprite.call(this, game, game.world.width / 2, game.world.height * 0.4, 'poker', frame)
  this.anchor.set(0.5)
  this.id = id
  return this
}

Poker.prototype = Object.create(Phaser.Sprite.prototype)
Poker.prototype.constructor = Poker

/**
 * @desc 比较牌面大小
 * @param a
 * @param b
 * @returns {number}
 */
Poker.comparePoker = function (a, b) {
  if (a instanceof Array && b instanceof Array) {
    a = a[ 0 ]
    b = b[ 0 ]
  }

  if (a >= 52 || b >= 52) { // 大小王随意比较
    return -(a - b)
  }

  a = a % 13
  b = b % 13

  if (a == 0 || a == 1) { // A 和 2 的大小
    a += 13
  }
  if (b == 0 || b == 1) {
    b += 13
  }

  return -(a - b)
}

// 加载场景
game.state.add('Boot', Boot)
game.state.add('Preload', Preload)
game.state.add('Main', Main)
game.state.add('Game', Game)

// 初始化
game.state.start('Boot')


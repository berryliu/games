/**
 * @desc 斗地主起始文件
 */

// 页面高宽
var winHeight = window.innerHeight
var winWidth = window.innerWidth

var h = winHeight * 960 / winWidth
var game = new Phaser.Game(960, h, Phaser.AUTO, 'game')

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
  },

  gotoAiRoom: function () {
    // start(key, clearWorld, clearCache, parameter), clearCache 会清理加载的资源，parameter 会传给 State.init
    // this.state.start('Game', true, false, 1)
  },

}

// 加载场景
game.state.add('Boot', Boot)
game.state.add('Preload', Preload)
game.state.add('Main', Main)

// 初始化
game.state.start('Boot')


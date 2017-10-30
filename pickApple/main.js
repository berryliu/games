// 接苹果的小游戏

var width = window.innerWidth
var height = window.innerHeight

var game = new Phaser.Game(width, height, Phaser.AUTO, '#game')

var states = {
  preload: function () {
    this.preload = function () {
      game.load.crossOrigin = 'anonymous'

      game.load.image('bg', './assets/images/bg.png')
      game.load.image('dude', './assets/images/dude.png')
      game.load.image('green', './assets/images/green.png')
      game.load.image('red', './assets/images/red.png')
      game.load.image('yellow', './assets/images/yellow.png')
      game.load.image('bomb', './assets/images/bomb.png')
      game.load.image('five', './assets/images/five.png')
      game.load.image('three', './assets/images/three.png')
      game.load.image('one', './assets/images/one.png')
      game.load.audio('bgMusic', './assets/audio/bgMusic.mp3')
      game.load.audio('boomMusic', './assets/audio/boom.mp3')
      game.load.audio('scoreMusic', './assets/audio/addscore.mp3')

      var progressText = game.add.text(game.world.centerX, game.world.centerY, '0%', {
        fontSize: '60px',
        fill: '#fff'
      })
      progressText.anchor.setTo(0.5, 0.5)

      game.load.onFileComplete.add(function (progress) {
        progressText.text = progress + '%'
      })

      game.load.onLoadComplete.add(onload)

      // 最小加载时间
      var deadline = false
      setTimeout(function () {
        deadline = true
      }, 1000)

      function onload () {
        if (deadline) {
          game.state.start('created')
        } else {
          setTimeout(onload, 500)
        }
      }

    }
  },
  created: function () {
    this.create = function () {
      // 背景
      var bg = game.add.image(0, 0, 'bg')
      bg.width = game.world.width
      bg.height = game.world.height

      // 标题
      var title = game.add.text(game.world.centerX, game.world.height * 0.25, '小恐龙接苹果', {
        fontSize: '40px',
        fontWeight: 'bold',
        fill: '#f2bb15'
      })

      title.anchor.setTo(0.5, 0.5)

      // 提示
      var remind = game.add.text(game.world.centerX, game.world.centerY, '点击任意位置开始', {
        fontSize: '20px',
        fill: '#f2bb15'
      })
      remind.anchor.setTo(0.5, 0.5)

      // 恐龙
      var man = game.add.sprite(game.world.centerX, game.world.height * 0.75, 'dude')
      var manImage = game.cache.getImage('dude')
      man.width = game.world.width * 0.2
      man.height = man.width / manImage.width * manImage.height
      man.anchor.setTo(0.5, 0.5)

      // 添加点击事件
      game.input.onTap.add(function () {
        game.state.start('play')
      })
    }
  },
  play: function () {
    this.create = function () {
      var score = 0

      // 背景音乐
      var bgMusic = game.add.audio('bgMusic')
      bgMusic.loopFull()

      // 特效音乐
      var scoreMusic = game.add.audio('scoreMusic')
      var bombMusic = game.add.audio('bombMusic')

      // 背景
      var bg = game.add.image(0, 0, 'bg')
      bg.width = game.world.width
      bg.height = game.world.height

      // 恐龙
      var man = game.add.sprite(game.world.centerX, game.world.height * 0.75, 'dude')
      var manImage = game.cache.getImage('dude')
      man.width = game.world.width * 0.2
      man.height = man.width / manImage.width * manImage.height
      man.anchor.setTo(0.5, 0.5)

      // 分数
      var title = game.add.text(game.world.centerX, game.world.height * 0.25, '0', {
        fontSize: '40px',
        fontWeight: 'bold',
        fill: '#f2bb15'
      })
      title.anchor.setTo(0.5, 0.5)

      // 判断是否按下
      var touching = false
      game.input.onDown.add(function (pointer) {
        if (Math.abs(pointer.x - man.x) < (man.width / 2)) {
          touching = true
        }
      })
      game.input.onUp.add(function () {
        touching = false
      })

      // 移动恐龙
      game.input.addMoveCallback(function (pointer, x, y, isTap) {  // 是否是点击
        if (!isTap && touching) {
          man.x = x
        }
      })

      // 添加苹果组
      var apples = game.add.group()
      var appleTypes = [ 'green', 'red', 'yellow' ]
      var appleTimer = game.time.create(true) // 自动销毁

      appleTimer.loop(1000, function () {
        var x = Math.random() * game.world.width
        var type = appleTypes[ Math.floor(Math.random() * appleTypes.length) ]
        var apple = apples.create(x, 0, type)

        // 设置苹果大小
        var appleImage = game.cache.getImage(type)
        apple.width = game.world.width / 8
        apple.height = apple.width / appleImage.width * appleImage.height

        game.physics.enable(apple)
      })

      appleTimer.start()

      game.physics.startSystem(Phaser.Physics.Arcade)
      game.physics.arcade.gravity.y = 300

    }
  },
  over: function () {
    this.create = function () {
      game.stage.backgroundColor = '#000'

      alert('game over')
    }

  }
}

// 添加场景
Object.keys(states).map(function (key) {
  game.state.add(key, states[ key ])
})

game.state.start('preload');
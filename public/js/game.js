const WIDTH = 1100;
const HEIGHT = WIDTH;
const GRID_DISTANCE = WIDTH / 11;

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: WIDTH,
  height: HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  } 
};

var game = new Phaser.Game(config);

function preload() {
  this.load.image('ship', 'assets/spaceShips_001.png');
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });
  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });
  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });
  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();
  self.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  self.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  self.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  self.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });

  this.socket.on('scoreUpdate', function (scores) {
    self.blueScoreText.setText('CoinCount: ' + scores.blue);
  });

  this.socket.on('starLocation', function (starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
    self.physics.add.overlap(self.ship, self.star, function () {
      this.socket.emit('starCollected');
    }, null, self);
  });
}

function addPlayer(self, playerInfo) {
  self.ship = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);

  self.ship.stopMoving = ()=> {
    self.ship.isMoving = false;
  };

  self.ship.move = (direction)=> {
    self.ship.isMoving = true;

    if(direction === 'up'){
      self.ship.body.y -= GRID_DISTANCE;
    } else if(direction === 'left') {
      self.ship.body.x -= GRID_DISTANCE;
    } else if(direction == 'down') {
      self.ship.body.y += GRID_DISTANCE;
    } else if(direction == 'right') {
      self.ship.body.x += GRID_DISTANCE;
    }

    setTimeout(self.ship.stopMoving, 250)
  };

  self.ship.moveUp = ()=> {
    self.ship.move('up');
  };

  self.ship.moveLeft = ()=> {
    self.ship.move('left');
  };

  self.ship.moveDown = ()=> {
    self.ship.move('down');
  };

  self.ship.moveRight = ()=> {
    self.ship.move('right');
  };

  if (playerInfo.team === 'blue') {
    self.ship.setTint(0x0000ff);
  } else {
    self.ship.setTint(0xff0000);
  }
}

// function addOtherPlayers(self, playerInfo) {
//   const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
//   if (playerInfo.team === 'blue') {
//     otherPlayer.setTint(0x0000ff);
//   } else {
//     otherPlayer.setTint(0xff0000);
//   }
//   otherPlayer.playerId = playerInfo.playerId;
//   self.otherPlayers.add(otherPlayer);
// }

function update(time, delta) {
  if (this.ship) {
    if (!this.ship.isMoving) {
      if (this.cursors.up.isDown || this.upKey.isDown) {
        this.ship.moveUp();
      } else if (this.cursors.left.isDown || this.leftKey.isDown) {
        this.ship.moveLeft();
      } else if(this.cursors.down.isDown || this.downKey.isDown) {
        this.ship.moveDown();
      } else if(this.cursors.right.isDown || this.rightKey.isDown) {
        this.ship.moveRight();
      }
    }
  
    this.physics.world.wrap(this.ship, 5);

    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y)) {
      this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y });
    }
    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
    };
  }
}

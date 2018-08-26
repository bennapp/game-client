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
var player;
var lastMoveTime = 0;
var repeatMoveDelay = 100;
var cam;

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

  // rawGame state is a string, representing the state of the world the player has loaded
  // the string is JSON formatted
  // `loadedLocation` will be the start of the top left corner of what the player has loaded.
  // The player will see a smaller subset of what they have loaded; their 'vision' will be smaller
  // than their `loaded` vision.

  // I think it would be nice to have coordinates be there 'true' coordinate position, as in ignoring subworlds.
  // The coordinates are key values pretty similar to our redis-store.

  // The objects can be keyed by their type. I think this will allow the client to quickly iterate over objects and be
  // able to easily instantiate them in the client's state.

  // I think the client should update the server / backend with the state of its player but should only be notified form
  // the server of the state of the player when the server detects the client's state of the player is wrong / needs to be corrected.
  // This way, the server is sending gameStates to the client that would 'undo' the client's previous move.

  self.updateGameState = (jsonGameState) => {
    self.loadedLocation = jsonGameState['loadedLocation'];
    // delete all coordinates outside of 'loaded vision' determined by fixed grid size and `loadedLocation`

    // merge all objects.
    // Create new objects from `objects` key.
    // Update existing objects from `objects` key.
    // Delete existing objects that are now missing from `objects` key.

    // update all coordinates with new objects
  };

  self.gameStateUpdate = (rawGameState) => {
    jsonGameState = JSON.parse(rawGameState);

    // stubbed for now
    jsonGameState = {
      loadedLocation: "0,0",
      coordinates: {
        "0,1": "coin:33",
        "0,2": "player:1",
        "0,3": "rock:-1", // is this -1 for now?
      },
      objects: {
        player: {
          "1": {
            hp: "10",
            alive: "true",
            coinCount: "22",
          },
          "2": {
            hp: "7",
            alive: "true"
          }
        },
        coin: {
          "33": {
            amount: "11",
          },
          "2": {
            amount: "3"
          }
        },
        rock: "", // is this just an empty string for now?
      },
    };

    // self.updateGameState(jsonGameState)

    // this 'upserts' (update or inserts) new objects
    // self.loadObjects(jsonGameState["objects"])

    // set a variable as the loaded location
    // self.setLoadedLocation(jsonGameState['loadedLocation'])
  };

  this.socket.on('stateUpdate', self.gameStateUpdate)
}

function addPlayer(self, playerInfo) {
  self.ship = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'ship')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(53, 40);

  self.ship.move = (time, direction) => {
    if(direction === 'up'){
      self.ship.body.y -= GRID_DISTANCE;
    } else if(direction === 'left') {
      self.ship.body.x -= GRID_DISTANCE;
    } else if(direction == 'down') {
      self.ship.body.y += GRID_DISTANCE;
    } else if(direction == 'right') {
      self.ship.body.x += GRID_DISTANCE;
    }

    lastMoveTime = time;
  };

  self.ship.moveUp = (time) => {
    self.ship.move(time, 'up');
  };

  self.ship.moveLeft = (time) => {
    self.ship.move(time, 'left');
  };

  self.ship.moveDown = (time) => {
    self.ship.move(time, 'down');
  };

  self.ship.moveRight = (time) => {
    self.ship.move(time, 'right');
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
    if (time > lastMoveTime + repeatMoveDelay) {
      if (this.cursors.up.isDown || this.upKey.isDown) {
        this.ship.moveUp(time);
      } else if (this.cursors.left.isDown || this.leftKey.isDown) {
        this.ship.moveLeft(time);
      } else if(this.cursors.down.isDown || this.downKey.isDown) {
        this.ship.moveDown(time);
      } else if(this.cursors.right.isDown || this.rightKey.isDown) {
        this.ship.moveRight(time);
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

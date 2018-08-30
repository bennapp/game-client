import 'phaser'
import ioClient from 'socket.io-client'
import { WIDTH, HEIGHT } from './constants'

import { World } from './gs/world'

var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: WIDTH,
  height: HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
      gravity: {
        x: 0,
        y: 0
      }
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
var cam;
var world;

function preload() {
  // TODO WEBPACK ASSETS
  this.load.image('ship', 'assets/spaceShips_001.png');
  this.load.image('otherPlayer', 'assets/enemyBlack5.png');
  this.load.image('star', 'assets/star_gold.png');
  this.load.spritesheet('rocks', 'assets/sprites/Rock Pile.png', {frameWidth: 192, frameHeight: 192});
}

function create() {
  var self = this;
  self.world = new World(self);
  this.socket = ioClient('http://localhost:8081');
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
    // self.otherPlayers.getChildren().forEach(function (otherPlayer) {
    //   if (playerId === otherPlayer.playerId) {
    //     otherPlayer.destroy();
    //   }
    // });
  });
  this.socket.on('playerMoved', function (playerInfo) {
    // self.otherPlayers.getChildren().forEach(function (otherPlayer) {
    //   if (playerInfo.playerId === otherPlayer.playerId) {
    //     otherPlayer.setPosition(playerInfo.x, playerInfo.y);
    //   }
    // });
  });

  this.cursors = this.input.keyboard.createCursorKeys();
  self.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  self.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  self.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  self.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

  // this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });

  this.socket.on('scoreUpdate', function (scores) {
    // self.blueScoreText.setText('CoinCount: ' + scores.blue);
  });

  this.socket.on('starLocation', function (starLocation) {
    // if (self.star) self.star.destroy();
    // self.star = self.arcade.add.image(starLocation.x, starLocation.y, 'star');
    // self.arcade.add.overlap(self.ship, self.star, function () {
    //   this.socket.emit('starCollected');
    // }, null, self);
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
    let jsonGameState = JSON.parse(rawGameState);
    this.world.setState(jsonGameState);
  };
  this.socket.on('stateUpdate', self.gameStateUpdate);

  let stubbedJsonGameState = {
    loadedLocation: "0,0",
    coordinates: {
      // "0,1": { type: 'coin', id: '33' },
      // "0,2": { type: 'player', id: '1' },
      "0,0": { type: 'rock', id: '-1' },
      "2,2": { type: 'rock', id: '-1' },
    },
    objects: {
      // player: {
      //   "1": {
      //     hp: "10",
      //     alive: "true",
      //     coinCount: "22",
      //   },
      //   "2": {
      //     hp: "7",
      //     alive: "true"
      //   }
      // },
      // coin: {
      //   "33": {
      //     amount: "11",
      //   },
      //   "2": {
      //     amount: "3"
      //   }
      // },
      rock: {
        "-1": {}
      }
    },
  };

  this.world.setState(stubbedJsonGameState)

  stubbedJsonGameState = {
    loadedLocation: "0,0",
    coordinates: {
      "0,0": { type: 'rock', id: '-1' },
      "3,3": { type: 'rock', id: '-1' },
    },
    objects: {
      rock: {
        "-1": {}
      }
    },
  };

  this.world.setState(stubbedJsonGameState)
}

function addPlayer(self, playerInfo) {
  // Refactor later when we are ready to handle first response from server,
  // should set gamestate and player location
  self.ship = self.world.player;
}

function addOtherPlayers(self, playerInfo) {
  // const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  // if (playerInfo.team === 'blue') {
  //   otherPlayer.setTint(0x0000ff);
  // } else {
  //   otherPlayer.setTint(0xff0000);
  // }
  // otherPlayer.playerId = playerInfo.playerId;
  //self.otherPlayers.add(otherPlayer);
}

function update(time, delta) {
  if (this.ship) {
    let direction = null;
    if (this.cursors.up.isDown || this.upKey.isDown) {
      direction = 'up';
    } else if (this.cursors.left.isDown || this.leftKey.isDown) {
      direction = 'left';
    } else if(this.cursors.down.isDown || this.downKey.isDown) {
      direction = 'down';
    } else if(this.cursors.right.isDown || this.rightKey.isDown) {
      direction = 'right';
    }

    if (direction) {
      this.world.move(this.ship, time, direction);
    }

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

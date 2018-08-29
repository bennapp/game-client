import { NUM_CELLS, GRID_DISTANCE } from '../constants'
import { Rock } from "../el/rock";
import { Player } from "../el/player";

class World {
  constructor(game) {
    this.grid = [];
    for (let x = 0; x < NUM_CELLS; x++){
      this.grid.push([]);
    }

    // This will be refactored later when we have game state passed by websockets
    this.player = new Player(game, { x: 100, y: 100 });

    // this.grid[0][0] = new Rock(game, {x: 0, y: 0});
    // this.grid[2][2] = new Rock(game, {x: 200, y: 200});

    this.lastMoveTime = 0;
    this.repeatMoveDelay = 100;

    // Player loc will be fixed to the middle later
    this.playerLoc = { x: 1, y: 1 }

    this.game = game;
  }

  setState(jsonGameState) {
    self = this;
    Object.keys(jsonGameState.coordinates).forEach(function(coordString) {
      self.buildObjectFromCoord(coordString, jsonGameState)
    });

    // this 'upserts' (update or inserts) new objects
    // self.loadObjects(jsonGameState["objects"])
    // set a variable as the loaded location
    // self.setLoadedLocation(jsonGameState['loadedLocation'])
  }

  buildObjectFromCoord(coordString, jsonGameState) {
    let coords = coordString.split(',').map(Number);
    this.grid[coords[0]][coords[1]] = this.buildObject(coords, jsonGameState.coordinates[coordString], jsonGameState)
  }

  buildObject(coords, coordValue, jsonGameState) {
    let values = jsonGameState.objects[coordValue.type][coordValue.id];


    let type = coordValue.type;
    let x = coords[0] * GRID_DISTANCE;
    let y = coords[1] * GRID_DISTANCE;

    let object;
    if (type == 'rock') {
      object = new Rock(this.game, {x: x, y: y});
    }

    return object
  }

  isValidMove(position) {
    if (position.x < 0 || position.x === NUM_CELLS) {
      return false
    }

    if (position.y < 0 || position.y === NUM_CELLS) {
      return false
    }

    return !this.grid[position.x][position.y]
  }

  move(player, time, direction) {
    if (time > (this.lastMoveTime + this.repeatMoveDelay)) {
      var nextPosition = {};
      nextPosition.x = this.playerLoc.x;
      nextPosition.y = this.playerLoc.y;

      switch (direction) {
        case 'up':
          nextPosition.y -= 1;
          break;
        case 'left':
          nextPosition.x -= 1;
          break;
        case 'down':
          nextPosition.y += 1;
          break;
        case 'right':
          nextPosition.x += 1;
          break;
      }

      if (this.isValidMove(nextPosition)) {
        player.move(direction);
        this.playerLoc = nextPosition;
        this.lastMoveTime = time;
      }
    }
  }
}

export { World }

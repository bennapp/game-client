import { NUM_CELLS } from '../constants'
import { Rock } from "../el/rock";

class World {
  constructor(game) {
    this.grid = [];
    for (let x = 0; x < NUM_CELLS; x++){
      this.grid.push([]);
    }

    // This will be refactored later when we have game state passed by websockets
    this.grid[0][0] = new Rock(game, {x: 0, y: 0});
    this.grid[2][2] = new Rock(game, {x: 200, y: 200});

    this.lastMoveTime = 0;
    this.repeatMoveDelay = 100;

    this.playerLoc = { x: 1, y: 1 }
  }

  isValidMove(position) {
    if (!this.grid[position.x]) {
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

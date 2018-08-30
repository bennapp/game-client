import { NUM_CELLS, GRID_DISTANCE } from '../constants'
import { Rock } from "../el/rock";
import { Player } from "../el/player";

class World {
  constructor(game) {
    this.initializeEmptyGrid();

    // This will be refactored later when we have game state passed by websockets
    this.player = new Player(game, { x: 200, y: 200 });

    this.lastMoveTime = 0;
    this.repeatMoveDelay = 100;

    // Player loc will be fixed to the middle later

    this.globalPlayerLocation = { x: 55, y: 55 };
    this.loadedLocation = {};

    this.game = game;
  }

  initializeEmptyGrid() {
    this.grid = [];
    for (let x = 0; x < NUM_CELLS; x++) {
      this.grid.push([]);
    }
  }

  emptyGrid(){
    for (let x = 0; x < NUM_CELLS; x++) {
      for (let y = 0; y < NUM_CELLS; y++) {
        if (this.grid[x] && this.grid[x][y]) {
          this.grid[x][y].destroy();
          this.grid[x][y] = undefined;
        }
      }
    }
  }

  // rawGame state is a string, representing the state of the world the player has loaded
  // the string is JSON formatted
  // The player will see a smaller subset of what they have loaded; their 'vision' will be smaller
  // than their `loaded` vision.
  // I think it would be nice to have coordinates be there 'true' coordinate position, as in ignoring subworlds.
  // The coordinates are key values pretty similar to our redis-store.
  // The objects can be keyed by their type. I think this will allow the client to quickly iterate over objects and be
  // able to easily instantiate them in the client's state.
  // I think the client should update the server / backend with the state of its player but should only be notified form
  // the server of the state of the player when the server detects the client's state of the player is wrong / needs to be corrected.
  // This way, the server is sending gameStates to the client that would 'undo' the client's previous move.

  // merge all objects.
  // Create new objects from `objects` key.
  // Update existing objects from `objects` key.
  // Delete existing objects that are now missing from `objects` key.
  // update all coordinates with new objects

  // Create new objects from `objects` key.
  // Update existing objects from `objects` key.
  // Delete existing objects that are now missing from `objects` key.
  // update all coordinates with new objects

  setState(jsonGameState) {
    this.emptyGrid();

    if (jsonGameState.globalPlayerLocation){
      this.globalPlayerLocation.x = Number(jsonGameState.globalPlayerLocation.x);
      this.globalPlayerLocation.y = Number(jsonGameState.globalPlayerLocation.y);
    }

    this.loadedLocation.x = Number(jsonGameState.loadedLocation.x);
    this.loadedLocation.y = Number(jsonGameState.loadedLocation.y);

    self = this;
    Object.keys(jsonGameState.coordinates).forEach(function(coordString) {
      self.buildObjectFromCoord(coordString, jsonGameState)
    });

    // this 'upserts' (update or inserts) new objects
    // self.loadObjects(jsonGameState["objects"])
    // set a variable as the loaded location
  }

  coordsFromCoordString(coordString) {
    return coordString.split(',').map(Number);
  }

  buildObjectFromCoord(coordString, jsonGameState) {
    let coords = this.coordsFromCoordString(coordString);
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

      nextPosition.x = this.relativePlayerLoc().x;
      nextPosition.y = this.relativePlayerLoc().y;

      switch (direction) {
        case 'up':
          nextPosition.y -= 1;
          direction = 'down';
          break;
        case 'left':
          nextPosition.x -= 1;
          direction = 'right';
          break;
        case 'down':
          nextPosition.y += 1;
          direction = 'up';
          break;
        case 'right':
          nextPosition.x += 1;
          direction = 'left';
          break;
      }

      if (this.isValidMove(nextPosition)) {
        this.globalPlayerLocation.x += nextPosition.x;
        this.globalPlayerLocation.y += nextPosition.y;
        console.log(this.globalPlayerLocation);
        // send position to server

        this.moveAllGridElements(direction);
        this.lastMoveTime = time;
      }
    }
  }

  moveAllGridElements(direction) {
    for (let x = 0; x < NUM_CELLS; x++) {
      for (let y = 0; y < NUM_CELLS; y++) {
        if (this.grid[x] && this.grid[x][y]) {
          this.grid[x][y].move(direction);
        }
      }
    }
  }

  relativePlayerLoc(){
    return {
      x: this.globalPlayerLocation.x - this.loadedLocation.x,
      y: this.globalPlayerLocation.y - this.loadedLocation.y,
    }
  }
}

export { World }

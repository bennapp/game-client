import { GRID_DISTANCE, GRID_OFFSET } from '../constants'

class Rock {
  constructor(game, attributes) {
    this.sprite = game.physics.add.sprite(attributes.x + GRID_OFFSET, attributes.y + GRID_OFFSET, 'rocks')
      .setDisplaySize(GRID_DISTANCE, GRID_DISTANCE);
  }

  move(direction) {
    if(direction === 'up'){
      this.sprite.y -= GRID_DISTANCE;
    } else if(direction === 'left') {
      this.sprite.x -= GRID_DISTANCE;
    } else if(direction === 'down') {
      this.sprite.y += GRID_DISTANCE;
    } else if(direction === 'right') {
      this.sprite.x += GRID_DISTANCE;
    }
  }

  destroy() {
    this.sprite.destroy();
  }
}

export { Rock };

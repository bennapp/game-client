import {GRID_DISTANCE, GRID_OFFSET} from '../constants'

class Player {
  constructor(game, attributes) {
    this.sprite = game.physics.add.sprite(attributes.x + GRID_OFFSET, attributes.y + GRID_OFFSET, 'ship')
      .setDisplaySize(GRID_DISTANCE, GRID_DISTANCE);

    if (attributes.team === 'blue') {
      this.sprite.setTint(0x0000ff);
    } else {
      this.sprite.setTint(0xff0000);
    }
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
}

export { Player };

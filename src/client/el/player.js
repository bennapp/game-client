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

  destroy() {
    this.sprite.destroy();
  }
}

export { Player };

import { GRID_DISTANCE, GRID_OFFSET } from '../constants'

class Rock {
  constructor(game, attributes) {
    game.physics.add.image(attributes.x + GRID_OFFSET, attributes.y + GRID_OFFSET, 'rocks')
      .setDisplaySize(GRID_DISTANCE, GRID_DISTANCE);
  }
}

export { Rock };

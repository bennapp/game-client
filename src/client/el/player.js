import { GRID_DISTANCE } from '../constants'

class Player {
  constructor(game, attributes) {
    this.sprite = game.matter.add.sprite(attributes.x, attributes.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    this.lastMoveTime = 0;
    this.repeatMoveDelay = 100;

    if (attributes.team === 'blue') {
      this.sprite.setTint(0x0000ff);
    } else {
      this.sprite.setTint(0xff0000);
    }
  }

  move(time, direction) {
    if (time > (this.lastMoveTime + this.repeatMoveDelay)) {
      if(direction === 'up'){
        this.sprite.y -= GRID_DISTANCE;
      } else if(direction === 'left') {
        this.sprite.x -= GRID_DISTANCE;
      } else if(direction === 'down') {
        this.sprite.y += GRID_DISTANCE;
      } else if(direction === 'right') {
        this.sprite.x += GRID_DISTANCE;
      }

      this.lastMoveTime = time;
    }
  }
}

export { Player };

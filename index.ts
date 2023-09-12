import * as ex from 'excalibur';
import { createActorWithImage, createAnimatedActor, createAnimation, getImage } from './helper';

const scale = 0.5;

(async () => {
  let points = 0;
  let lives = 5;

  const birdImage = new ex.ImageSource(getImage('BirdIdle.png'));
  const beeImage = new ex.ImageSource(getImage('BeeIdle.png'));
  const bgImage = new ex.ImageSource(getImage('Background2.png'));
  const explodeImage = new ex.ImageSource(getImage('Explode.png'));
  const frozenHeartImage = new ex.ImageSource('https://i.ibb.co/sKP3S3X/HP-Bonus-03.png');
  const activeHeartImage = new ex.ImageSource('https://i.ibb.co/5TLLxzP/HP-Bonus-04.png');
  const thumbsUpImage = new ex.ImageSource('https://i.ibb.co/zhTH818/Coin-04.png');
  const thumbsDownImage = new ex.ImageSource('https://i.ibb.co/tXJcBsY/Coin-03.png');
  const power1Image = new ex.ImageSource('https://i.ibb.co/7v12qmx/Prop-7.png');
  const power2Image = new ex.ImageSource('https://i.ibb.co/q7D6twC/Flight-Bonus-04.png');
  const promises = [
    birdImage.load(),
    bgImage.load(),
    beeImage.load(),
    explodeImage.load(),
    frozenHeartImage.load(),
    activeHeartImage.load(),
    thumbsDownImage.load(),
    thumbsUpImage.load(),
    power1Image.load(),
    power2Image.load(),
  ];
  await Promise.all(promises);

  const game = new ex.Engine({
    width: bgImage.width,
    height: bgImage.height,
  });

  const bgSprite = bgImage.toSprite();

  const bee = createAnimatedActor({
    image: birdImage,
    numberOfImages: 12,
    scale,
    x: 100,
    radius: 100,
  });

  const bg = new ex.Actor({ x: bgImage.width / 2, y: bgImage.height / 2 });
  bg.scale = new ex.Vector(1, 1);
  bg.graphics.use(bgSprite);

  const pointsLabel = new ex.Label({
    text: points.toString(),
    pos: ex.vec(bgImage.width - 100, 100),
    width: 300,
    color: ex.Color.White,
    font: new ex.Font({
      family: 'impact',
      size: 100,
      unit: ex.FontUnit.Px,
      textAlign: ex.TextAlign.Right,
    }),
  });

  game.add(bg);
  game.add(bee);
  game.add(pointsLabel);

  const hearts: ex.Actor[] = [];
  for (let i = 0; i < 5; i++) {
    hearts.push(createActorWithImage(50 + 80 * i, 1000, activeHeartImage));
    game.add(hearts[i]);
  }

  game.input.pointers.on('move', (ev) => {
    bee.actions.clearActions();
    bee.actions.moveTo(new ex.Vector(bee.pos.x, ev.worldPos.y), 200);
  });

  game.start();

  const rand = new ex.Random();

  setInterval(() => {
    const extraLife = createActorWithImage(
      bgImage.width + (beeImage.width * scale) / 2,
      ex.randomInRange(beeImage.height / 2, bgImage.height - beeImage.height / 2, rand),
      thumbsUpImage
    );
    extraLife.actions.moveTo(new ex.Vector(0, extraLife.pos.y), 300).callMethod(() => {
      extraLife.kill();
    });
    game.add(extraLife);
  }, 3500);

  setInterval(() => {
    const newBee = createAnimatedActor({
      image: beeImage,
      numberOfImages: 12,
      scale,
      flippedHorizontal: true,
      radius: 100,
      x: bgImage.width + (birdImage.width * scale) / 2,
      y: ex.randomInRange(birdImage.height / 2, bgImage.height - birdImage.height / 2, rand),
    });
    newBee.actions.moveTo(new ex.Vector(0, newBee.pos.y), 300).callMethod(() => {
      if (lives > 0) { lives--; }
      refreshLives();
      newBee.kill();
    });
    newBee.on('collisionstart', (c) => {
      if (c.other.id !== bee.id) {
        return;
      }

      const explodeAnimation = createAnimation({
        image: explodeImage,
        numberOfImages: 10,
        scale,
        animationStrategy: ex.AnimationStrategy.End,
      });
      newBee.actions.clearActions();
      explodeAnimation.events.on('end', () => {
        points++;
        pointsLabel.text = points.toString();
        newBee.kill();
      });
      newBee.graphics.use(explodeAnimation);
    });
    game.add(newBee);
  }, 3000);

  function refreshLives() {
    for (let i = 0; i < 5; i++) {
      if (lives > i) {
        hearts[i].graphics.use(activeHeartImage.toSprite());
      }
      else {
        hearts[i].graphics.use(frozenHeartImage.toSprite());
      }
    }
  }
})();

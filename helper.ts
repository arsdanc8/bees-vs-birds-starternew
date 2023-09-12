import * as ex from 'excalibur';

const imageBaseUrl: string = 'https://cddataexchange.blob.core.windows.net/images/ExcaliburFirstSteps/';

export function getImage(name: string): string {
  return `${imageBaseUrl}${name}`;
}

export interface AnimationOptions {
  image: ex.ImageSource;
  numberOfImages: number;
  scale?: number;
  flippedHorizontal?: boolean;
  flippedVertical?: boolean;
  animationStrategy?: ex.AnimationStrategy;
}

export interface AnimatedActorOptions extends AnimationOptions {
  x?: number;
  y?: number;
  radius?: number;
}

export function createAnimation({
  image,
  numberOfImages,
  scale,
  flippedHorizontal,
  flippedVertical,
  animationStrategy,
}: AnimationOptions): ex.Animation {
  const imageSource = ex.SpriteSheet.fromImageSource({
    image: image,
    grid: {
      rows: 1,
      columns: numberOfImages,
      spriteWidth: image.width / numberOfImages,
      spriteHeight: image.height,
    },
  });
  const animation = ex.Animation.fromSpriteSheet(
    imageSource,
    ex.range(0, numberOfImages - 1),
    50,
    animationStrategy ?? ex.AnimationStrategy.Loop
  );
  if (scale) {
    animation.scale = new ex.Vector(scale, scale);
    animation.flipHorizontal = flippedHorizontal;
    animation.flipVertical = flippedVertical;
  }

  return animation;
}

export function createCircleActor(options: AnimatedActorOptions) {
  const radius = (options.radius ?? 1) * (options.scale ?? 1);
  const actor = new ex.Actor({
    pos: ex.vec(options.x ?? 0, options.y ?? 0),
    radius,
  });
  actor.body.collisionType = ex.CollisionType.Passive;
  actor.graphics.use(
    new ex.Circle({
      radius,
      strokeColor: ex.Color.Red,
      color: ex.Color.Transparent,
    })
  );
  return actor;
}

export function createAnimatedActor(options: AnimatedActorOptions): ex.Actor {
  const animation = createAnimation(options);
  return createActorWithAnimation(animation, options);
}

export function createActorWithAnimation(animation: ex.Animation, options: AnimatedActorOptions): ex.Actor {
  const actor = new ex.Actor({
    pos: ex.vec(options.x ?? 0, options.y ?? 0),
    radius: (options.radius ?? 1) * (options.scale ?? 1),
  });
  actor.body.collisionType = ex.CollisionType.Passive;
  actor.graphics.use(animation);
  return actor;
}

export function createActorWithImage(x: number, y: number, image: ex.ImageSource, scale: number = 0.25, radius: number = 100) {
  const actor = new ex.Actor({
    pos: ex.vec(x, y),
    scale: ex.vec(scale, scale),
    radius
  });
  actor.graphics.use(image.toSprite());
  return actor;
}

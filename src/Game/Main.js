import { Application, Assets, Sprite, Text, TextStyle } from 'pixi.js';

let appInitialized = false;

const Main = async () => {

    if (appInitialized) return;
    appInitialized = true;
  const app = new Application();

  await app.init({ resizeTo: window });
  document.body.appendChild(app.canvas);

  const bgTexture = await Assets.load('/Sprite/BlueSpace.png');
  const bg = new Sprite(bgTexture);
  bg.width = app.screen.width;
  bg.height = app.screen.height;
  app.stage.addChild(bg);

  const spaceshipTexture = await Assets.load('/Sprite/Spaceship.png');

  await Assets.load([
    '/Sprite/Asteroid-1.png',
    '/Sprite/Asteroid-2.png',
    '/Sprite/Asteroid-3.png',
    '/Sprite/Asteroid-4.png',
    '/Sprite/Asteroid-5.png',
  ]);

  const spaceship = new Sprite(spaceshipTexture);
  spaceship.anchor.set(0.5);
  spaceship.x = app.screen.width / 2;
  spaceship.y = app.screen.height / 2;
  app.stage.addChild(spaceship);

  const speed = 3.5;
  let score = 0;

  const scoreStyle = new TextStyle({
    fontSize: 36,
    fill: '#ffffff',
    fontWeight: 'bold',
  });

  const scoreText = new Text('Score: 0', scoreStyle);
  scoreText.x = 20;
  scoreText.y = 20;
  app.stage.addChild(scoreText);

  let moveUp = false;
  let moveDown = false;
  let moveLeft = false;
  let moveRight = false;

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') {
      moveUp = true;
    }
    if (e.key === 'ArrowDown' || e.key === 's') {
      moveDown = true;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      moveLeft = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
      moveRight = true;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') {
      moveUp = false;
    }
    if (e.key === 'ArrowDown' || e.key === 's') {
      moveDown = false;
    }
    if (e.key === 'ArrowLeft' || e.key === 'a') {
      moveLeft = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
      moveRight = false;
    }
  });

  const getRandomPosition = () => {
    let x, y;
    do {
      x = Math.random() * app.screen.width;
      y = Math.random() * app.screen.height;
    } while (Math.sqrt(Math.pow(x - spaceship.x, 2) + Math.pow(y - spaceship.y, 2)) < 100);

    return { x, y };
  };

  const getRandomVelocity = () => {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 1 + 1;
    return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
  };

  const checkCollision = (asteroid) => {
    const distance = Math.sqrt(
      Math.pow(asteroid.x - spaceship.x, 2) + Math.pow(asteroid.y - spaceship.y, 2)
    );
    const collisionDistance = 40 + 30;

    if (distance < collisionDistance) {
      return true;
    }
    return false;
  };

  const createAsteroid = async () => {
    const position = getRandomPosition();
    const asteroidTexture = await Assets.load(`/Sprite/Asteroid-${Math.floor(Math.random() * 5) + 1}.png`);
    const asteroid = new Sprite(asteroidTexture);

    asteroid.x = position.x;
    asteroid.y = position.y;
    asteroid.velocity = getRandomVelocity();

    app.stage.addChild(asteroid);
    return asteroid;
  };

  const asteroidSprites = [];
  const asteroidCount = 5;

  for (let i = 0; i < asteroidCount; i++) {
    const asteroid = await createAsteroid();
    asteroidSprites.push(asteroid);
  }

  const missiles = [];
  const missileTexture = await Assets.load('/Sprite/Missiles1.png');

  const launchMissile = () => {
    const missile = new Sprite(missileTexture);
    missile.anchor.set(0.5);
    missile.x = spaceship.x;
    missile.y = spaceship.y - spaceship.height / 2;
    missile.velocity = { x: 0, y: -10 };

    missiles.push(missile);
    app.stage.addChild(missile);
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      launchMissile();
    }
  });

  const checkMissileCollision = (missile) => {
    asteroidSprites.forEach((asteroid, index) => {
      const distance = Math.sqrt(
        Math.pow(missile.x - asteroid.x, 2) + Math.pow(missile.y - asteroid.y, 2)
      );
      const collisionDistance = missile.width / 2 + asteroid.width / 2;

      if (distance < collisionDistance) {
        asteroidSprites.splice(index, 1);
        app.stage.removeChild(asteroid);
        missiles.splice(missiles.indexOf(missile), 1);
        app.stage.removeChild(missile);

        score += 1;
        scoreText.text = `Score: ${score}`;

        createAsteroid().then((newAsteroid) => {
          asteroidSprites.push(newAsteroid);
        });
      }
    });
  };

  app.ticker.add(() => {
    if (moveUp) spaceship.y -= speed;
    if (moveDown) spaceship.y += speed;
    if (moveLeft) spaceship.x -= speed;
    if (moveRight) spaceship.x += speed;

    spaceship.x = Math.max(0, Math.min(spaceship.x, app.screen.width));
    spaceship.y = Math.max(0, Math.min(spaceship.y, app.screen.height));

    asteroidSprites.forEach((asteroid) => {
      asteroid.x += asteroid.velocity.x;
      asteroid.y += asteroid.velocity.y;

      if (asteroid.x < 0) asteroid.x = app.screen.width;
      if (asteroid.x > app.screen.width) asteroid.x = 0;
      if (asteroid.y < 0) asteroid.y = app.screen.height;
      if (asteroid.y > app.screen.height) asteroid.y = 0;

      if (checkCollision(asteroid)) {
        spaceship.x = app.screen.width / 2;
        spaceship.y = app.screen.height / 2;
      }
    });

    missiles.forEach((missile) => {
      missile.y += missile.velocity.y;

      if (missile.y < 0) {
        missiles.splice(missiles.indexOf(missile), 1);
        app.stage.removeChild(missile);
      }

      checkMissileCollision(missile);
    });
  });

  return app;
};

export default Main;

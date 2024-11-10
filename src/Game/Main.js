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
  const spaceshipMoveTexture = await Assets.load('/Sprite/Spaceship-Move.png');
  const enemyLeftTexture = await Assets.load('/Sprite/enemy-left.png');
  const enemyRightTexture = await Assets.load('/Sprite/enemy-right.png');

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
  spaceship.y = app.screen.height / 1.2;
  app.stage.addChild(spaceship);

  const speed = 3.5;
  let score = 0;
  let isMoving = false;

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

  const updateTexture = () => {
    if (moveUp || moveDown || moveLeft || moveRight) {
      if (!isMoving) {
        spaceship.texture = spaceshipMoveTexture;
        isMoving = true;
      }
    } else {
      if (isMoving) {
        spaceship.texture = spaceshipTexture;
        isMoving = false;
      }
    }
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && missiles.length < 10) {launchMissile();}
    if (e.key === 'ArrowUp' || e.key === 'w') moveUp = true;
    if (e.key === 'ArrowDown' || e.key === 's') moveDown = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd') moveRight = true;
    updateTexture();
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w') moveUp = false;
    if (e.key === 'ArrowDown' || e.key === 's') moveDown = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
    updateTexture();
  });

  const getRandomPositionOutsideScreen = () => {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch (side) {
      case 0: x = -50; y = Math.random() * app.screen.height; break;
      case 1: x = app.screen.width + 50; y = Math.random() * app.screen.height; break;
      case 2: x = Math.random() * app.screen.width; y = -50; break;
      case 3: x = Math.random() * app.screen.width; y = app.screen.height + 50; break;
      default: x = app.screen.width / 2; y = app.screen.height / 2;
    }
    return { x, y };
  };

  const getRandomVelocity = () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 1 + 1;
    return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
  };

  const createAsteroid = async () => {
    if (asteroidSprites.length >= 25) return;
    const position = getRandomPositionOutsideScreen();
    const asteroidTexture = await Assets.load(`/Sprite/Asteroid-${Math.floor(Math.random() * 5) + 1}.png`);
    const asteroid = new Sprite(asteroidTexture);
    asteroid.x = position.x;
    asteroid.y = position.y;
    asteroid.velocity = getRandomVelocity();
    app.stage.addChild(asteroid);
    asteroidSprites.push(asteroid);
  };

  const asteroidSprites = [];
  const initialAsteroidCount = 15;

  for (let i = 0; i < initialAsteroidCount; i++) {
    await createAsteroid();
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

  

  const createEnemy = () => {
    const isLeft = Math.random() < 0.5;
    const enemyTexture = isLeft ? enemyLeftTexture : enemyRightTexture;
    const enemy = new Sprite(enemyTexture);
    enemy.anchor.set(0.5);
    enemy.y = Math.random() * (app.screen.height * 0.25);
    enemy.x = isLeft ? -50 : app.screen.width + 50;
    enemy.velocity = isLeft ? 2 : -2;
    app.stage.addChild(enemy);
    enemySprites.push(enemy);
  };

  const enemySprites = [];
  const initialEnemyCount = 3;

  for (let i = 0; i < initialEnemyCount; i++) {
    createEnemy();
  }

  const checkMissileCollision = (missile) => {
    enemySprites.forEach((enemy, index) => {
      const distance = Math.sqrt(
        Math.pow(missile.x - enemy.x, 2) + Math.pow(missile.y - enemy.y, 2)
      );
      const collisionDistance = missile.width / 2 + enemy.width / 2;
      if (distance < collisionDistance) {
        app.stage.removeChild(enemy);
        enemySprites.splice(index, 1);

        score += 1;
        scoreText.text = `Score: ${score}`;

        createEnemy();

        missile.y = -9999;
      }
    });

    asteroidSprites.forEach((asteroid, index) => {
      const distance = Math.sqrt(
        Math.pow(missile.x - asteroid.x, 2) + Math.pow(missile.y - asteroid.y, 2)
      );
      const collisionDistance = missile.width / 2 + asteroid.width / 4; 
      if (distance < collisionDistance) {
        missile.y = -9999;  
      }
    });
  };
  

  const checkAsteroidCollision = () => {
    asteroidSprites.forEach((asteroid) => {
      const distance = Math.sqrt(
        Math.pow(spaceship.x - asteroid.x, 2) + Math.pow(spaceship.y - asteroid.y, 2)
      );
      const collisionDistance = spaceship.width / 2 + asteroid.width / 4;
      if (distance < collisionDistance) {
        app.stage.removeChild(spaceship);

      }
    });
  };

  const checkEnemyCollision = () => {
    enemySprites.forEach((enemy) => {
      const distance = Math.sqrt(
        Math.pow(spaceship.x - enemy.x, 2) + Math.pow(spaceship.y - enemy.y, 2)
      );
      const collisionDistance = spaceship.width / 2 + enemy.width / 2;
      if (distance < collisionDistance) {
        app.stage.removeChild(spaceship);
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

    asteroidSprites.forEach((asteroid, index) => {
      asteroid.x += asteroid.velocity.x;
      asteroid.y += asteroid.velocity.y;
      if (
        asteroid.x < -50 || asteroid.x > app.screen.width + 50 ||
        asteroid.y < -50 || asteroid.y > app.screen.height + 50
      ) {
        app.stage.removeChild(asteroid);
        asteroidSprites.splice(index, 1);
        createAsteroid();
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
    //checkAsteroidCollision()
    //checkEnemyCollision()
    enemySprites.forEach((enemy) => {
      enemy.x += enemy.velocity;
      if (enemy.x < -50 || enemy.x > app.screen.width + 50) {
        app.stage.removeChild(enemy);
        enemySprites.splice(enemySprites.indexOf(enemy), 1);
        createEnemy();
      }
    });
  });

  return app;
};

export default Main;

import { Application, Assets, Sprite, Text, TextStyle, Graphics } from 'pixi.js';

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

  const playButton = new Graphics();
  playButton.beginFill(0x0000ff);
  playButton.drawRect(app.screen.width / 2 - 50, app.screen.height / 2 - 25, 100, 50);
  playButton.endFill();
  app.stage.addChild(playButton);

  const buttonText = new Text('Play', { fontSize: 24, fill: '#ffffff' });
  buttonText.anchor.set(0.5);
  buttonText.x = app.screen.width / 2;
  buttonText.y = app.screen.height / 2;
  app.stage.addChild(buttonText);

  const gameOverButton = new Graphics();
  gameOverButton.beginFill(0xff0000);
  gameOverButton.drawRect(app.screen.width / 2 - 50, app.screen.height / 2 - 25, 100, 50);
  gameOverButton.endFill();
  gameOverButton.visible = false;
  app.stage.addChild(gameOverButton);

  const gameOverText = new Text('Game Over\nTry Again', { fontSize: 18, fill: '#ffffff', align: 'center' });
  gameOverText.anchor.set(0.5);
  gameOverText.x = app.screen.width / 2;
  gameOverText.y = app.screen.height / 2;
  gameOverText.visible = false;
  app.stage.addChild(gameOverText);

  const spaceshipTexture = await Assets.load('/Sprite/spaceship.png');
  const spaceshipUpTexture = await Assets.load('/Sprite/spaceship-up.png');
  const spaceshipBackTexture = await Assets.load('/Sprite/spaceship-back.png');
  const spaceshipLeftTexture = await Assets.load('/Sprite/spaceship-left.png');
  const spaceshipRightTexture = await Assets.load('/Sprite/spaceship-right.png');
  const spaceshipRightUpTexture = await Assets.load('/Sprite/spaceship-right-up.png');
  const spaceshipLeftUpTexture = await Assets.load('/Sprite/spaceship-left-up.png');

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
  spaceship.scale.set(0.3);
  app.stage.addChild(spaceship);

  const speed = 3.5;
  let gameStarted = false;
  let score = 0;
  let isMoving = false;

  const asteroidSprites = [];
  const enemySprites = [];
  const missiles = [];
  const initialAsteroidCount = 15;
  const initialEnemyCount = 3;

  const scoreStyle = new TextStyle({
    fontSize: 36,
    fill: '#ffffff',
    fontWeight: 'bold',
  });
  const scoreText = new Text('Score: 0', scoreStyle);
  scoreText.x = 20;
  scoreText.y = 20;

  let moveUp = false;
  let moveDown = false;
  let moveLeft = false;
  let moveRight = false;

  const updateTexture = () => {
    if (moveUp && moveRight) {
      if (!isMoving || spaceship.texture !== spaceshipRightUpTexture) {
        spaceship.texture = spaceshipRightUpTexture;
        isMoving = true;
      }
    } else if (moveUp && moveLeft) {
      if (!isMoving || spaceship.texture !== spaceshipLeftUpTexture) {
        spaceship.texture = spaceshipLeftUpTexture;
        isMoving = true;
      }
    } else if (moveUp) {
      if (!isMoving || spaceship.texture !== spaceshipUpTexture) {
        spaceship.texture = spaceshipUpTexture;
        isMoving = true;
      }
    } else if (moveDown) {
      if (!isMoving || spaceship.texture !== spaceshipBackTexture) {
        spaceship.texture = spaceshipBackTexture;
        isMoving = true;
      }
    } else if (moveLeft) {
      if (!isMoving || spaceship.texture !== spaceshipLeftTexture) {
        spaceship.texture = spaceshipLeftTexture;
        isMoving = true;
      }
    } else if (moveRight) {
      if (!isMoving || spaceship.texture !== spaceshipRightTexture) {
        spaceship.texture = spaceshipRightTexture;
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
    if (!gameStarted) return;
    if (e.key === ' ' && missiles.length < 10) launchMissile();
    if (e.key === 'ArrowUp' || e.key === 'w') moveUp = true;
    if (e.key === 'ArrowDown' || e.key === 's') moveDown = true;
    if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd') moveRight = true;
    updateTexture();
  });

  window.addEventListener('keyup', (e) => {
    if (!gameStarted) return;
    if (e.key === 'ArrowUp' || e.key === 'w') moveUp = false;
    if (e.key === 'ArrowDown' || e.key === 's') moveDown = false;
    if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
    updateTexture();
  });

  const startGame = () => {
    app.stage.removeChild(playButton);
    app.stage.removeChild(buttonText);
    app.stage.addChild(scoreText);
    app.stage.addChild(spaceship);
    for (let i = 0; i < initialAsteroidCount; i++) createAsteroid();
    for (let i = 0; i < initialEnemyCount; i++) createEnemy();
    gameStarted = true;
  };

  const resetGame = () => {
    gameOverButton.visible = false;
    gameOverText.visible = false;
    score = 0;
    scoreText.text = `Score: ${score}`;
  
    spaceship.x = app.screen.width / 2;
    spaceship.y = app.screen.height / 1.2;
    spaceship.texture = spaceshipTexture;
    moveUp = false;
    moveDown = false;
    moveLeft = false;
    moveRight = false;
  
    asteroidSprites.forEach((asteroid) => app.stage.removeChild(asteroid));
    enemySprites.forEach((enemy) => app.stage.removeChild(enemy));
    missiles.forEach((missile) => app.stage.removeChild(missile));
  
    asteroidSprites.length = 0;
    enemySprites.length = 0;
    missiles.length = 0;
  
    app.stage.addChild(scoreText);
    for (let i = 0; i < initialAsteroidCount; i++) createAsteroid();
    for (let i = 0; i < initialEnemyCount; i++) createEnemy();
  
    gameStarted = true;
  };
  const endGame = () => {
    gameStarted = false;
    app.stage.removeChild(scoreText);
    asteroidSprites.forEach((asteroid) => app.stage.removeChild(asteroid));
    enemySprites.forEach((enemy) => app.stage.removeChild(enemy));
    missiles.forEach((missile) => app.stage.removeChild(missile));
    asteroidSprites.length = 0;
    enemySprites.length = 0;
    missiles.length = 0;
    gameOverButton.visible = true;
    gameOverText.visible = true;
  };

  playButton.interactive = true;
  playButton.buttonMode = true;
  playButton.on('pointerdown', startGame);

  gameOverButton.interactive = true;
  gameOverButton.buttonMode = true;
  gameOverButton.on('pointerdown', resetGame);


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

  for (let i = 0; i < initialEnemyCount; i++) {
    createEnemy();
  }


 const missileTexture = await Assets.load('/Sprite/Missiles1.png');

  const launchMissile = () => {
    const missile = new Sprite(missileTexture);
    missile.anchor.set(0.6);
    missile.x = spaceship.x;
    missile.y = spaceship.y - spaceship.height / 7;
    missile.velocity = { x: 0, y: -3 };
    missiles.push(missile);
    app.stage.addChild(missile);
  };


  const checkMissileCollision = (missile) => {
    enemySprites.forEach((enemy, index) => {
      const distance = Math.sqrt(
        Math.pow(missile.x - enemy.x, 2) + Math.pow(missile.y - enemy.y, 2)
      );
      const radiusMissile = missile.texture.width / 7;
      const radiusEnemy = enemy.texture.width / 6;
      const collisionDistance = radiusMissile + radiusEnemy;
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
      const radiusMissile = missile.texture.width / 5;
      const radiusAsteroid = asteroid.texture.width / 5;
      const collisionDistance = radiusMissile + radiusAsteroid;
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
      const collisionDistance = spaceship.width / 7 + asteroid.width / 7;
      if (distance < collisionDistance) {
        endGame(); 
      }
    });
  };

  const checkEnemyCollision = () => {
    enemySprites.forEach((enemy) => {
      const distance = Math.sqrt(
        Math.pow(spaceship.x - enemy.x, 2) + Math.pow(spaceship.y - enemy.y, 2)
      );
      const collisionDistance = spaceship.width / 7 + enemy.width / 7;
      if (distance < collisionDistance) {
        endGame(); 
      }
    });
  };

  app.ticker.add(() => {
    if (!gameStarted) return;
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
    checkAsteroidCollision()
    checkEnemyCollision()
    enemySprites.forEach((enemy) => {
      enemy.x += enemy.velocity;
      if (enemy.x < -50 || enemy.x > app.screen.width + 50) {
        app.stage.removeChild(enemy);
        enemySprites.splice(enemySprites.indexOf(enemy), 1);
        createEnemy();
      }
    });
  });
};

export default Main;

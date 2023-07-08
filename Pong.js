// "LogIn", Multiplayer (Sockets), 5 Unit Tests

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5;
const maxPaddleY = canvas.height - grid - paddleHeight;
var paddleSpeed = 6;
var ballSpeed = 5;

const ws = new WebSocket("ws://localhost:8082");

ws.addEventListener("open", () => {

  console.log("wir sind conecnte");

})

const leftPaddle = {
    
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

// Geschwindigkeit vom Torwart
  velocitY: 0
};
const rightPaddle = {

  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

// Geschwindigkeit vom Torwart
  velocitY: 0
};
const ball = {
// Spawnt in der Mitte vom Spielfeld
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

// Schaut wann Ball resetet werden muss
  reset: false,

// Geschwindigkeit vom Ball
  velocityX: ballSpeed,
  velocitY: -ballSpeed
};

// Boundigbox für Kollision zwischen Objekten
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

// Spiel Ablauf
function game() {
  requestAnimationFrame(game);
  context.clearRect(0,0,canvas.width,canvas.height);

// Torwärter werden bewegt
  leftPaddle.y += leftPaddle.velocitY;
  rightPaddle.y += rightPaddle.velocitY;

  ws.send(rightPaddle.y);

// Damit Torwärter nicht durch Wände glitchen
  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

// Torwärter zeichnen
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

// Ball bewegt sich
  ball.x += ball.velocityX;
  ball.y += ball.velocitY;

// Ball soll auch nicht durch Wände glitchen
  if (ball.y < grid) {
    ball.y = grid;
    ball.velocitY *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.velocitY *= -1;
  }

// Wenn Ball im Tor landet wird er resetet
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.reset) {
    ball.reset = true;

    setTimeout(() => { // Kurz Zeit bevor Ball spawnt
      ball.reset = false;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

// Wenn Ball mit Torwart kollidiert wird Geschwindigkeit geändert
  if (collides(ball, leftPaddle)) {
    ball.velocityX *= -1;

// Ball soll nicht nochmal kollidieren
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
    ball.velocityX *= -1;
    ball.x = rightPaddle.x - ball.width;
  }

// Spielfeld zeichnen (Ball, Linien und Torwärter)
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

//Steuerung
document.addEventListener('keydown', function(e) {

//SPIELER 1
// Pfeiltaste hoch
  if (e.which === 38) { //e.wich speichert was rein kommt (zb Keypressed) e=event also welcher Key wurde gedrückt
    rightPaddle.velocitY = -paddleSpeed;
  }
// Pfeiltaste runter
  else if (e.which === 40) {
    rightPaddle.velocitY = paddleSpeed;
  }

//SPIELER 2
// W
  if (e.which === 87) {
    leftPaddle.velocitY = -paddleSpeed;
  }
// A
  else if (e.which === 83) {
    leftPaddle.velocitY = paddleSpeed;
  }
});

// Bewegung stoppen wenn Taste loslassen
document.addEventListener('keyup', function(e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.velocitY = 0;
  }

  if (e.which === 83 || e.which === 87) {
    leftPaddle.velocitY = 0;
  }
});

// SPIEL START
requestAnimationFrame(game);
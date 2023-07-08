// "LogIn", Multiplayer (Sockets), 5 Unit Tests
import { width, height, grid, paddleHeight, paddleSpeed, maxPaddleY } from "./Konstantin.js";

const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

const ws = new WebSocket("ws://localhost:8082");

ws.addEventListener("open", () => {

  console.log("wir sind connected");

})

ws.addEventListener("message",function message(data, isBinary) {
  
  const message = isBinary ? data : data.data.toString();

  let foo = JSON.parse(message);
  ball = foo.ball;

//  leftPaddle.y = message;
});

let ball = {
// Spawnt in der Mitte vom Spielfeld
  x: width / 2,
  y: height / 2,
  width: grid,
  height: grid,
};

const rightPaddle = {
    
  x: grid * 2,
  y: height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

// Geschwindigkeit vom Torwart
  velocitY: 0
};
const leftPaddle = {

  x: width - grid * 3,
  y: height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

// Geschwindigkeit vom Torwart
  velocitY: 0
};

// Spiel Ablauf
function game() {
  requestAnimationFrame(game);
  context.clearRect(0,0,width,height);

// Torwärter werden bewegt
  rightPaddle.y += rightPaddle.velocitY;

  ws.send(rightPaddle.y); //

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



// Spielfeld zeichnen (Ball, Linien und Torwärter)
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, width, grid);
  context.fillRect(0, height - grid, width, height);

  for (let i = grid; i < height - grid; i += grid * 2) {
    context.fillRect(width / 2 - grid / 2, i, grid, grid);
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
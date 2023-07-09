import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

import { Server } from 'socket.io'
import http from 'http';
const server = http.createServer(app);

const wss = new Server(server);
//const wss = new WebSocketServer ({ port: port })

app.use(express.static('static'));

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

import { width, height, grid, paddleHeight } from "./static/Konstantin.js";

var ballSpeed = -4;

let paddle1 = {
    
  x: grid * 2,
  y: height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

// Geschwindigkeit vom Torwart
  velocitY: 0
};
let paddle2 = {

  x: width - grid * 3,
  y: height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

// Geschwindigkeit vom Torwart
  velocitY: 0
};

const ball = {
  // Spawnt in der Mitte vom Spielfeld
    x: width / 2,
    y: height / 2,
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

let id = 1
let player1;
let player2;

wss.on("connection", ws => {

  console.log("Client ist connected");

  if (id == 1) {
    player1 = ws;
    ws.emit('id', id);
    id++;
  } else {
    player2 = ws;
    ws.emit('id', id);
    id--;
  }

  ws.on("playerUpdate",  function message(data, isBinary) {
    const message = isBinary ? data : data.toString();

    let parsed = JSON.parse(message);

    if (parsed.id == 1) {
      paddle1.y = parsed.paddle.y;
    } else {
      paddle2.y = parsed.paddle.y;
    }

  })

  ws.on("close", function close(code, data) {
    
    const reason = data.toString();
    console.log("Client hat disconnected");

  })

})

setInterval(() => {
  if (player1 != null && player2 != null) {
  
  // Ball bewegt sich
  ball.x += ball.velocityX;
  ball.y += ball.velocitY;

  // Schicke Link
  player1.emit('gameStateUpdate', JSON.stringify({
    ball: ball,
    id: 1,
    paddle: paddle2
  }));
  player2.emit('gameStateUpdate', JSON.stringify({
    ball: ball,
    id: 2,
    paddle: paddle1
  }));

  // Ball soll auch nicht durch Wände glitchen
  if (ball.y < grid) {
    ball.y = grid;
    ball.velocitY *= -1;
  }
  else if (ball.y + grid > height - grid) {
    ball.y = height - grid * 2;
    ball.velocitY *= -1;
  }

  // Wenn Ball mit Torwart kollidiert wird Geschwindigkeit geändert
  if (collides(ball, paddle1)) {
    ball.velocityX *= -1;

// Ball soll nicht nochmal kollidieren
    ball.x = paddle1.x + paddle1.width;
  }
  else if (collides(ball, paddle2)) {
    ball.velocityX *= -1;
    ball.x = paddle2.x - ball.width;
  }

// Wenn Ball im Tor landet wird er resetet
  if ( (ball.x < 0 || ball.x > width) && !ball.reset) {
    ball.reset = true;

    setTimeout(() => { // Kurz Zeit bevor Ball spawnt
      ball.reset = false;
      ball.x = width / 2;
      ball.y = height / 2;
    }, 400);
  } 
}
}, 16);
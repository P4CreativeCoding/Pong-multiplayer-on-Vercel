import express from 'express';
const app = express();
const port = process.env.PORT || 3000;

import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer ({ port: 8082 })

app.use(express.static('static'));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

import { width, height, grid, paddleHeight } from "./static/Konstantin.js";

var ballSpeed = -4;

const paddle1 = {
    
  x: grid * 2,
  y: height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

// Geschwindigkeit vom Torwart
  velocitY: 0
};
const paddle2 = {

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

wss.on("connection", ws => {

  console.log("Client ist connected");

  ws.on("message",  function message(data, isBinary) {
    const message = isBinary ? data : data.toString();

    paddle1.y = message;

  })

  setInterval(() => {
    // Ball bewegt sich
    ball.x += ball.velocityX;
    ball.y += ball.velocitY;
    
    // Schicke Link
    ws.send(JSON.stringify({
      ball: ball,
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
  
      // Transfer to generic js
      setTimeout(() => { // Kurz Zeit bevor Ball spawnt
        ball.reset = false;
        ball.x = width / 2;
        ball.y = height / 2;
      }, 400);
    }
  }, 16);

  ws.on("close", function close(code, data) {
    
    const reason = data.toString();
    console.log("Client hat disconnected");

  })

})
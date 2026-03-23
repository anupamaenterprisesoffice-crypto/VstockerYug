// 🔥 FIREBASE CONFIG (YOURS)
const firebaseConfig = {
  apiKey: "AIzaSyBgaIaZQtCnYvVnDJ9WSGjAdJ25gJBVSew",
  authDomain: "chefystudios.firebaseapp.com",
  databaseURL: "https://chefystudios-default-rtdb.firebaseio.com",
  projectId: "chefystudios",
  storageBucket: "chefystudios.firebasestorage.app",
  messagingSenderId: "395216155245",
  appId: "1:395216155245:web:bdea945b4ad03363db0564",
  measurementId: "G-F1LDEZ2S5B"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 💰 BALANCE
let balance = 100;

function updateBalanceUI() {
  document.getElementById("balance").innerText = balance;
}

// 🔐 LOGIN (simple)
function login() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
}

// 🏀 GAME
let canvas, ctx, ball, hoop, velocity, gravity;

function startBasketballGame() {
  canvas = document.getElementById("basketballCanvas");
  ctx = canvas.getContext("2d");

  if (balance < 40) {
    alert("Not enough balance!");
    return;
  }

  balance -= 40;
  updateBalanceUI();

  canvas.style.display = "block";

  ball = { x: 150, y: 300, r: 10 };
  hoop = { x: 200, y: 120, w: 60 };
  velocity = { x: 0, y: 0 };
  gravity = 0.4;

  canvas.onmousedown = (e) => {
    startX = e.offsetX;
    startY = e.offsetY;
  };

  canvas.onmouseup = (e) => {
    velocity.x = (e.offsetX - startX) * 0.15;
    velocity.y = (e.offsetY - startY) * 0.15;
  };

  draw();
}

let startX, startY;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ball.x += velocity.x;
  ball.y += velocity.y;
  velocity.y += gravity;

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "orange";
  ctx.fill();

  // Hoop
  ctx.fillStyle = "red";
  ctx.fillRect(hoop.x, hoop.y, hoop.w, 5);

  // Score
  if (
    ball.x > hoop.x &&
    ball.x < hoop.x + hoop.w &&
    ball.y > hoop.y &&
    ball.y < hoop.y + 5
  ) {
    document.getElementById("basketStatus").innerText = "🎉 Score!";
    balance += 80;
    updateBalanceUI();
    return;
  }

  // Miss
  if (ball.y > canvas.height) {
    document.getElementById("basketStatus").innerText = "❌ Miss!";
    return;
  }

  requestAnimationFrame(draw);
}

// INIT
updateBalanceUI();

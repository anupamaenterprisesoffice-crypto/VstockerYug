//  SOUND
const clickSound=new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
const successSound=new Audio("https://assets.mixkit.co/active_storage/sfx/1438/1438-preview.mp3");

// FIREBASE
const firebaseConfig={
    apiKey:"AIzaSyApLpqXTnuPsT5rdDG04jLMlW-a0ERkbpM",
    authDomain:"stockgameultra.firebaseapp.com",
    databaseURL:"https://stockgameultra-default-rtdb.firebaseio.com",
    projectId:"stockgameultra"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.database();

let currentUser, price=100, candles=[];

// LOGIN
function login(){
    clickSound.play();
    let u=username.value, p=password.value;
    if(!u||!p) return alert("Enter");

    let ref=db.ref("users/"+u);

    ref.once("value").then(s=>{
        if(s.exists() && s.val().banned) return alert("Banned");

        if(!s.exists()){
            ref.set({password:p,balance:10000,stocks:0,bank:0});
        } else if(s.val().password!==p){
            return alert("Wrong");
        }

        currentUser=u;

        if((u==="Virat"&&p==="1234")||(u==="Krushnarajsinh"&&p==="4231")){
            ref.update({balance:99999999999999999999999999999999999});
            adminBtn.style.display="flex";
        }

        loginPage.style.display="none";
        app.style.display="block";
        successSound.play();

        listenUser();
        startMarket();
    });
}

// USER listen
function listenUser(){
    db.ref("users/"+currentUser).on("value", s=>{
        let d=s.val();
        balance.innerText = d.balance + " Lot £";
        bank.innerText = "Bank: " + d.bank;
    });
}

// MARKET
function startMarket(){
    setInterval(()=>{
        let o = price;
        let c = price + (Math.random()-0.5)*10;
        let h = Math.max(o,c)+5;
        let l = Math.min(o,c)-5;
        price = Math.round(c);

        candles.push({o,c,h,l});
        if(candles.length>20) candles.shift();

        priceEl.innerText="£"+price;
        drawChart();
    }, 1000);
}

const priceEl=document.getElementById("price");

// CHART
function drawChart(){
    let ctx = chart.getContext("2d");
    ctx.clearRect(0,0,300,150);
    candles.forEach((c,i)=>{
        let x=i*12;
        let color=c.c>c.o?"lime":"red";

        ctx.strokeStyle=color;
        ctx.beginPath();
        ctx.moveTo(x,150-c.h);
        ctx.lineTo(x,150-c.l);
        ctx.stroke();

        ctx.fillStyle=color;
        ctx.fillRect(x-2,150-c.o,4,c.o-c.c);
    });
}

// CHAT
function sendChat(){
    clickSound.play();
    let msg = chatInput.value;
    if(!msg) return;

    db.ref("chat").push({user:currentUser,text:msg});
    chatInput.value="";
    successSound.play();
}

db.ref("chat").limitToLast(20).on("value", snap=>{
    let html="";
    snap.forEach(s=>{
        let d=s.val();
        html+=`<p><b>${d.user}:</b> ${d.text}</p>`;
    });
    chatBox.innerHTML = html;
});

// LEADERBOARD
db.ref("users").on("value", snap=>{
    let arr=[];
    snap.forEach(s=>{
        arr.push({name:s.key,balance:s.val().balance||0});
    });
    arr.sort((a,b)=>b.balance - a.balance);
    let html="";
    arr.slice(0,10).forEach((u,i)=>{
        html+=`<p>#${i+1} ${u.name} - ${u.balance} Lot £</p>`;
    });
    leaderboard.innerHTML = html;
});

// DELETE
function confirmDelete(){
    if(!confirm("Are you sure?")) return;
    if(!confirm("Final warning")) return;

    db.ref("users/"+currentUser).remove().then(()=>{
        alert("Deleted");
        location.reload();
    });
}

// ADMIN
window.onload = () => {
    const adminBtn = document.getElementById("adminBtn");
    const adminPanel = document.getElementById("adminPanel");

    // Show admin panel when crown button clicked
    adminBtn.onclick = () => {
        adminPanel.style.display = "block";
    }
}
function closeAdmin(){ adminPanel.style.display="none"; }

function banUser(){
    let t = adminUser.value;
    if(currentUser==="YUG1ADMIN" && t==="Virat")
        return alert("Cannot ban Virat");
    db.ref("users/"+t).update({banned:true});
}

function giveMoney(){
    let t = adminUser.value;
    db.ref("users/"+t).once("value").then(s=>{
        db.ref("users/"+t).update({balance:s.val().balance+1000000});
    });
}

const companies = ["GOOGL","AAPL","MSFT","AMZN","TSLA"];
let stockData = {};

companies.forEach(c => {
  stockData[c] = {
    price: Math.round(Math.random() * 500 + 50),
    candles: []
  };
});

function updateStocks() {
  companies.forEach(c => {
    let data = stockData[c];
    let o = data.price;
    let cPrice = o + (Math.random() - 0.5) * 10;
    let h = Math.max(o, cPrice) + 5;
    let l = Math.min(o, cPrice) - 5;
    data.price = Math.round(cPrice);

    data.candles.push({o:o, c:cPrice, h:h, l:l});
    if (data.candles.length > 20) data.candles.shift();

    document.getElementById("price-" + c).innerText = "£" + data.price;

    drawChart(c, data.candles);
  });
}

function drawChart(company, candles) {
  let canvas = document.getElementById("chart-" + company);
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  candles.forEach((c, i) => {
    let x = i * 12;
    let color = c.c > c.o ? "lime" : "red";
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, 150 - c.h);
    ctx.lineTo(x, 150 - c.l);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillRect(x - 2, 150 - c.o, 4, c.o - c.c);
  });
}

setInterval(updateStocks, 1000); // update every second
let canvas = document.getElementById("basketballCanvas");
let ctx = canvas.getContext("2d");

let ball, hoop, velocity;
let gravity = 0.4;
let dragging = false;
let startX, startY;
let gameRunning = false;

let score = 0;
let combo = 0;
let multiplier = 1;

let trail = [];

// 🔊 SOUND
let scoreSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
let missSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2958/2958-preview.mp3");

function startBasketballGame() {
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

  score = 0;
  combo = 0;
  multiplier = 1;

  gameRunning = true;
  trail = [];

  document.getElementById("basketStatus").innerText = "🔥 Swipe to shoot!";
  draw();
}

// 🖱️ MOUSE
canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  startX = e.offsetX;
  startY = e.offsetY;
});

canvas.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  dragging = false;

  let dx = e.offsetX - startX;
  let dy = e.offsetY - startY;

  velocity.x = dx * 0.15;
  velocity.y = dy * 0.15;
});

// 📱 TOUCH
canvas.addEventListener("touchstart", (e) => {
  let rect = canvas.getBoundingClientRect();
  startX = e.touches[0].clientX - rect.left;
  startY = e.touches[0].clientY - rect.top;
});

canvas.addEventListener("touchend", (e) => {
  let rect = canvas.getBoundingClientRect();
  let endX = e.changedTouches[0].clientX - rect.left;
  let endY = e.changedTouches[0].clientY - rect.top;

  velocity.x = (endX - startX) * 0.15;
  velocity.y = (endY - startY) * 0.15;
});

function draw() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 🏀 PHYSICS
  ball.x += velocity.x;
  ball.y += velocity.y;
  velocity.y += gravity;
  velocity.x *= 0.99;

  // 🔥 TRAIL
  trail.push({ x: ball.x, y: ball.y });
  if (trail.length > 10) trail.shift();

  trail.forEach((t, i) => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, ball.r * (i / 10), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,100,0,${i / 10})`;
    ctx.fill();
  });

  // 🏀 BALL
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fillStyle = "orange";
  ctx.fill();

  // 🏀 HOOP (rim)
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(hoop.x, hoop.y);
  ctx.lineTo(hoop.x + hoop.w, hoop.y);
  ctx.stroke();

  // 🧵 NET ANIMATION
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(hoop.x + i * 10, hoop.y);
    ctx.lineTo(
      hoop.x + i * 10 + Math.sin(Date.now() / 100) * 3,
      hoop.y + 20
    );
    ctx.strokeStyle = "white";
    ctx.stroke();
  }

  // 🎯 SCORE CHECK
  if (
    ball.x > hoop.x &&
    ball.x < hoop.x + hoop.w &&
    ball.y > hoop.y &&
    ball.y < hoop.y + 5 &&
    velocity.y > 0
  ) {
    scoreSound.play();

    combo++;
    multiplier = 1 + combo * 0.5;

    let reward = Math.floor(80 * multiplier);
    balance += reward;
    updateBalanceUI();

    document.getElementById("basketStatus").innerText =
      `🔥 SCORE! Combo: ${combo} | x${multiplier} | +${reward} £`;

    resetBall();
    return;
  }

  // ❌ MISS
  if (ball.y > canvas.height) {
    missSound.play();
    combo = 0;
    multiplier = 1;

    document.getElementById("basketStatus").innerText =
      "❌ Miss! Combo reset.";

    resetBall();
    return;
  }

  requestAnimationFrame(draw);
}

function resetBall() {
  ball.x = 150;
  ball.y = 300;
  velocity = { x: 0, y: 0 };
  trail = [];
}

// 🔊 SOUND
const clickSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
const successSound = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3");

// FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyApLpqXTnuPsT5rdDG04jLMlW-a0ERkbpM",
  authDomain: "stockgameultra.firebaseapp.com",
  databaseURL: "https://stockgameultra-default-rtdb.firebaseio.com",
  projectId: "stockgameultra"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let currentUser, price = 100, candles = [];

// ✅ LOGIN FIXED
function login(){
  clickSound.play();

  let u = document.getElementById("username").value;
  let p = document.getElementById("password").value;

  if(!u || !p){
    alert("Enter details");
    return;
  }

  let ref = db.ref("users/" + u);

  ref.once("value").then(s=>{
    if(s.exists() && s.val().banned){
      alert("Banned");
      return;
    }

    if(!s.exists()){
      ref.set({ password:p, balance:10000, stocks:0, bank:0 });
    } 
    else if(s.val().password !== p){
      alert("Wrong password");
      return;
    }

    currentUser = u;

    if(
      (u === "Virat" && p === "1234") ||
      (u === "YUG1ADMIN" && p === "4231")
    ){
      ref.update({ balance:999999999 });
      document.getElementById("adminBtn").style.display = "flex";
    }

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("app").style.display = "block";

    successSound.play();

    listenUser();
    startMarket();
  });
}

// 👤 USER
function listenUser(){
  db.ref("users/" + currentUser).on("value", s=>{
    let d = s.val();
    document.getElementById("balance").innerText = d.balance + " Lot £";
    document.getElementById("bank").innerText = "Bank: " + d.bank;
  });
}

// 📊 MARKET
function startMarket(){
  setInterval(()=>{
    let o = price;
    let c = price + (Math.random() - 0.5) * 10;
    let h = Math.max(o, c) + 5;
    let l = Math.min(o, c) - 5;
    price = Math.round(c);

    candles.push({ o, c, h, l });
    if(candles.length > 20) candles.shift();

    document.getElementById("price").innerText = "£" + price;
    drawChart();
  },1000);
}

// 📉 CHART
function drawChart(){
  let ctx = document.getElementById("chart").getContext("2d");
  ctx.clearRect(0,0,300,150);

  candles.forEach((c,i)=>{
    let x = i * 12;
    let color = c.c > c.o ? "lime" : "red";

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x,150-c.h);
    ctx.lineTo(x,150-c.l);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.fillRect(x-2,150-c.o,4,c.o-c.c);
  });
}

// 💹 BUY
function buy(){
  let a = +document.getElementById("tradeAmount").value;

  db.ref("users/" + currentUser).once("value").then(s=>{
    let d = s.val();
    let cost = a * price;

    if(d.balance >= cost){
      db.ref("users/" + currentUser).update({
        balance: d.balance - cost,
        stocks: d.stocks + a
      });
    }
  });
}

// 💹 SELL
function sell(){
  let a = +document.getElementById("tradeAmount").value;

  db.ref("users/" + currentUser).once("value").then(s=>{
    let d = s.val();

    if(d.stocks >= a){
      db.ref("users/" + currentUser).update({
        balance: d.balance + a * price,
        stocks: d.stocks - a
      });
    }
  });
}

// 🏦 DEPOSIT
function deposit(){
  let a = +document.getElementById("bankAmt").value;

  db.ref("users/" + currentUser).once("value").then(s=>{
    let d = s.val();

    if(d.balance >= a){
      db.ref("users/" + currentUser).update({
        balance: d.balance - a,
        bank: d.bank + a
      });
    }
  });
}

// 🏦 WITHDRAW
function withdraw(){
  let a = +document.getElementById("bankAmt").value;

  db.ref("users/" + currentUser).once("value").then(s=>{
    let d = s.val();

    if(d.bank >= a){
      db.ref("users/" + currentUser).update({
        balance: d.balance + a,
        bank: d.bank - a
      });
    }
  });
}

// 💸 SEND MONEY
function sendMoney(){
  let t = document.getElementById("payUser").value;
  let a = +document.getElementById("payAmount").value;

  db.ref("users/" + currentUser).once("value").then(s=>{
    let d = s.val();

    if(d.balance < a) return alert("No money");

    db.ref("users/" + t).once("value").then(r=>{
      if(!r.exists()) return alert("User not found");

      db.ref("users/" + currentUser).update({ balance: d.balance - a });
      db.ref("users/" + t).update({ balance: r.val().balance + a });

      successSound.play();
    });
  });
}

// 🗑️ DELETE
function confirmDelete(){
  if(!confirm("Are you sure?")) return;
  if(!confirm("Final warning")) return;

  db.ref("users/" + currentUser).remove().then(()=>{
    alert("Deleted");
    location.reload();
  });
}

// 👑 ADMIN
document.getElementById("adminBtn").onclick = ()=>{
  document.getElementById("adminPanel").style.display = "block";
};

function closeAdmin(){
  document.getElementById("adminPanel").style.display = "none";
}

function banUser(){
  let t = document.getElementById("adminUser").value;

  if(currentUser === "YUG1ADMIN" && t === "Virat"){
    alert("Cannot ban Virat");
    return;
  }

  db.ref("users/" + t).update({ banned:true });
}

function giveMoney(){
  let t = document.getElementById("adminUser").value;

  db.ref("users/" + t).once("value").then(s=>{
    db.ref("users/" + t).update({
      balance: s.val().balance + 1000000
    });
  });
}

// 💬 CHAT
function sendChat(){
  clickSound.play();

  let msg = document.getElementById("chatInput").value;
  if(!msg) return;

  db.ref("chat").push({ user: currentUser, text: msg });

  document.getElementById("chatInput").value = "";
  successSound.play();
}

// LIVE CHAT
db.ref("chat").limitToLast(20).on("value", snap=>{
  let html = "";

  snap.forEach(s=>{
    let d = s.val();
    html += `<p><b>${d.user}:</b> ${d.text}</p>`;
  });

  document.getElementById("chatBox").innerHTML = html;
  document.getElementById("chatBox").scrollTop = 9999;
});

// 🏆 LEADERBOARD
db.ref("users").on("value", snap=>{
  let arr = [];

  snap.forEach(s=>{
    arr.push({
      name: s.key,
      balance: s.val().balance || 0
    });
  });

  arr.sort((a,b)=>b.balance-a.balance);

  let html = "";

  arr.slice(0,10).forEach((u,i)=>{
    html += `<p>#${i+1} ${u.name} - ${u.balance} Lot £</p>`;
  });

  document.getElementById("leaderboard").innerHTML = html;
});

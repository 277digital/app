const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const db = new sqlite3.Database("db.sqlite");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));

// 🔥 DATABASE SETUP
db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT
    )
  `);

  const hash = bcrypt.hashSync("admin123", 10);

  db.run(
    "INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'admin', ?)",
    [hash]
  );

});

// 🔐 LOGIN PAGE
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="username" placeholder="Username"/><br><br>
      <input name="password" type="password" placeholder="Password"/><br><br>
      <button>Login</button>
    </form>
  `);
});

// 🔐 LOGIN POST
app.post("/login", (req, res) => {
  db.get("SELECT * FROM users WHERE username=?", [req.body.username], (err, user) => {
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user = user;
      return res.redirect("/app");
    }
    res.send("Login failed");
  });
});

// 🚪 LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// 🏠 ROOT
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.redirect("/app");
});

// 📊 DASHBOARD
app.get("/app", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 👥 CLIENTS LIST
app.get("/clients", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  db.all("SELECT * FROM clients", [], (err, rows) => {
    let list = rows.map(c => `<div>${c.name} (${c.email})</div>`).join("");

    res.send(`
      <h1>Clients</h1>

      <form method="POST" action="/clients">
        <input name="name" placeholder="Name"/><br><br>
        <input name="email" placeholder="Email"/><br><br>
        <button>Add Client</button>
      </form>

      <hr>

      ${list}

      <br><br>
      <a href="/app">Back</a>
    `);
  });
});

// ➕ ADD CLIENT
app.post("/clients", (req, res) => {
  db.run(
    "INSERT INTO clients (name, email) VALUES (?, ?)",
    [req.body.name, req.body.email],
    () => res.redirect("/clients")
  );
});

// 🚀 START SERVER
const PORT = 3000;

app.listen(PORT, () => {
  console.log("App running on port " + PORT);
});

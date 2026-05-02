const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const db = new sqlite3.Database("db.sqlite");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: true
}));

// DB
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  const hash = bcrypt.hashSync("admin123", 10);
  db.run("INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'admin', ?)", [hash]);
});

// LOGIN
app.get("/login", (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="username"/><br>
      <input name="password" type="password"/><br>
      <button>Login</button>
    </form>
  `);
});

app.post("/login", (req, res) => {
  db.get("SELECT * FROM users WHERE username=?", [req.body.username], (err, user) => {
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user = user;
      return res.redirect("/app");
    }
    res.send("Login failed");
  });
});

// ROUTES
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.redirect("/app");
});

app.get("/app", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(3000, () => console.log("App running on 3000"));
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

function renderLoginPage(errorMessage = "") {
  const errorBlock = errorMessage
    ? `<div class="alert" role="alert">${errorMessage}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>277 Digital Login</title>
<style>
:root {
  --ink: #172033;
  --muted: #6c7485;
  --line: #dde3eb;
  --paper: #ffffff;
  --field: #f6f8fb;
  --brand: #0f766e;
  --brand-dark: #115e59;
  --accent: #f59e0b;
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
  background:
    linear-gradient(115deg, rgba(15, 118, 110, 0.12), rgba(245, 158, 11, 0.10)),
    #eef2f6;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-shell {
  width: min(960px, 100%);
  min-height: 600px;
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  background: var(--paper);
  border: 1px solid rgba(23, 32, 51, 0.08);
  border-radius: 8px;
  box-shadow: 0 24px 70px rgba(23, 32, 51, 0.14);
  overflow: hidden;
}

.brand-panel {
  padding: 40px;
  color: #f8fafc;
  background:
    linear-gradient(rgba(12, 42, 48, 0.42), rgba(12, 42, 48, 0.78)),
    url("https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80") center/cover;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-mark {
  width: 52px;
  height: 52px;
  border: 1px solid rgba(255, 255, 255, 0.36);
  display: grid;
  place-items: center;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.12);
}

.brand-copy h1 {
  margin: 0 0 16px;
  font-size: 42px;
  line-height: 1;
  letter-spacing: 0;
}

.brand-copy p {
  max-width: 360px;
  margin: 0;
  color: rgba(248, 250, 252, 0.82);
  font-size: 16px;
  line-height: 1.6;
}

.status-strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.status-item {
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.10);
}

.status-item strong {
  display: block;
  font-size: 20px;
}

.status-item span {
  color: rgba(248, 250, 252, 0.74);
  font-size: 12px;
}

.form-panel {
  padding: 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--brand);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.form-panel h2 {
  margin: 0;
  font-size: 34px;
  letter-spacing: 0;
}

.subcopy {
  margin: 12px 0 30px;
  color: var(--muted);
  line-height: 1.55;
}

.field {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
}

.field label {
  font-size: 13px;
  font-weight: 700;
}

.field input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--field);
  padding: 14px 15px;
  color: var(--ink);
  font: inherit;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}

.field input:focus {
  border-color: var(--brand);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(15, 118, 110, 0.13);
}

.submit-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

button {
  border: 0;
  border-radius: 6px;
  background: var(--brand);
  color: #fff;
  padding: 14px 22px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.18s, background 0.18s, box-shadow 0.18s;
}

button:hover {
  background: var(--brand-dark);
  box-shadow: 0 12px 24px rgba(15, 118, 110, 0.22);
  transform: translateY(-1px);
}

.hint {
  color: var(--muted);
  font-size: 13px;
}

.alert {
  margin: 0 0 18px;
  padding: 12px 14px;
  border-left: 4px solid var(--accent);
  background: #fffbeb;
  color: #7c2d12;
  font-size: 14px;
}

@media (max-width: 760px) {
  body {
    padding: 14px;
  }

  .login-shell {
    min-height: auto;
    grid-template-columns: 1fr;
  }

  .brand-panel {
    min-height: 260px;
    padding: 28px;
  }

  .brand-copy h1 {
    font-size: 34px;
  }

  .form-panel {
    padding: 32px 24px;
  }

  .form-panel h2 {
    font-size: 28px;
  }

  .submit-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
</head>
<body>
  <main class="login-shell">
    <section class="brand-panel" aria-label="277 Digital">
      <div class="brand-mark">277</div>
      <div class="brand-copy">
        <h1>277 Digital</h1>
        <p>Client work, invoices, and service activity in one focused workspace.</p>
      </div>
      <div class="status-strip" aria-label="Workspace status">
        <div class="status-item">
          <strong>12</strong>
          <span>active invoices</span>
        </div>
        <div class="status-item">
          <strong>24/7</strong>
          <span>server access</span>
        </div>
      </div>
    </section>

    <section class="form-panel">
      <p class="eyebrow">Secure dashboard</p>
      <h2>Welcome back</h2>
      <p class="subcopy">Sign in to manage clients, services, and billing activity.</p>
      ${errorBlock}
      <form method="POST" action="/login">
        <div class="field">
          <label for="username">Username</label>
          <input id="username" name="username" autocomplete="username" placeholder="admin" required>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Enter password" required>
        </div>
        <div class="submit-row">
          <button type="submit">Sign in</button>
          <span class="hint">Protected 277 Digital area</span>
        </div>
      </form>
    </section>
  </main>
</body>
</html>`;
}

// 🔐 LOGIN PAGE
app.get("/login", (req, res) => {
  res.send(renderLoginPage(req.query.error ? "Username or password is incorrect." : ""));
});

// 🔐 LOGIN POST
app.post("/login", (req, res) => {
  db.get("SELECT * FROM users WHERE username=?", [req.body.username], (err, user) => {
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user = user;
      return res.redirect("/app");
    }
    res.redirect("/login?error=1");
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

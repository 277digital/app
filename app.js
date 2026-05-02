const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const db = new sqlite3.Database("db.sqlite");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

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
      email TEXT,
      company_name TEXT,
      jib TEXT,
      pdv TEXT,
      phone TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.all("PRAGMA table_info(clients)", [], (err, columns) => {
    if (err) return;

    const existing = new Set(columns.map((column) => column.name));
    const missingColumns = {
      company_name: "TEXT",
      jib: "TEXT",
      pdv: "TEXT",
      phone: "TEXT",
      address: "TEXT",
      created_at: "TEXT"
    };

    Object.entries(missingColumns).forEach(([column, type]) => {
      if (!existing.has(column)) {
        db.run(`ALTER TABLE clients ADD COLUMN ${column} ${type}`);
      }
    });
  });

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
  --text: #f5f7fb;
  --muted: #8c92a3;
  --line: rgba(255, 255, 255, 0.12);
  --line-strong: rgba(255, 255, 255, 0.22);
  --field: rgba(7, 8, 13, 0.48);
  --glow: rgba(165, 176, 255, 0.42);
  --accent: #aeb8ff;
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at 50% 8%, rgba(77, 86, 130, 0.34), transparent 34%),
    radial-gradient(circle at 50% 52%, rgba(77, 86, 130, 0.16), transparent 42%),
    #05070b;
  display: grid;
  place-items: center;
  padding: 24px;
  overflow: hidden;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: radial-gradient(circle at center, black 0%, transparent 64%);
  pointer-events: none;
}

body::after {
  content: "010110 277 DIGITAL 101001 0110 LOGIN 110010 001101";
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  width: min(620px, 100%);
  margin: auto;
  color: rgba(255, 255, 255, 0.045);
  font-family: "Courier New", monospace;
  font-size: 13px;
  letter-spacing: 12px;
  line-height: 1.9;
  text-align: center;
  transform: rotate(-2deg);
  pointer-events: none;
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(486px, 100%);
  padding: 48px;
  border: 1px solid var(--line-strong);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(31, 32, 45, 0.88), rgba(7, 8, 13, 0.9));
  box-shadow:
    0 34px 90px rgba(0, 0, 0, 0.62),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  overflow: hidden;
  backdrop-filter: blur(18px);
}

.login-shell::before {
  content: "";
  position: absolute;
  top: -1px;
  right: -1px;
  width: 118px;
  height: 118px;
  border-bottom-left-radius: 28px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.30), rgba(112, 120, 158, 0.10) 46%, rgba(3, 4, 8, 0.72) 48%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent);
  box-shadow: -20px 24px 44px rgba(0, 0, 0, 0.38);
}

.login-shell::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 0 54px rgba(174, 184, 255, 0.08);
  pointer-events: none;
}

.logo-badge {
  width: 84px;
  height: 84px;
  margin: 2px auto 22px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.94);
  box-shadow:
    0 18px 38px rgba(0, 0, 0, 0.42),
    0 0 30px rgba(174, 184, 255, 0.16),
    inset 0 0 0 8px rgba(255, 255, 255, 0.78);
  overflow: hidden;
}

.logo-badge img {
  width: 70px;
  height: 70px;
  object-fit: contain;
  display: block;
}

.form-panel {
  position: relative;
  z-index: 2;
}

.form-panel h2 {
  margin: 0;
  text-align: center;
  font-size: 32px;
  line-height: 1;
  letter-spacing: 0;
}

.subcopy {
  margin: 12px 0 28px;
  color: var(--muted);
  text-align: center;
  line-height: 1.5;
}

.divider {
  height: 1px;
  margin: 0 0 26px;
  background: linear-gradient(90deg, transparent, var(--line-strong), transparent);
}

.field {
  display: grid;
  gap: 10px;
  margin-bottom: 22px;
}

.field label {
  color: rgba(255, 255, 255, 0.92);
  font-size: 14px;
  font-weight: 600;
}

.field input {
  width: 100%;
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  background: var(--field);
  padding: 0 18px;
  color: var(--text);
  font: inherit;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.34);
}

.field input:focus {
  border-color: rgba(174, 184, 255, 0.64);
  background: rgba(10, 11, 17, 0.76);
  box-shadow: 0 0 0 4px rgba(174, 184, 255, 0.10);
}

button {
  width: 100%;
  height: 52px;
  margin-top: 4px;
  border: 1px solid rgba(214, 219, 255, 0.56);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(47, 49, 64, 0.72), rgba(19, 20, 29, 0.86));
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow:
    0 0 24px rgba(174, 184, 255, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s;
}

button:hover {
  border-color: rgba(239, 242, 255, 0.86);
  box-shadow:
    0 0 34px rgba(174, 184, 255, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
}

.alert {
  margin: 0 0 20px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 185, 92, 0.24);
  border-radius: 8px;
  background: rgba(99, 55, 15, 0.28);
  color: #ffd8a8;
  font-size: 14px;
}

@media (max-width: 560px) {
  body {
    padding: 16px;
    overflow: auto;
  }

  body::after {
    font-size: 11px;
    letter-spacing: 7px;
  }

  .login-shell {
    width: 100%;
    padding: 34px 24px 28px;
    border-radius: 18px;
  }

  .login-shell::before {
    width: 88px;
    height: 88px;
  }

  .form-panel h2 {
    font-size: 28px;
  }
}
</style>
</head>
<body>
  <main class="login-shell">
    <section class="form-panel">
      <div class="logo-badge" aria-hidden="true">
        <img src="/277lg.jpg" alt="">
      </div>
      <h2>Welcome Back</h2>
      <p class="subcopy">Please enter your login details for 277 Digital.</p>
      ${errorBlock}
      <div class="divider"></div>
      <form method="POST" action="/login">
        <div class="field">
          <label for="username">Username</label>
          <input id="username" name="username" autocomplete="username" placeholder="Enter your username" required>
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" placeholder="Enter password" required>
        </div>
        <button type="submit">Sign in</button>
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

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

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

app.get("/api/dashboard", requireAuth, (req, res) => {
  db.get("SELECT COUNT(*) AS total_clients FROM clients", [], (err, summary) => {
    if (err) {
      return res.status(500).json({ error: "Could not load dashboard summary" });
    }

    db.all(
      `SELECT
        id,
        COALESCE(company_name, name, '') AS company_name,
        email,
        phone,
        created_at
       FROM clients
       ORDER BY id DESC
       LIMIT 5`,
      [],
      (clientsErr, recentClients) => {
        if (clientsErr) {
          return res.status(500).json({ error: "Could not load recent clients" });
        }

        res.json({
          totalClients: summary.total_clients || 0,
          totalServices: 0,
          totalInvoices: 0,
          totalRevenue: 0,
          recentClients
        });
      }
    );
  });
});

app.get("/api/clients", requireAuth, (req, res) => {
  db.all(
    `SELECT
      id,
      COALESCE(company_name, name, '') AS company_name,
      jib,
      pdv,
      email,
      phone,
      address,
      created_at
     FROM clients
     ORDER BY id DESC`,
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Could not load clients" });
      }

      res.json(rows);
    }
  );
});

app.post("/api/clients", requireAuth, (req, res) => {
  const companyName = (req.body.company_name || "").trim();

  if (!companyName) {
    return res.status(400).json({ error: "Company name is required" });
  }

  db.run(
    `INSERT INTO clients
      (name, company_name, jib, pdv, email, phone, address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      companyName,
      companyName,
      (req.body.jib || "").trim(),
      (req.body.pdv || "").trim(),
      (req.body.email || "").trim(),
      (req.body.phone || "").trim(),
      (req.body.address || "").trim()
    ],
    function insertClient(err) {
      if (err) {
        return res.status(500).json({ error: "Could not add client" });
      }

      res.status(201).json({ id: this.lastID });
    }
  );
});

app.get("/clients", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.redirect("/app#clients");
});

// 🚀 START SERVER
const PORT = 3000;

app.listen(PORT, () => {
  console.log("App running on port " + PORT);
});

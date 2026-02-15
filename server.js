import express from "express";
import ViteExpress from "vite-express";
import sqlite3 from "sqlite3";

const app = express();
app.use(express.json());

// ───────────────────────────────────────────────
// Подключение к SQLite (файл создаётся автоматически)
// ───────────────────────────────────────────────
const db = new sqlite3.Database("./users.db", (err) => {
    if (err) {
        console.error("Ошибка подключения к БД:", err.message);
    } else {
        console.log("✅ Подключено к SQLite: users.db");
    }
});

// ───────────────────────────────────────────────
// Создание таблицы, если её нет
// ───────────────────────────────────────────────
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            pcLogin TEXT,
            pcPassword TEXT,
            outlookLogin TEXT,
            outlookPassword TEXT,
            directumLogin TEXT,
            directumPassword TEXT,
            vipnetVersion TEXT,
            vipnetPassword TEXT
        )
    `);
});

// ───────────────────────────────────────────────
// GET — получить всех пользователей
// ───────────────────────────────────────────────
app.get("/api/users", (req, res) => {
    db.all("SELECT * FROM users ORDER BY id", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Ошибка сервера" });
        }
        res.json(rows);
    });
});

// ───────────────────────────────────────────────
// POST — добавить одного пользователя
// ───────────────────────────────────────────────
app.post("/api/users", (req, res) => {
    const user = req.body;

    const sql = `
        INSERT INTO users (
            fullName,
            pcLogin,
            pcPassword,
            outlookLogin,
            outlookPassword,
            directumLogin,
            directumPassword,
            vipnetVersion,
            vipnetPassword
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            user.fullName || "",
            user.pcLogin || "",
            user.pcPassword || "",
            user.outlookLogin || "",
            user.outlookPassword || "",
            user.directumLogin || "",
            user.directumPassword || "",
            user.vipnetVersion || "",
            user.vipnetPassword || "",
        ],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Ошибка добавления" });
            }

            res.json({
                success: true,
                id: this.lastID
            });
        }
    );
});

// ───────────────────────────────────────────────
// POST — полностью перезаписать таблицу
// ───────────────────────────────────────────────
app.post("/api/users/save-all", (req, res) => {
    const users = req.body;

    if (!Array.isArray(users)) {
        return res.status(400).json({ error: "Ожидается массив пользователей" });
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run("DELETE FROM users", (err) => {
            if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: "Ошибка очистки" });
            }

            if (users.length === 0) {
                db.run("COMMIT");
                return res.json({ success: true, count: 0 });
            }

            const stmt = db.prepare(`
                INSERT INTO users (
                    fullName,
                    pcLogin,
                    pcPassword,
                    outlookLogin,
                    outlookPassword,
                    directumLogin,
                    directumPassword,
                    vipnetVersion,
                    vipnetPassword
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            let inserted = 0;

            users.forEach((user) => {
                stmt.run([
                    user.fullName || "",
                    user.pcLogin || "",
                    user.pcPassword || "",
                    user.outlookLogin || "",
                    user.outlookPassword || "",
                    user.directumLogin || "",
                    user.directumPassword || "",
                    user.vipnetVersion || "",
                    user.vipnetPassword || "",
                ]);
                inserted++;
            });

            stmt.finalize(() => {
                db.run("COMMIT", (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: "Ошибка сохранения" });
                    }

                    res.json({ success: true, count: inserted });
                });
            });
        });
    });
});

// ───────────────────────────────────────────────
// Запуск сервера
// ───────────────────────────────────────────────
ViteExpress.listen(app, 3000, () => {
    console.log("🚀 Сервер запущен: http://localhost:3000");
});

# 🗄 Users Database --- Vue 3 + Express + SQLite

Full-stack CRUD приложение для управления учетными данными
пользователей.

## 🚀 Стек технологий

-   Vue 3 (Composition API)
-   Express (ViteExpress)
-   SQLite
-   Bootstrap 5
-   Fetch API

------------------------------------------------------------------------

## 🏗 Архитектура

Frontend (Vue 3) ↓ REST API (Express) ↓ Database (SQLite)

------------------------------------------------------------------------

## ✨ Возможности

-   Загрузка пользователей из БД
-   Добавление новых записей
-   Редактирование данных
-   Сохранение изменений в SQLite
-   Автоматическое создание базы данных

------------------------------------------------------------------------

## 🛠 Установка

``` bash
npm install
npm run dev
```

Откройте в браузере:

http://localhost:3000

------------------------------------------------------------------------

## 🗄 Структура таблицы

``` sql
CREATE TABLE users (
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
);
```

------------------------------------------------------------------------

## 🔌 API

GET /api/users\
POST /api/users\
POST /api/users/save-all

------------------------------------------------------------------------

## ⚠ Важно

Пароли хранятся в открытом виде.\
Проект предназначен для учебных целей.

------------------------------------------------------------------------

## 📜 License

MIT

// db.js
// قاعدة بيانات بسيطة (SQLite) - مفيش احتياج لسيرفر داتابيز منفصل
// كل البيانات بتتخزن في ملف yousef.db جنب السيرفر

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'yousef.db'));

db.pragma('journal_mode = WAL');

// جدول المستخدمين
// phone_number: رقم الموبايل - ده المعرّف الأساسي لتسجيل الدخول (بدل اسم مستخدم)
// public_key: المفتاح العام لتشفير الرسائل (End-to-end encryption)
// push_token: توكن إشعارات Expo - عشان نقدر نبعت إشعار للموبايل حتى لو التطبيق مقفول
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_color TEXT DEFAULT '#25D366',
    public_key TEXT,
    push_token TEXT,
    created_at INTEGER NOT NULL
  )
`);

// جدول الرسائل (شات بين شخصين - 1 to 1)
// type: 'text' أو 'voice' - بيحدد الشكل اللي الرسالة تتعرض بيه في التطبيق
// content: دايماً نص مشفر (ciphertext) - في حالة voice بيكون تسجيل صوتي مشفر بصيغة base64
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    status TEXT DEFAULT 'sent',
    created_at INTEGER NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_messages_conversation
  ON messages (sender_id, receiver_id, created_at)
`);

module.exports = db;

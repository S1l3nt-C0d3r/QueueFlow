import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "restaurant.db");

export const db = new Database(dbPath);

// Important SQLite settings
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log("SQLite Connected");
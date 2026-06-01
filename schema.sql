CREATE TABLE IF NOT EXISTS rooms (
  room_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_players INTEGER DEFAULT 4
);

CREATE TABLE IF NOT EXISTS players (
  player_id TEXT PRIMARY KEY,
  username TEXT,
  room_id TEXT,
  FOREIGN KEY(room_id) REFERENCES rooms(room_id)
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT,
  username TEXT,
  timestamp TEXT
);

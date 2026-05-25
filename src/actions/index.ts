import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import db from '../db/db.ts'; // 匯入剛剛建立的 db

const logHistory = (action: string, username: string) => {
    // 1. 原本的文字檔紀錄 (不更動)
    const logsDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
    const date = new Date().toISOString().split('T')[0];
    const logPath = path.join(logsDir, `${date}.log`);
    const entry = `[${new Date().toLocaleTimeString()}] User: ${username} performed: ${action}\n`;
    fs.appendFileSync(logPath, entry);

    // 2. 新增：寫入資料庫
    const stmt = db.prepare('INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)');
    stmt.run(action, username, new Date().toISOString());
};

export const server = {
    login: defineAction({
        input: z.object({ username: z.string().min(1) }),
        handler: async ({ username }, context) => {
            context.cookies.set("user_session", username, {
                path: "/",
                httpOnly: true,
                secure: false,
                sameSite: 'lax'
            });
            logHistory("LOGIN", username);
            return { success: true };
        }
    }),
    logout: defineAction({
        handler: async (_, context) => {
            const username = context.cookies.get("user_session")?.value || "Unknown";
            context.cookies.delete("user_session", { path: "/" });
            logHistory("LOGOUT", username);
            return { success: true };
        }
    }),
    // 創建房間
    createRoom: defineAction({
        input: z.object({ name: z.string(), username: z.string() }),
        handler: async ({ name, username }) => {
            const roomId = randomUUID();
            const exists = db.prepare('SELECT room_id FROM rooms WHERE room_id = ?').get(roomId);

            if (exists) {
                // 如果真的發生了 ID 重複，拋出錯誤
                retu
                throw new Error("系統繁忙，請稍後再試 (ID 碰撞)");
            }
            // 1. 插入房間
            db.prepare('INSERT INTO rooms (room_id, name) VALUES (?, ?)').run(roomId, name);
            // 2. 將創建者加入該房間
            db.prepare('INSERT INTO players (player_id, username, room_id) VALUES (?, ?, ?)').run(randomUUID(), username, roomId);
            return { roomId };
        }
    }),

    // 加入房間
    joinRoom: defineAction({
        input: z.object({ roomId: z.string(), username: z.string() }),
        handler: async ({ roomId, username }) => {
            const room = db.prepare('SELECT * FROM rooms WHERE room_id = ?').get(roomId);
            if (!room) throw new Error("房間不存在");

            db.prepare('INSERT INTO players (player_id, username, room_id) VALUES (?, ?, ?)').run(randomUUID(), username, roomId);
            return { success: true };
        }
    })
};
import { defineAction } from 'astro:actions';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import db from '../db/db.ts'; // 假設這裡已經換成 libSQL 的 client

const logHistory = async (action: string, username: string) => {
    // 1. 文字檔紀錄 (注意: 在 Netlify 等 Serverless 環境，檔案寫入功能極其受限，建議移除此段)
    
    // 2. 寫入雲端資料庫
    await db.execute({
        sql: 'INSERT INTO logs (action, username, timestamp) VALUES (?, ?, ?)',
        args: [action, username, new Date().toISOString()]
    });
};

export const server = {
    login: defineAction({
        input: z.object({ username: z.string().min(1) }),
        handler: async ({ username }, context) => {
            context.cookies.set("user_session", username, {
                path: "/",
                httpOnly: true,
                secure: true, // 部署到線上後請記得設為 true
                sameSite: 'lax'
            });
            await logHistory("LOGIN", username);
            return { success: true };
        }
    }),

    createRoom: defineAction({
        input: z.object({ name: z.string(), username: z.string() }),
        handler: async ({ name, username }) => {
            const roomId = randomUUID();
            
            // 使用 await 查詢
            const result = await db.execute({
                sql: 'SELECT room_id FROM rooms WHERE room_id = ?',
                args: [roomId]
            });

            if (result.rows.length > 0) {
                throw new Error("系統繁忙，請稍後再試 (ID 碰撞)");
            }

            // 執行插入
            await db.execute({
                sql: 'INSERT INTO rooms (room_id, name) VALUES (?, ?)',
                args: [roomId, name]
            });
            
            await db.execute({
                sql: 'INSERT INTO players (player_id, username, room_id) VALUES (?, ?, ?)',
                args: [randomUUID(), username, roomId]
            });
            
            return { roomId };
        }
    }),

    joinRoom: defineAction({
        input: z.object({ roomId: z.string(), username: z.string() }),
        handler: async ({ roomId, username }) => {
            const result = await db.execute({
                sql: 'SELECT * FROM rooms WHERE room_id = ?',
                args: [roomId]
            });
            
            if (result.rows.length === 0) throw new Error("房間不存在");

            await db.execute({
                sql: 'INSERT INTO players (player_id, username, room_id) VALUES (?, ?, ?)',
                args: [randomUUID(), username, roomId]
            });
            return { success: true };
        }
    })
};
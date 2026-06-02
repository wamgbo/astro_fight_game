import { Server } from "socket.io";
import { createServer } from "http";

const io = new Server(createServer().listen(3001), { cors: { origin: "*" } });

let players = {};

io.on("connection", (socket) => {
    // 房間限制：一人一房 (或兩人上限)
    if (Object.keys(players).length >= 2) {
        console.log(`[拒絕] 房間已滿，拒絕玩家: ${socket.id}`);
        socket.disconnect();
        return;
    }

    players[socket.id] = {
        x: 100, y: 100, hp: 3, isDefending: false, isAttacking: false
    };

    console.log(`[玩家加入] ID: ${socket.id}, 目前人數: ${Object.keys(players).length}`);

    // 處理防禦
    socket.on("defend", (isDefending) => {
        if (players[socket.id]) {
            players[socket.id].isDefending = isDefending;
            io.emit("update-players", players);
        }
    });

    // 處理攻擊 (拳或腿)
    socket.on("attack", (type) => {
        const attacker = players[socket.id];
        attacker.isAttacking = true;

        Object.keys(players).forEach(id => {
            if (id !== socket.id) {
                const target = players[id];
                // 碰撞檢測
                if (Math.hypot(attacker.x - target.x, attacker.y - target.y) < 60) {
                    if (!target.isDefending) {
                        target.hp = Math.max(0, target.hp - 1);
                        console.log(`[攻擊] ${type} 擊中 ${id}，剩餘血量: ${target.hp}`);
                    } else {
                        console.log(`[防禦] ${id} 成功抵擋了 ${type}！`);
                    }
                }
            }
        });

        io.emit("update-players", players);
        setTimeout(() => { attacker.isAttacking = false; io.emit("update-players", players); }, 300);
    });
    socket.on("move", (data) => {
        console.log("伺服器收到移動:", data); // <--- 確認伺服器這裡有反應嗎？
        if (players[socket.id] && !players[socket.id].isDead) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit("update-players", players);
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("update-players", players);
    });
});
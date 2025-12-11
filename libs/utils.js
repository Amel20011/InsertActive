import os from 'os';
import process from 'process';

let startTime = Date.now();

export async function ping(sock, to) {
    const timestamp = Date.now();
    const latency = timestamp - startTime;
    
    await sock.sendMessage(to, {
        text: `🏓 *PONG!*\n\n⏱️ *Latency:* ${latency}ms\n📅 *Uptime:* ${formatUptime(Date.now() - startTime)}`
    });
}

export async function runtime(sock, to) {
    const uptime = Date.now() - startTime;
    
    await sock.sendMessage(to, {
        text: `⏰ *RUNTIME INFORMATION*\n\n🕐 *Uptime:* ${formatUptime(uptime)}\n📅 *Start:* ${new Date(startTime).toLocaleString('id-ID')}\n💻 *Platform:* ${os.platform()}\n📊 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
    });
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}

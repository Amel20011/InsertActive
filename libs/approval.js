import fs from 'fs';
import path from 'path';

const usersPath = './data/users.json';

export async function checkRegistration(userId) {
    try {
        if (!fs.existsSync(usersPath)) {
            fs.writeFileSync(usersPath, JSON.stringify([]));
            return false;
        }
        
        const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
        return users.some(user => user.id === userId);
    } catch (error) {
        console.error('Check registration error:', error);
        return false;
    }
}

export async function sendVerificationButton(sock, to) {
    const message = {
        text: `👋 *Halo! Selamat datang di Liviaa Astranica Bot*\n\nSebelum menggunakan bot, Anda harus verifikasi terlebih dahulu.\n\nKlik tombol di bawah untuk verifikasi:`,
        footer: "Bot Store Liviaa Astranica",
        buttons: [
            {
                buttonId: '.verify',
                buttonText: { displayText: '✅ Verify My Account' },
                type: 1
            }
        ],
        headerType: 1
    };
    
    await sock.sendMessage(to, message);
}

export async function verifyUser(sock, to, userId) {
    try {
        let users = [];
        if (fs.existsSync(usersPath)) {
            users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
        }
        
        if (!users.some(user => user.id === userId)) {
            users.push({
                id: userId,
                registeredAt: new Date().toISOString(),
                limit: 10,
                saldo: 0
            });
            
            fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
            
            const successMessage = {
                text: `✅ *Verifikasi Berhasil!*\n\nSekarang Anda dapat menggunakan bot.\n\nKetik *.menu* untuk melihat semua command.\nKetik *.store* untuk melihat produk yang dijual.`,
                footer: "Liviaa Astranica Bot",
                buttons: [
                    {
                        buttonId: '.menu',
                        buttonText: { displayText: '📋 Menu' },
                        type: 1
                    },
                    {
                        buttonId: '.store',
                        buttonText: { displayText: '🛒 Store' },
                        type: 1
                    }
                ],
                headerType: 1
            };
            
            await sock.sendMessage(to, successMessage);
        } else {
            await sock.sendMessage(to, { 
                text: `✅ Anda sudah terverifikasi sebelumnya. Ketik *.menu* untuk mulai.` 
            });
        }
    } catch (error) {
        console.error('Verify error:', error);
        await sock.sendMessage(to, { 
            text: `❌ Gagal verifikasi. Silakan coba lagi.` 
        });
    }
}

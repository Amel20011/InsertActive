export async function sendOwnerInfo(sock, to) {
    const ownerInfo = `
👑 *INFORMASI PEMILIK BOT*

🤖 *Nama Bot:* Liviaa Astranica
👤 *Pemilik:* +1 (365) 870-0681
🏪 *Nama Toko:* Liviaa Store
📱 *Kontak Owner:* wa.me/13658700681
⏰ *Jam Operasional:* 24/7

📞 *Hubungi Owner untuk:*
• Pertanyaan produk
• Bantuan teknis
• Kerjasama
• Laporan bug

📍 *Media Sosial:*
• Instagram: @liviaaastranica
• TikTok: @liviaastore
• Website: coming soon
    `.trim();

    const message = {
        text: ownerInfo,
        footer: "Jangan ragu untuk menghubungi owner!",
        buttons: [
            {
                buttonId: 'https://wa.me/13658700681',
                buttonText: { displayText: '📱 Chat Owner' },
                type: 3 // URL button
            },
            {
                buttonId: '.store',
                buttonText: { displayText: '🛒 Store' },
                type: 1
            },
            {
                buttonId: '.menu',
                buttonText: { displayText: '📋 Menu' },
                type: 1
            }
        ],
        headerType: 1
    };
    
    await sock.sendMessage(to, message);
}

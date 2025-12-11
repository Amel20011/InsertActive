export async function sendMainMenu(sock, to) {
    const menuText = `
┌───〔 🌟 *LIVIAA ASTRANICA BOT* 〕
│ 
│ *🤖 BOT INFO*
│ • Nama: Liviaa Astranica
│ • Tipe: Store Bot
│ • Status: Aktif ✅
│ 
├───〔 📱 *MAIN MENU* 〕
│ • .menu - Menu utama
│ • .owner - Info pemilik bot
│ • .donate - Donasi
│ • .runtime - Uptime bot
│ • .ping - Cek kecepatan
│ • .profile - Profile Anda
│ • .limit - Cek limit
│ • .saldo - Cek saldo
│ • .topup - Topup saldo
│ • .claim - Klaim bonus harian
│ 
├───〔 🛒 *STORE MENU* 〕
│ • .store - Lihat produk
│ • .cart - Keranjang belanja
│ • .buy [id] - Beli produk
│ • .checkout - Checkout pesanan
│ • .payment - Metode pembayaran
│ • .qris - QRIS Payment
│ 
├───〔 👑 *OWNER MENU* 〕
│ • .addprem @tag - Tambah premium
│ • .delprem @tag - Hapus premium
│ • .setprefix - Ubah prefix
│ • .broadcast - Broadcast pesan
│ • .addlimit - Tambah limit user
│ • .addsaldo - Tambah saldo user
│ 
├───〔 🎬 *DOWNLOADER* 〕
│ • .ytmp3 [link] - YouTube MP3
│ • .ytmp4 [link] - YouTube MP4
│ • .tiktok [link] - TikTok Download
│ • .igdl [link] - Instagram Download
│ • .fbdl [link] - Facebook Download
│ 
└───〔 👥 *GROUP MENU* 〕
│ • .add @tag - Tambah member
│ • .kick @tag - Kick member
│ • .promote @tag - Jadikan admin
│ • .demote @tag - Turunkan admin
│ • .hidetag [teks] - Tag tersembunyi
│ • .tagall - Tag semua member
│ • .welcome on/off - Welcome message
│ • .antilink on/off - Anti link
│ • .antivirtex on/off - Anti virtex
│ • .antidelete on/off - Anti delete
│ • .group buka/tutup - Buka/tutup group
│ • .setppgc - Set foto group
│ • .setnamegc [nama] - Ubah nama group
│ • .setdescgc [desc] - Ubah deskripsi
│ • .linkgc - Dapatkan link group
│ • .resetlinkgc - Reset link group
│ • .kickme - Keluar dari group
│ • .vote [teks] - Mulai voting
│ • .devote - Hapus voting
│ 
└────────────────────
    `.trim();

    const message = {
        text: menuText,
        footer: "Ketik command dengan awalan titik (.)\nContoh: .store",
        buttons: [
            {
                buttonId: '.owner',
                buttonText: { displayText: '👑 Owner' },
                type: 1
            },
            {
                buttonId: '.store',
                buttonText: { displayText: '🛒 Store' },
                type: 1
            },
            {
                buttonId: '.allmenu',
                buttonText: { displayText: '📋 All Menu' },
                type: 1
            }
        ],
        headerType: 1
    };
    
    await sock.sendMessage(to, message);
}

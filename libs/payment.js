import fs from 'fs';

const settingsPath = './data/settings.json';

export async function showPaymentMethods(sock, to) {
    const paymentMethods = `
💳 *METODE PEMBAYARAN*

Kami menerima pembayaran melalui:

1. *QRIS* ✅
   - Scan QR code untuk pembayaran
   - Support semua e-wallet & mobile banking
   - Instan & praktis

2. *Transfer Bank*
   • BCA: 1234567890
   • BRI: 0987654321
   • BNI: 1122334455
   • Mandiri: 5544332211

3. *E-Wallet*
   • Dana: 081234567890
   • OVO: 081234567890
   • Gopay: 081234567890

📝 *INSTRUKSI PEMBAYARAN:*
1. Pilih metode pembayaran
2. Lakukan transfer sesuai total
3. Kirim bukti pembayaran ke owner
4. Pesanan akan diproses

⏰ *Waktu Proses:*
• QRIS: Instan
• Transfer: 1-5 menit
• E-Wallet: Instan
    `.trim();

    const message = {
        text: paymentMethods,
        footer: "Liviaa Astranica Store",
        buttons: [
            {
                buttonId: '.qris',
                buttonText: { displayText: '📱 QRIS Payment' },
                type: 1
            },
            {
                buttonId: '.owner',
                buttonText: { displayText: '👑 Konfirmasi Pembayaran' },
                type: 1
            }
        ],
        headerType: 1
    };
    
    await sock.sendMessage(to, message);
}

export async function sendQris(sock, to) {
    try {
        const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
        const qrisUrl = settings.qrisPayment || 'https://example.com/qris.jpg';
        
        await sock.sendMessage(to, {
            text: `📱 *QRIS PAYMENT*\n\nScan QR code di bawah untuk pembayaran:\n\n💰 *Total:* Sesuai checkout\n⏰ *Expired:* 24 jam\n📝 *Catatan:* Tulis nama Anda di keterangan transfer`
        });
        
        // Kirim gambar QRIS jika ada
        if (qrisUrl.startsWith('http')) {
            await sock.sendMessage(to, {
                image: { url: qrisUrl },
                caption: 'Scan QR code ini untuk pembayaran'
            });
        }
        
        await sock.sendMessage(to, {
            text: `✅ Setelah membayar, kirim bukti transfer ke owner:\nwa.me/13658700681\n\nKetik *.owner* untuk info kontak owner`
        });
        
    } catch (error) {
        console.error('Send QRIS error:', error);
        await sock.sendMessage(to, {
            text: '❌ Gagal mengirim QRIS. Silakan hubungi owner.'
        });
    }
}

export async function processCheckout(sock, to, userId) {
    try {
        const cartsPath = './data/carts.json';
        if (!fs.existsSync(cartsPath)) {
            return await sock.sendMessage(to, {
                text: '❌ Keranjang kosong!'
            });
        }
        
        const carts = JSON.parse(fs.readFileSync(cartsPath, 'utf-8'));
        const userCart = carts[userId.split('@')[0]] || [];
        
        if (userCart.length === 0) {
            return await sock.sendMessage(to, {
                text: '❌ Keranjang kosong!'
            });
        }
        
        let total = 0;
        let orderDetails = '';
        
        userCart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            orderDetails += `• ${item.name} (${item.quantity} x Rp ${item.price.toLocaleString()})\n`;
        });
        
        const orderId = 'ORD' + Date.now();
        const order = {
            id: orderId,
            userId: userId.split('@')[0],
            items: userCart,
            total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Save order
        const ordersPath = './data/orders.json';
        let orders = [];
        if (fs.existsSync(ordersPath)) {
            orders = JSON.parse(fs.readFileSync(ordersPath, 'utf-8'));
        }
        orders.push(order);
        fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
        
        // Clear cart
        delete carts[userId.split('@')[0]];
        fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
        
        const checkoutText = `
✅ *CHECKOUT BERHASIL!*

📦 *Order ID:* ${orderId}
👤 *Pemesan:* ${userId.split('@')[0]}
📅 *Tanggal:* ${new Date().toLocaleDateString('id-ID')}
⏰ *Waktu:* ${new Date().toLocaleTimeString('id-ID')}

📋 *Detail Pesanan:*
${orderDetails}
💰 *TOTAL: Rp ${total.toLocaleString()}*

💳 *Langkah Pembayaran:*
1. Ketik *.payment* untuk pilih metode
2. Bayar sesuai total
3. Kirim bukti ke owner
4. Pesanan akan diproses

⏱ *Estimasi Pengiriman:*
• Jabodetabek: 1-2 hari
• Luar kota: 3-7 hari
• Papua: 7-14 hari

📞 *Kontak Owner:*
wa.me/13658700681
        `.trim();
        
        const message = {
            text: checkoutText,
            footer: "Liviaa Astranica Store",
            buttons: [
                {
                    buttonId: '.payment',
                    buttonText: { displayText: '💳 Pilih Pembayaran' },
                    type: 1
                },
                {
                    buttonId: '.owner',
                    buttonText: { displayText: '👑 Hubungi Owner' },
                    type: 1
                }
            ],
            headerType: 1
        };
        
        await sock.sendMessage(to, message);
        
    } catch (error) {
        console.error('Checkout error:', error);
        await sock.sendMessage(to, {
            text: '❌ Gagal checkout. Silakan coba lagi.'
        });
    }
}

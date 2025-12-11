import fs from 'fs';

const productsPath = './data/products.json';
const cartsPath = './data/carts.json';

export async function showStore(sock, to) {
    try {
        if (!fs.existsSync(productsPath)) {
            fs.writeFileSync(productsPath, JSON.stringify([]));
        }
        
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        
        if (products.length === 0) {
            return await sock.sendMessage(to, { 
                text: '📭 *Toko Sedang Kosong*\n\nBelum ada produk yang tersedia untuk saat ini.' 
            });
        }
        
        let productList = '🛒 *LIVIAA STORE*\n\n';
        products.forEach((product, index) => {
            productList += `*${index + 1}. ${product.name}*\n`;
            productList += `📦 Stok: ${product.stock}\n`;
            productList += `💰 Harga: Rp ${product.price.toLocaleString()}\n`;
            productList += `📝 Deskripsi: ${product.description}\n`;
            productList += `🆔 ID: ${product.id}\n`;
            productList += `═══════════════════\n`;
        });
        
        productList += '\n📝 *CARA MEMBELI:*\n';
        productList += 'Ketik: .buy [ID Produk] [Jumlah]\n';
        productList += 'Contoh: .buy P001 2\n\n';
        productList += 'Untuk melihat keranjang: .cart\n';
        productList += 'Untuk checkout: .checkout';
        
        const message = {
            text: productList,
            footer: "Liviaa Astranica Store",
            buttons: [
                {
                    buttonId: '.cart',
                    buttonText: { displayText: '🛍️ Keranjang' },
                    type: 1
                },
                {
                    buttonId: '.payment',
                    buttonText: { displayText: '💳 Payment' },
                    type: 1
                }
            ],
            headerType: 1
        };
        
        await sock.sendMessage(to, message);
    } catch (error) {
        console.error('Show store error:', error);
        await sock.sendMessage(to, { 
            text: '❌ Gagal memuat produk. Silakan coba lagi nanti.' 
        });
    }
}

export async function handlePurchase(sock, to, args) {
    try {
        if (args.length < 2) {
            return await sock.sendMessage(to, { 
                text: '❌ *Format Salah!*\n\nGunakan: .buy [ID Produk] [Jumlah]\nContoh: .buy P001 2' 
            });
        }
        
        const productId = args[1];
        const quantity = parseInt(args[2]) || 1;
        
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            return await sock.sendMessage(to, { 
                text: '❌ Produk tidak ditemukan!' 
            });
        }
        
        if (product.stock < quantity) {
            return await sock.sendMessage(to, { 
                text: `❌ Stok tidak cukup! Stok tersedia: ${product.stock}` 
            });
        }
        
        // Update cart
        let carts = {};
        if (fs.existsSync(cartsPath)) {
            carts = JSON.parse(fs.readFileSync(cartsPath, 'utf-8'));
        }
        
        const userId = to.split('@')[0];
        if (!carts[userId]) {
            carts[userId] = [];
        }
        
        // Cek jika produk sudah ada di cart
        const existingItem = carts[userId].find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            carts[userId].push({
                productId,
                name: product.name,
                price: product.price,
                quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        fs.writeFileSync(cartsPath, JSON.stringify(carts, null, 2));
        
        const total = product.price * quantity;
        
        await sock.sendMessage(to, { 
            text: `✅ *Berhasil ditambahkan ke keranjang!*\n\n📦 *Produk:* ${product.name}\n📊 *Jumlah:* ${quantity}\n💰 *Harga Satuan:* Rp ${product.price.toLocaleString()}\n💰 *Total:* Rp ${total.toLocaleString()}\n\nKetik *.cart* untuk melihat keranjang\nKetik *.checkout* untuk membayar` 
        });
        
    } catch (error) {
        console.error('Purchase error:', error);
        await sock.sendMessage(to, { 
            text: '❌ Gagal menambahkan ke keranjang. Silakan coba lagi.' 
        });
    }
}

export async function showCart(sock, to, userId) {
    try {
        if (!fs.existsSync(cartsPath)) {
            return await sock.sendMessage(to, { 
                text: '🛍️ *Keranjang Kosong*\n\nBelum ada item di keranjang Anda.' 
            });
        }
        
        const carts = JSON.parse(fs.readFileSync(cartsPath, 'utf-8'));
        const userCart = carts[userId.split('@')[0]] || [];
        
        if (userCart.length === 0) {
            return await sock.sendMessage(to, { 
                text: '🛍️ *Keranjang Kosong*\n\nBelum ada item di keranjang Anda.' 
            });
        }
        
        let cartText = '🛍️ *KERANJANG BELANJA*\n\n';
        let total = 0;
        
        userCart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartText += `*${index + 1}. ${item.name}*\n`;
            cartText += `📊 Jumlah: ${item.quantity}\n`;
            cartText += `💰 Harga: Rp ${item.price.toLocaleString()}\n`;
            cartText += `💰 Subtotal: Rp ${itemTotal.toLocaleString()}\n`;
            cartText += `═══════════════════\n`;
        });
        
        cartText += `\n💰 *TOTAL: Rp ${total.toLocaleString()}*\n\n`;
        cartText += 'Ketik *.checkout* untuk melanjutkan pembayaran\n';
        cartText += 'Ketik *.store* untuk melihat produk lain';
        
        const message = {
            text: cartText,
            footer: "Liviaa Astranica Store",
            buttons: [
                {
                    buttonId: '.checkout',
                    buttonText: { displayText: '💳 Checkout' },
                    type: 1
                },
                {
                    buttonId: '.store',
                    buttonText: { displayText: '🛒 Belanja Lagi' },
                    type: 1
                }
            ],
            headerType: 1
        };
        
        await sock.sendMessage(to, message);
    } catch (error) {
        console.error('Show cart error:', error);
        await sock.sendMessage(to, { 
            text: '❌ Gagal memuat keranjang. Silakan coba lagi.' 
        });
    }
}

import fs from 'fs';

const adminsPath = './data/admins.json';
const productsPath = './data/products.json';
const usersPath = './data/users.json';

export function isAdmin(userId) {
    try {
        if (!fs.existsSync(adminsPath)) {
            fs.writeFileSync(adminsPath, JSON.stringify(['13658700681@s.whatsapp.net']));
        }
        
        const admins = JSON.parse(fs.readFileSync(adminsPath, 'utf-8'));
        return admins.includes(userId);
    } catch (error) {
        console.error('Check admin error:', error);
        return false;
    }
}

export async function addProduct(sock, to, args, sender) {
    try {
        if (!isAdmin(sender)) {
            return await sock.sendMessage(to, {
                text: '❌ Hanya admin yang bisa menggunakan command ini!'
            });
        }
        
        if (args.length < 4) {
            return await sock.sendMessage(to, {
                text: '❌ Format salah!\nGunakan: .addproduct [nama] [harga] [stok] [deskripsi]\nContoh: .addproduct "Sepatu Nike" 500000 10 "Sepatu original"'
            });
        }
        
        const name = args[1];
        const price = parseInt(args[2]);
        const stock = parseInt(args[3]);
        const description = args.slice(4).join(' ') || 'Tidak ada deskripsi';
        
        let products = [];
        if (fs.existsSync(productsPath)) {
            products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
        }
        
        const newProduct = {
            id: 'P' + (products.length + 1).toString().padStart(3, '0'),
            name,
            price,
            stock,
            description,
            createdAt: new Date().toISOString()
        };
        
        products.push(newProduct);
        fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
        
        await sock.sendMessage(to, {
            text: `✅ *PRODUK BERHASIL DITAMBAHKAN!*\n\n📦 *ID:* ${newProduct.id}\n🏷️ *Nama:* ${name}\n💰 *Harga:* Rp ${price.toLocaleString()}\n📊 *Stok:* ${stock}\n📝 *Deskripsi:* ${description}`
        });
        
    } catch (error) {
        console.error('Add product error:', error);
        await sock.sendMessage(to, {
            text: '❌ Gagal menambah produk.'
        });
    }
}

export async function broadcast(sock, to, args, sender) {
    try {
        if (!isAdmin(sender)) {
            return await sock.sendMessage(to, {
                text: '❌ Hanya admin yang bisa menggunakan command ini!'
            });
        }
        
        const message = args.slice(1).join(' ');
        if (!message) {
            return await sock.sendMessage(to, {
                text: '❌ Masukkan pesan broadcast!\nGunakan: .broadcast [pesan]'
            });
        }
        
        await sock.sendMessage(to, {
            text: '📢 *MENGIRIM BROADCAST...*\n\nPesan akan dikirim ke semua user.'
        });
        
        // Kirim ke semua user yang terdaftar
        if (fs.existsSync(usersPath)) {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
            
            for (const user of users) {
                try {
                    await sock.sendMessage(user.id + '@s.whatsapp.net', {
                        text: `📢 *BROADCAST MESSAGE*\n\n${message}\n\n_Dikirim oleh admin_`
                    });
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 detik
                } catch (error) {
                    console.error(`Gagal kirim ke ${user.id}:`, error);
                }
            }
        }
        
        await sock.sendMessage(to, {
            text: '✅ Broadcast selesai dikirim!'
        });
        
    } catch (error) {
        console.error('Broadcast error:', error);
        await sock.sendMessage(to, {
            text: '❌ Gagal mengirim broadcast.'
        });
    }
}

import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    Browsers,
    downloadContentFromMessage
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import P from 'pino';
import qrcode from 'qrcode-terminal';
import { handler } from './handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Buat folder data jika belum ada
const dataDirs = ['data', 'data/media', 'data/qr'];
dataDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Inisialisasi file JSON
const jsonFiles = {
    'products.json': [],
    'settings.json': { 
        botName: "Liviaa Astranica",
        ownerNumber: "13658700681",
        storeName: "Liviaa Store",
        qrisPayment: "https://example.com/qris.jpg"
    },
    'admins.json': [],
    'groups.json': [],
    'orders.json': [],
    'carts.json': {},
    'users.json': []
};

Object.entries(jsonFiles).forEach(([file, defaultData]) => {
    const filePath = path.join('data', file);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
});

const store = makeInMemoryStore({});
store.readFromFile('./data/store.json');

const startBot = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./data/auth');
    
    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' }))
        },
        browser: Browsers.ubuntu('Chrome'),
        logger: P({ level: 'silent' }),
        version: [2, 2413, 1]
    });

    store.bind(sock.ev);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            qrcode.generate(qr, { small: true });
            console.log('Scan QR code di atas untuk login');
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Koneksi terputus...', lastDisconnect.error);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('Bot berhasil terhubung!');
            console.log('Bot Name: Liviaa Astranica');
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        
        await handler(sock, msg, store);
    });

    // Simpan store setiap 10 detik
    setInterval(() => {
        store.writeToFile('./data/store.json');
    }, 10_000);

    return sock;
};

startBot().catch(console.error);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

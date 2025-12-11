import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as menu from './libs/menu.js';
import * as store from './libs/store.js';
import * as owner from './libs/owner.js';
import * as payment from './libs/payment.js';
import * as admin from './libs/admin.js';
import * as group from './libs/group.js';
import * as utils from './libs/utils.js';
import * as approval from './libs/approval.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function handler(sock, msg, store) {
    try {
        const from = msg.key.remoteJid;
        const user = msg.key.participant || from;
        const type = Object.keys(msg.message)[0];
        const message = msg.message[type];
        
        let text = '';
        if (type === 'conversation') {
            text = message;
        } else if (type === 'extendedTextMessage') {
            text = message.text || '';
        } else if (type === 'buttonsResponseMessage') {
            text = message.selectedButtonId || '';
        }
        
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? user : from;
        
        // Cek apakah pengguna sudah terdaftar
        const isRegistered = await approval.checkRegistration(sender);
        
        if (!isRegistered && !text.startsWith('.verify')) {
            return await approval.sendVerificationButton(sock, from);
        }
        
        // Handle commands
        if (text.startsWith('.') || text.startsWith('!') || text.startsWith('/')) {
            const command = text.toLowerCase().split(' ')[0];
            const args = text.slice(command.length).trim().split(' ');
            
            switch(command) {
                case '.menu':
                case '.allmenu':
                    await menu.sendMainMenu(sock, from);
                    break;
                    
                case '.owner':
                    await owner.sendOwnerInfo(sock, from);
                    break;
                    
                case '.store':
                case '.jualan':
                    await store.showStore(sock, from);
                    break;
                    
                case '.buy':
                case '.beli':
                    await store.handlePurchase(sock, from, args);
                    break;
                    
                case '.cart':
                case '.keranjang':
                    await store.showCart(sock, from, sender);
                    break;
                    
                case '.checkout':
                    await payment.processCheckout(sock, from, sender);
                    break;
                    
                case '.payment':
                case '.pembayaran':
                    await payment.showPaymentMethods(sock, from);
                    break;
                    
                case '.qris':
                    await payment.sendQris(sock, from);
                    break;
                    
                case '.verify':
                    await approval.verifyUser(sock, from, sender);
                    break;
                    
                // Group commands
                case '.add':
                    if (isGroup) await group.addMember(sock, from, args);
                    break;
                case '.kick':
                    if (isGroup) await group.kickMember(sock, from, args);
                    break;
                case '.promote':
                    if (isGroup) await group.promoteMember(sock, from, args);
                    break;
                case '.demote':
                    if (isGroup) await group.demoteMember(sock, from, args);
                    break;
                case '.hidetag':
                    if (isGroup) await group.hiddenTag(sock, from, args);
                    break;
                case '.tagall':
                    if (isGroup) await group.tagAll(sock, from);
                    break;
                case '.welcome':
                    if (isGroup) await group.setWelcome(sock, from, args);
                    break;
                case '.antilink':
                    if (isGroup) await group.setAntiLink(sock, from, args);
                    break;
                case '.group':
                    if (isGroup) await group.toggleGroup(sock, from, args);
                    break;
                case '.linkgc':
                    if (isGroup) await group.getGroupLink(sock, from);
                    break;
                case '.setnamegc':
                    if (isGroup) await group.setGroupName(sock, from, args);
                    break;
                    
                // Admin commands
                case '.addproduct':
                    await admin.addProduct(sock, from, args, sender);
                    break;
                case '.delproduct':
                    await admin.deleteProduct(sock, from, args, sender);
                    break;
                case '.broadcast':
                    await admin.broadcast(sock, from, args, sender);
                    break;
                case '.addadmin':
                    await admin.addAdmin(sock, from, args, sender);
                    break;
                    
                // Utility commands
                case '.ping':
                    await utils.ping(sock, from);
                    break;
                case '.runtime':
                    await utils.runtime(sock, from);
                    break;
                case '.profile':
                    await utils.profile(sock, from, sender);
                    break;
                    
                default:
                    await sock.sendMessage(from, { 
                        text: `❌ Command tidak ditemukan. Ketik *.menu* untuk melihat daftar command.` 
                    });
            }
        }
        
        // Auto welcome in group
        if (msg.message?.protocolMessage?.key?.participant) {
            await group.handleWelcome(sock, msg, from);
        }
        
    } catch (error) {
        console.error('Handler Error:', error);
    }
}

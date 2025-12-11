import fs from 'fs';

const groupsPath = './data/groups.json';

export async function addMember(sock, groupId, args) {
    try {
        if (args.length < 2) {
            return await sock.sendMessage(groupId, {
                text: '❌ Format salah! Gunakan: .add @tag'
            });
        }
        
        const mentionedJid = args[1].replace('@', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(groupId, [mentionedJid], 'add');
        
        await sock.sendMessage(groupId, {
            text: `✅ Berhasil menambahkan ${args[1]} ke group!`
        });
    } catch (error) {
        console.error('Add member error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal menambahkan member.'
        });
    }
}

export async function kickMember(sock, groupId, args) {
    try {
        if (args.length < 2) {
            return await sock.sendMessage(groupId, {
                text: '❌ Format salah! Gunakan: .kick @tag'
            });
        }
        
        const mentionedJid = args[1].replace('@', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(groupId, [mentionedJid], 'remove');
        
        await sock.sendMessage(groupId, {
            text: `❌ Berhasil mengeluarkan ${args[1]} dari group!`
        });
    } catch (error) {
        console.error('Kick member error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal mengeluarkan member.'
        });
    }
}

export async function promoteMember(sock, groupId, args) {
    try {
        if (args.length < 2) {
            return await sock.sendMessage(groupId, {
                text: '❌ Format salah! Gunakan: .promote @tag'
            });
        }
        
        const mentionedJid = args[1].replace('@', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(groupId, [mentionedJid], 'promote');
        
        await sock.sendMessage(groupId, {
            text: `👑 ${args[1]} sekarang menjadi admin group!`
        });
    } catch (error) {
        console.error('Promote error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal menjadikan admin.'
        });
    }
}

export async function demoteMember(sock, groupId, args) {
    try {
        if (args.length < 2) {
            return await sock.sendMessage(groupId, {
                text: '❌ Format salah! Gunakan: .demote @tag'
            });
        }
        
        const mentionedJid = args[1].replace('@', '') + '@s.whatsapp.net';
        await sock.groupParticipantsUpdate(groupId, [mentionedJid], 'demote');
        
        await sock.sendMessage(groupId, {
            text: `📉 ${args[1]} diturunkan dari admin!`
        });
    } catch (error) {
        console.error('Demote error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal menurunkan admin.'
        });
    }
}

export async function hiddenTag(sock, groupId, args) {
    try {
        const text = args.slice(1).join(' ') || 'Halo semua!';
        
        // Mendapatkan semua member group
        const groupMetadata = await sock.groupMetadata(groupId);
        const participants = groupMetadata.participants.map(p => p.id);
        
        // Mengirim pesan dengan mention tersembunyi
        await sock.sendMessage(groupId, {
            text: text,
            mentions: participants
        });
    } catch (error) {
        console.error('Hidden tag error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal mengirim hidden tag.'
        });
    }
}

export async function tagAll(sock, groupId) {
    try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participants = groupMetadata.participants;
        
        let mentionText = '👥 *TAG ALL MEMBER*\n\n';
        participants.forEach((participant, index) => {
            mentionText += `@${participant.id.split('@')[0]}\n`;
        });
        
        await sock.sendMessage(groupId, {
            text: mentionText,
            mentions: participants.map(p => p.id)
        });
    } catch (error) {
        console.error('Tag all error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal tag all.'
        });
    }
}

export async function setWelcome(sock, groupId, args) {
    try {
        const status = args[1]?.toLowerCase();
        
        if (!status || !['on', 'off'].includes(status)) {
            return await sock.sendMessage(groupId, {
                text: '❌ Format salah! Gunakan: .welcome on/off'
            });
        }
        
        let groups = [];
        if (fs.existsSync(groupsPath)) {
            groups = JSON.parse(fs.readFileSync(groupsPath, 'utf-8'));
        }
        
        const groupIndex = groups.findIndex(g => g.id === groupId);
        
        if (groupIndex === -1) {
            groups.push({
                id: groupId,
                welcome: status === 'on',
                welcomeMessage: 'Selamat datang di group!',
                welcomeVideo: 'https://example.com/welcome.mp4'
            });
        } else {
            groups[groupIndex].welcome = status === 'on';
        }
        
        fs.writeFileSync(groupsPath, JSON.stringify(groups, null, 2));
        
        await sock.sendMessage(groupId, {
            text: `✅ Welcome message telah di${status === 'on' ? 'aktifkan' : 'nonaktifkan'}!`
        });
    } catch (error) {
        console.error('Set welcome error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal mengatur welcome message.'
        });
    }
}

export async function handleWelcome(sock, msg, groupId) {
    try {
        const groups = JSON.parse(fs.readFileSync(groupsPath, 'utf-8'));
        const group = groups.find(g => g.id === groupId);
        
        if (!group || !group.welcome) return;
        
        const participant = msg.message?.protocolMessage?.key?.participant;
        if (!participant) return;
        
        const welcomeVideo = group.welcomeVideo || 'https://cdn.dribbble.com/users/464855/screenshots/15303947/media/1e0d52cc0b24e3e1b2c9c.mp4';
        
        // Kirim video welcome
        await sock.sendMessage(groupId, {
            video: { url: welcomeVideo },
            caption: `🎉 *SELAMAT DATANG!*\n\n@${participant.split('@')[0]} bergabung ke group!\n\nSemoga betah ya!`
        });
        
    } catch (error) {
        console.error('Handle welcome error:', error);
    }
}

export async function getGroupLink(sock, groupId) {
    try {
        const inviteCode = await sock.groupInviteCode(groupId);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        
        const message = {
            text: `🔗 *LINK GROUP*\n\n${inviteLink}\n\nLink ini dapat digunakan untuk mengundang orang ke group.`,
            footer: "Share link dengan bijak!",
            buttons: [
                {
                    buttonId: inviteLink,
                    buttonText: { displayText: '📱 Join Group' },
                    type: 3
                }
            ],
            headerType: 1
        };
        
        await sock.sendMessage(groupId, message);
    } catch (error) {
        console.error('Get group link error:', error);
        await sock.sendMessage(groupId, {
            text: '❌ Gagal mendapatkan link group.'
        });
    }
}

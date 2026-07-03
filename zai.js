const util = require("util");
const chalk = require("chalk");
const fs = require("fs");
const axios = require("axios");
const fetch = require("node-fetch");
const ssh2 = require("ssh2");
const { exec, spawn, execSync } = require('child_process');
const {
    default: makeWASocket,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    getContentType,
    jidDecode,
    MessageRetryMap,
    proto,
    delay, 
    Browsers
} = require("@whiskeysockets/baileys");
const LoadDataBase = require("./source/LoadDatabase.js");

const { Primbon } = require('scrape-primbon');
const primbon = new Primbon();

//###############################//

module.exports = async (m, sock) => {
try {
await LoadDataBase(sock, m)
const isCmd = m?.body?.startsWith(m.prefix)
const prefix = '.';
const quoted = m.quoted ? m.quoted : m
const mime = quoted?.msg?.mimetype || quoted?.mimetype || null
const args = m.body.trim().split(/ +/).slice(1)
const qmsg = (m.quoted || m)
const text = q = args.join(" ")
const command = isCmd ? m.body.slice(m.prefix.length).trim().split(' ').shift().toLowerCase() : ''
const cmd = m.prefix + command
const groupMetadata = m?.isGroup ? await sock.groupMetadata(m.chat).catch(() => ({})) : {};
const participants = m?.isGroup ? groupMetadata.participants?.map(p => {
    let admin = null;
    if (p.admin === 'superadmin') admin = 'superadmin';
    if (p.admin === 'admin') admin = 'admin';
    return {
        jid: p.jid || null,
        admin
    };
}) || [] : [];
const botNumber = await sock.user.id.split(":")[0]+"@s.whatsapp.net"
const groupAdmins = participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => p.jid);
const isOwner = global.owner+"@s.whatsapp.net" == m.sender || m.sender == botNumber || db.settings.developer.includes(m.sender)
const isAdmin = m?.isGroup ? groupAdmins.includes(m.sender) : false;
const isBotAdmin = m?.isGroup ? groupAdmins.includes(`${Nezubot}@s.whatsapp.net`) : false;
const isReseller = db.settings.reseller.includes(m.sender)
  m.isGroup = m.chat.endsWith('g.us');
  m.metadata = {};
  m.isAdmin = false;
  m.isBotAdmin = false;
  if (m.isGroup) {
    let meta = await global.groupMetadataCache.get(m.chat)
    if (!meta) meta = await sock.groupMetadata(m.chat).catch(_ => {})
    m.metadata = meta;
    const p = meta?.participants || [];
    m.isAdmin = p?.some(i => (i.id === m.sender || i.jid === m.sender) && i.admin !== null);
    m.isBotAdmin = p?.some(i => (i.id === botNumber || i.jid == botNumber) && i.admin !== null);
  } 
 
let premium = JSON.parse(fs.readFileSync('./Database/PremiumUser.json'));
let energy = JSON.parse(fs.readFileSync('./Database/Energy.json'));
let uang = JSON.parse(fs.readFileSync('./Database/Uang.json'));
let games = JSON.parse(fs.readFileSync('./Database/Games.json', 'utf-8') || '{}');
let groupSettings = {};
try {
    groupSettings = JSON.parse(fs.readFileSync('./Database/GroupSettings.json', 'utf-8'));
} catch {
    groupSettings = {};
}  
 
const bannedGroups = JSON.parse(fs.readFileSync('./Database/BannedGroups.json', 'utf-8') || '[]');   
const isPremium = premium.includes(m.sender);
const userEnergy = energy[m.sender] || 0;
const userMoney = uang[m.sender] || 0;

//###############################//

if (isCmd) {
console.log(chalk.cyan('╭───────────────────────────────────╮'));
console.log(chalk.cyan('│') + chalk.white(' 📩 Message Info                   ') + chalk.cyan('│'));
console.log(chalk.cyan('├───────────────────────────────────┤'));
console.log(chalk.cyan('│') + chalk.white(' Sender  : ') + chalk.green(m.chat.split('@')[0]) + chalk.cyan('         │'));
console.log(chalk.cyan('│') + chalk.white(' Command : ') + chalk.magenta(cmd) + chalk.cyan('                │'));
console.log(chalk.cyan('│') + chalk.white(' Time    : ') + chalk.yellow(new Date().toLocaleTimeString('id-ID')) + chalk.cyan('     │'));
console.log(chalk.cyan('╰───────────────────────────────────╯\n'));
}

//###############################//

if (!isCmd && m.body) {
const responder = db.settings.respon.find(v => v.id.toLowerCase() == m.body.toLowerCase())
if (responder && responder.response) {
console.log(chalk.green('✓ ') + chalk.white('Auto Response triggered: ') + chalk.cyan(m.body));
await m.reply(responder.response)
}}

//###############################//

const FakeChannel = {
  key: {
    remoteJid: 'status@broadcast',
    fromMe: false,
    participant: '0@s.whatsapp.net'
  },
  message: {
    newsletterAdminInviteMessage: {
      newsletterJid: '123@newsletter',
      caption: `Powered By ${global.namaOwner}.`,
      inviteExpiration: 0
    }
  }
}

//###############################//

const FakeSticker = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            stickerPackMessage: {
                stickerPackId: "\000",
                name: `Powered By ${global.namaOwner}.`,
                publisher: "kkkk"
            }
        }
    }


//###############################//

const deletedMessages = new Map();

setInterval(async () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    for (let [chatId, settings] of Object.entries(groupSettings)) {
        if (settings.autoClose && settings.autoOpen) {
            try {
                const metadata = await sock.groupMetadata(chatId);
                const isBotAdmin = metadata.participants.some(p => 
                    p.id === sock.user.id && p.admin
                );
                
                if (!isBotAdmin) continue;
                
                // Tutup grup
                if (currentTime === settings.autoClose) {
                    await sock.groupSettingUpdate(chatId, 'announcement');
                    await sock.sendMessage(chatId, {
                        text: `🔒 *GRUP OTOMATIS DITUTUP*\n\n` +
                             `⏰ Waktu: ${currentTime}\n` +
                             `📢 Grup akan dibuka kembali jam ${settings.autoOpen}\n\n` +
                             `Hanya admin yang bisa kirim pesan.`
                    });
                }
                
                // Buka grup
                if (currentTime === settings.autoOpen) {
                    await sock.groupSettingUpdate(chatId, 'not_announcement');
                    await sock.sendMessage(chatId, {
                        text: `🔓 *GRUP OTOMATIS DIBUKA*\n\n` +
                             `⏰ Waktu: ${currentTime}\n` +
                             `📢 Semua member bisa kirim pesan!\n\n` +
                             `Selamat beraktivitas! 🎉`
                    });
                }
            } catch (err) {
                console.error('Auto Close/Open Error:', err);
            }
        }
    }
}, 60000); // Cek setiap 1 menit    
   
if (!isCmd && m.isGroup && groupSettings[m.chat]?.antivirtex && !isAdmin) {
    const virtexPatterns = [
        /[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]{10,}/g, // Combining marks spam
        /[\u0E00-\u0E7F]{50,}/g, // Thai character spam
        /[\u0600-\u06FF]{100,}/g, // Arabic spam
        /[\uD800-\uDFFF]{20,}/g, // Surrogate pairs spam
        /(ꦾ|ꦿ|⃟){10,}/g, // Indonesian bug
        /(\u200B|\u200C|\u200D|\uFEFF){10,}/g // Zero-width spam
    ];
    
    const isVirtex = virtexPatterns.some(pattern => pattern.test(m.body));
    
    if (isVirtex || m.body.length > 10000) {
        if (isBotAdmin) {
            await sock.sendMessage(m.chat, { delete: m.key });
            await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            await sock.sendMessage(m.chat, {
                text: `🛡️ VIRTEX TERDETEKSI!\n\n@${m.sender.split('@')[0]} dikick karena kirim bug/virtex!\n\n⚠️ Grup ini dilindungi antivirtex!`,
                mentions: [m.sender]
            });
        }
    }
}

if (!isCmd && m.isGroup && groupSettings[m.chat]?.antilink2 && !isAdmin) {
    const linkRegex = /(https?:\/\/|www\.)/gi;
    if (linkRegex.test(m.body)) {
        if (isBotAdmin) {
            await sock.sendMessage(m.chat, { delete: m.key });
            await sock.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            await sock.sendMessage(m.chat, {
                text: `🚫 @${m.sender.split('@')[0]} dikick karena kirim link!\n\n⚠️ Antilink 2 aktif di grup ini!`,
                mentions: [m.sender]
            });
        }
    }
}

if (!isCmd && m.isGroup && groupSettings[m.chat]?.antilink1 && !isAdmin) {
    const linkRegex = /(https?:\/\/|www\.)/gi;
    if (linkRegex.test(m.body)) {
        if (isBotAdmin) {
            await sock.sendMessage(m.chat, { delete: m.key });
            await sock.sendMessage(m.chat, {
                text: `⚠️ Link terdeteksi!\n@${m.sender.split('@')[0]}, pesan kamu dihapus karena mengandung link!`,
                mentions: [m.sender]
            });
        }
    }
}

if (m.isGroup && bannedGroups.includes(m.chat) && isCmd) {
    return; 
}    
    
if (!isCmd && m.body && m.isGroup && games[m.chat]?.lagu) {
    const game = games[m.chat].lagu;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    const correctArtist = game.artis.toLowerCase();
    
    if (game.answered) return;
    
    // Bisa jawab judul saja atau judul + artis
    if (userAnswer === correctAnswer || userAnswer.includes(correctAnswer)) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Judul: *${correctAnswer.toUpperCase()}*\n` +
                 `Artis: *${correctArtist.toUpperCase()}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.tebaklagu* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].lagu;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.lirik) {
    const game = games[m.chat].lirik;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    
    if (game.answered) return;
    
    // Toleransi jawaban (minimal 70% kesamaan)
    const similarity = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
    
    if (userAnswer === correctAnswer || similarity) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Lirik lengkap:\n*${game.soal} ${correctAnswer}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.tebaklirik* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].lirik;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.gambar) {
    const game = games[m.chat].gambar;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    
    if (game.answered) return;
    
    if (userAnswer === correctAnswer) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Jawaban: *${correctAnswer.toUpperCase()}*\n` +
                 `Penjelasan: ${game.deskripsi}\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.tebakgambar* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].gambar;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!global.mode_public && !isOwner && !isPremium && isCmd) {
    return;
}    
    
if (!isCmd && m.body && m.isGroup && games[m.chat]?.bendera) {
    const game = games[m.chat].bendera;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    
    if (game.answered) return;
    
    if (userAnswer === correctAnswer) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Jawaban: *${correctAnswer.toUpperCase()}*\n` +
                 `Bendera: ${game.bendera}\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.tebakbendera* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].bendera;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.math) {
    const game = games[m.chat].math;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toUpperCase();
    const correctAnswer = game.jawaban.toUpperCase();
    
    if (game.answered) return;
    
    if (userAnswer === correctAnswer) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Jawaban: *${correctAnswer}. ${game.pilihan[correctAnswer]}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.math* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].math;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.lengkapi) {
    const game = games[m.chat].lengkapi;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    
    if (game.answered) return;
    
    // Toleransi jawaban (bisa pakai includes atau exact match)
    if (userAnswer === correctAnswer || correctAnswer.includes(userAnswer)) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Kalimat lengkap:\n*${game.soal} ${correctAnswer.toUpperCase()}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.lengkapikalimat* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].lengkapi;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.quiz) {
    const game = games[m.chat].quiz;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toUpperCase();
    const correctAnswer = game.jawaban.toUpperCase();
    
    if (game.answered) return;
    
    if (userAnswer === correctAnswer) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Jawaban: *${correctAnswer}. ${game.pilihan[correctAnswer]}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.quiz* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].quiz;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.ibukota) {
    const game = games[m.chat].ibukota;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    
    if (game.answered) return;
    
    if (userAnswer === correctAnswer) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Jawaban: *${correctAnswer.toUpperCase()}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.tebakibukota* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].ibukota;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.family100) {
    const game = games[m.chat].family100;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    
    // Cek apakah jawaban ada di list
    const jawabanIndex = game.jawaban.findIndex(j => j === userAnswer);
    
    if (jawabanIndex !== -1 && !game.answered.includes(userAnswer)) {
        game.answered.push(userAnswer);
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `✅ *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} menemukan jawaban!\n` +
                 `Jawaban: *${userAnswer.toUpperCase()}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `🎯 Ditemukan: ${game.answered.length}/${game.jawaban.length}\n` +
                 `${game.answered.length === game.jawaban.length ? '🎉 *SEMUA JAWABAN DITEMUKAN!*' : ''}`,
            mentions: [m.sender]
        });
        
        // Kalau semua jawaban sudah ditemukan
        if (game.answered.length === game.jawaban.length) {
            setTimeout(() => {
                delete games[m.chat].family100;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }, 3000);
        }
        
    } else if (game.answered.includes(userAnswer)) {
        await sock.sendMessage(m.chat, {
            text: `⚠️ Jawaban *${userAnswer.toUpperCase()}* sudah ditemukan!`,
        });
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.ceklontong) {
    const game = games[m.chat].ceklontong;
    
    if (!m.quoted || m.quoted.key?.id !== game.gameMessageId) return;
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    
    if (game.answered) return;
    
    if (userAnswer === correctAnswer) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Jawaban: *${correctAnswer.toUpperCase()}*\n` +
                 `Penjelasan: ${game.deskripsi}\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.ceklontong* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].ceklontong;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (!isCmd && m.body && m.isGroup && games[m.chat]?.asahotak) {
    const game = games[m.chat].asahotak;
    
    if (!m.quoted || m.quoted.key.id !== game.gameMessageId) {
        return; // Bukan reply ke pesan game
    }
    
    const userAnswer = m.body.trim().toLowerCase();
    const correctAnswer = game.jawaban.toLowerCase();
    
    if (game.answered) return;
    
    if (userAnswer === correctAnswer) {
        game.answered = true;
        
        if (!energy[m.sender]) energy[m.sender] = 0;
        energy[m.sender] += 1;
        
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *BENAR!*\n\n` +
                 `@${m.sender.split('@')[0]} adalah pemenang!\n` +
                 `Jawaban: *${correctAnswer.toUpperCase()}*\n` +
                 `⚡ Energy: +1 (Total: ${energy[m.sender]})\n\n` +
                 `⏱️ Waktu: ${Math.floor((Date.now() - game.startTime) / 1000)} detik\n\n` +
                 `Ketik *.asahotak* untuk main lagi!`,
            mentions: [m.sender]
        });
        
        delete games[m.chat].asahotak;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
    } else {
        await sock.sendMessage(m.chat, {
            text: `❌ @${m.sender.split('@')[0]}, jawaban salah!\nCoba lagi!`,
            mentions: [m.sender]
        });
    }
}

if (global.db.groups[m.chat]?.antilink === true) {
    const textMessage = m.text || ""
    const groupInviteLinkRegex = /(https?:\/\/)?(www\.)?chat\.whatsapp\.com\/[A-Za-z0-9]+(\?[^\s]*)?/gi
    const links = textMessage.match(groupInviteLinkRegex)
    if (links && !isOwner && !m.isAdmin && m.isBotAdmin) {
        const senderJid = m.sender
        const messageId = m.key.id
        const participantToDelete = m.key.participant || m.sender
        await sock.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: messageId,
                participant: participantToDelete
            }
        })
        await sleep(800)
        await sock.groupParticipantsUpdate(m.chat, [senderJid], "remove")
    }
}

//###############################//

if (global.db.groups[m.chat]?.antilink2 === true) {
    const textMessage = m.text || ""
    const groupInviteLinkRegex = /(https?:\/\/)?(www\.)?chat\.whatsapp\.com\/[A-Za-z0-9]+(\?[^\s]*)?/gi
    const links = textMessage.match(groupInviteLinkRegex)
    if (links && !isOwner && !m.isAdmin && m.isBotAdmin) {
        const messageId = m.key.id
        const participantToDelete = m.key.participant || m.sender
        await sock.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: messageId,
                participant: participantToDelete
            }
        })
    }
}

//###############################//

switch (command) {
case "menu": {
let status = "User";
if (isOwner) status = "Owner";
else if (isPremium) status = "Premium";

const teks = `
Haii @${m.sender.split("@")[0]} 👋
Selamat ${ucapan()}

*# Bot - Information*
- Botmode: ${sock.public ? "Public" : "Self"}
- Runtime: ${runtime(process.uptime())}
- Developer: @${global.owner}
- Energy: ${userEnergy} ⚡
- Money: $${userMoney} 💰
- Status: ${status}

dapetin energy? .claimreward

Silahkan pilih menu di bawah ini!
`;

let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: true, 
                    ...(await prepareWAMessageMedia({ image: { url: global.thumbnail } }, { upload: sock.waUploadToServer })),
                }, 
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "Menu Utama ⬇️",
                                sections: [
                                    {
                                        title: "Pilih Menu",
                                        rows: [
                                            {
                                                title: "Main Menu",
                                                description: "Menampilkan menu utama bot",
                                                id: ".mainmenu"
                                            },
                                            {
                                                title: "Sticker Menu",
                                                description: "Menu untuk membuat sticker",
                                                id: ".stickermenu"
                                            },
                                            {
                                                title: "Download Menu",
                                                description: "Menu untuk download media",
                                                id: ".downloadmenu"
                                            },
                                            {
                                                title: "RPG Menu",
                                                description: "Menu permainan RPG",
                                                id: ".rpgmenu"
                                            },
                                            {
                                                title: "Primbon Menu",
                                                description: "Menu ramalan primbon",
                                                id: ".primbonmenu"
                                            },
                                            {
                                                title: "Group Menu",
                                                description: "Menu untuk manage grup",
                                                id: ".groupmenu"
                                            },
                                            {
                                                title: "Game Menu",
                                                description: "Menu permainan seru",
                                                id: ".gamemenu"
                                            },
                                            {
                                                title: "Owner Menu",
                                                description: "Menu khusus owner bot",
                                                id: ".ownermenu"
                                            }
                                        ]
                                    }
                                ]
                            })
                        },
                        {
                            name: "single_select",
                            buttonParamsJson: JSON.stringify({
                                title: "Layanan Otp Service ⬇️",
                                sections: [
                                    {
                                        title: "Layanan OTP",
                                        rows: [
                                            {
                                                title: "Service Menu",
                                                description: "Menu layanan OTP service",
                                                id: ".servicemenu"
                                            },
                                            {
                                                title: "Deposit",
                                                description: "Deposit saldo OTP",
                                                id: ".deposit"
                                            }
                                        ]
                                    }
                                ]
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: `{"display_text":"Contact Owner","id":".owner"}`
                        },
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Channel WhatsApp","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g","merchant_url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                        }
                    ]
                },
                contextInfo: {
                    mentionedJid: [m.sender, global.owner + "@s.whatsapp.net"]
                }
            }
        }
    }
}, { userJid: m.sender, quoted: FakeSticker });

await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break

case "rpgmenu": {
    const hour = new Date().getHours();
    let ucapan;
    if (hour < 10) ucapan = "pagi 🌅";
    else if (hour < 15) ucapan = "siang ☀️";
    else if (hour < 18) ucapan = "sore 🌇";
    else ucapan = "malam 🌙";

    const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

乂  *MENU RPG*
┏━━━━━━━━━━⟢
┃ .joinrpg Ⓛ
┃ .profile Ⓛ
┃ .kerja Ⓛ
┃ .jobs Ⓛ
┃ .apply <job> Ⓛ
┃ .duel @tag Ⓛ
┃ .shop Ⓛ
┃ .buy <item> Ⓛ
┃ .inventory Ⓛ
┃ .use <item> Ⓛ
┃ .daily Ⓛ
┃ .leaderboard Ⓛ
┃ .skills Ⓛ
┗━━━━━━━━━━━━⟢

╭━━━━━━━━━━━━━━━━━━━╮
│ Ⓛ = Limit  Ⓟ = Premium  Ⓞ = Owner
╰━━━━━━━━━━━━━━━━━━━╯`;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: global.thumb } 
                        }, { upload: sock.waUploadToServer }))
                    },
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"📱 Menu Utama","id":".menu"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📢 Join Channel","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g","merchant_url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                            }
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363423467233881@newsletter",
                            serverMessageId: 1,
                            newsletterName: "joinrpg"
                        }
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break

case "downloadmenu": {
// Ambil waktu untuk ucapan
const hour = new Date().getHours();
let ucapan;
if (hour < 10) ucapan = "pagi 🌅";
else if (hour < 15) ucapan = "siang ☀️";
else if (hour < 18) ucapan = "sore 🌇";
else ucapan = "malam 🌙";

const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

Selamat malam 🌙 @⁨off⁩

乂  *MENU DOWNLOADER*
┏━━━━━━━━━━⟢
┃ .capcut <url> Ⓛ
┃ .fb <url> Ⓛ
┃ .tiktok <url> Ⓛ
┃ .spotify <url> Ⓛ
┃ .ig Ⓛ
┃ .boxep Ⓛ
┃ .ig <url>
┃ .dlit <platform> <url> Ⓛ
┃ .mediafire <url> Ⓛ
┃ .pindl <url> Ⓛ
┃ .play <judul> Ⓛ
┃ .song <judul> Ⓛ Ⓟ
┃ .sfiledl <url> Ⓛ
┃ .videy <url> Ⓛ
┃ .ytmp3 <url> Ⓛ
┃ .ytmp44
┃ .yts <query> Ⓛ
┃ .ytmp4 <url> Ⓛ
┃ .lahelu <url>
┗━━━━━━━━━━━━⟢`;

// Kirim pesan dengan gambar dan forward channel
let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: true,
                    ...(await prepareWAMessageMedia({ 
                        image: { url: global.thumb } 
                    }, { upload: sock.waUploadToServer }))
                },
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: `{"display_text":"📱 Menu Utama","id":".menu"}`
                        },
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"📢 Join Channel","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g","merchant_url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                        }
                    ]
                },
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363423467233881@newsletter",
                        serverMessageId: 1,
                        newsletterName: "Click Saluran"
                    }
                }
            }
        }
    }
}, { userJid: m.sender, quoted: m });

await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break        

case "ownermenu":
case "ownerm": {
    if (!isOwner) return m.reply("❌ Owner only!");
    
    const hour = new Date().getHours();
    let ucapan;
    if (hour < 10) ucapan = "pagi 🌅";
    else if (hour < 15) ucapan = "siang ☀️";
    else if (hour < 18) ucapan = "sore 🌇";
    else ucapan = "malam 🌙";

    const teks = `Selamat ${ucapan} Owner 👑

乂  *OWNER MENU*
┏━━━━━━━━━━━━━━━━━⟢
┃  📊 BOT SETTINGS
┃  ├ .public / .self
┃  ├ .mode
┃  └ .setjeda
┃  
┃  👤 USER MANAGEMENT
┃  ├ .addprem
┃  ├ .delprem
┃  └ .listprem
┃  
┃  👥 GROUP MANAGEMENT
┃  ├ .bannedgc
┃  ├ .unbangc
┃  ├ .promote
┃  ├ .demote
┃  └ .grup
┃  
┃  🛡️ GROUP PROTECTION
┃  ├ .antilink1
┃  ├ .antilink2
┃  ├ .antibot
┃  ├ .antivirtex
┃  └ .antidelete
┃  
┃  📢 BROADCAST
┃  ├ .jpm / .jpmht
┃  ├ .jpmch
┃  ├ .stopjpm
┃  ├ .pushkontak
┃  └ .stoppush
┃  
┃  ⚙️ OTHER SETTINGS
┃  ├ .addrespon
┃  ├ .delrespon
┃  ├ .listrespon
┃  ├ .bljpm
┃  ├ .delbl
┃  └ .backup
┃  
┃  🌐 PANEL CONTROL
┃  ├ .subdomain
┃  └ .installpanel
┃  
┃  🔧 UTILITIES
┃  ├ .ht
┃  ├ .kick
┃  ├ .savekontak
┃  ├ .save
┃  ├ .tourl
┃  └ .tourl2
┗━━━━━━━━━━━━━━━━━⟢

╭━━━━━━━━━━━━━━━━━━━╮
│ © ${global.namaOwner || "Zlynzee"}
╰━━━━━━━━━━━━━━━━━━━╯`;

    // Kirim sebagai interactive message
    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: global.thumb } 
                        }, { upload: sock.waUploadToServer }))
                    },
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"📱 Menu Utama","id":".menu"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📢 Join Channel","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g","merchant_url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                            }
                        ]
                    },
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363423467233881@newsletter",
                            serverMessageId: 1,
                            newsletterName: "Owner Menu"
                        }
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break        
        
 case "stickermenu": {
// Ambil waktu untuk ucapan
const hour = new Date().getHours();
let ucapan;
if (hour < 10) ucapan = "pagi 🌅";
else if (hour < 15) ucapan = "siang ☀️";
else if (hour < 18) ucapan = "sore 🌇";
else ucapan = "malam 🌙";

const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

乂  *MENU STICKER*
┏━━━━━━━━━━⟢
┃ .brat <text>
┃ .bratvid <text>
┃ .sticker
┃ .swm <packname>|<author>
┃ .qc <text>
┃ .bratip <text>
┗━━━━━━━━━━━━⟢

╭━━━━━━━━━━━━━━━━━━━╮
│ Ⓛ = Limit  Ⓟ = Premium  Ⓞ = Owner
╰━━━━━━━━━━━━━━━━━━━╯`;

// Kirim pesan dengan gambar dan forward channel
let msg = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                header: {
                    hasMediaAttachment: true,
                    ...(await prepareWAMessageMedia({ 
                        image: { url: global.thumb } 
                    }, { upload: sock.waUploadToServer }))
                },
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: `{"display_text":"📱 Menu Utama","id":".menu"}`
                        },
                        {
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Click disini","url":"${global.idchannel}","merchant_url":"${global.idchannel}"}`
                        }
                    ]
                },
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363423467233881@newsletter",
                        serverMessageId: 1,
                        newsletterName: "Click disini"
                    }
                }
            }
        }
    }
}, { userJid: m.sender, quoted: m });

await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break      
 
case "primbonmenu":
case "primbon": {
    const hour = new Date().getHours();
    let ucapan;
    if (hour < 10) ucapan = "pagi 🌅";
    else if (hour < 15) ucapan = "siang ☀️";
    else if (hour < 18) ucapan = "sore 🌇";
    else ucapan = "malam 🌙";

    const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

乂  *MENU PRIMBON*
┏━━━━━━━━━━⟢
┃ .cekkhodam <nama> Ⓛ
┃ .artinama <nama> Ⓛ
┃ .ramalanjodoh <nama1>,<hari1>,<bulan1>,<tahun1>,<nama2>,<hari2>,<bulan2>,<tahun2> Ⓛ
┃ .ramalanjodohbali <nama1>,<hari1>,<bulan1>,<tahun1>,<nama2>,<hari2>,<bulan2>,<tahun2> Ⓛ
┃ .suamiistri <nama1>,<hari1>,<bulan1>,<tahun1>,<nama2>,<hari2>,<bulan2>,<tahun2> Ⓛ
┃ .ramalancinta <nama1>,<hari1>,<bulan1>,<tahun1>,<nama2>,<hari2>,<bulan2>,<tahun2> Ⓛ
┃ .kecocokannama <nama>,<hari>,<bulan>,<tahun> Ⓛ
┃ .kecocokanpasangan <nama1>,<hari1>,<bulan1>,<tahun1>,<nama2>,<hari2>,<bulan2>,<tahun2> Ⓛ
┃ .tafsirmimpi <mimpi> Ⓛ
┃ .nomerhoki <nomor> Ⓛ
┃ .memancingrejeki <hari>,<bulan>,<tahun> Ⓛ
┃ .pekerjaanweton <hari>,<bulan>,<tahun> Ⓛ
┃ .rejekiweton <hari>,<bulan>,<tahun> Ⓛ
┃ .sifatusaha <hari>,<bulan>,<tahun> Ⓛ
┗━━━━━━━━━━━━⟢

╭━━━━━━━━━━━━━━━━━━━╮
│ Ⓛ = Limit (1 Energy)  Ⓟ = Premium  Ⓞ = Owner
╰━━━━━━━━━━━━━━━━━━━╯`;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: global.thumb } 
                        }, { upload: sock.waUploadToServer }))
                    },
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"📱 Menu Utama","id":".menu"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📢 Join Channel","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g","merchant_url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                            }
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363423467233881@newsletter",
                            serverMessageId: 1,
                            newsletterName: "Powered By Skyzopedia"
                        }
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break
        
//###############################//

case "addrespon": {
if (!isOwner) return m.reply(mess.owner)
if (!text || !text.includes("|")) return m.reply(`*Contoh :* ${cmd} cmd|response`)
let [ id, response ] = text.split("|")
id = id.toLowerCase()
const res = db.settings.respon
if (res.find(v => v.id.toLowerCase() == id)) return m.reply(`Cmd ${id} sudah terdaftar dalam listrespon\nGunakan Cmd lain!`)
db.settings.respon.push({
id, 
response
})
return m.reply(`*Sukses Menambah Listrespon ✅*

- Cmd: ${id}
- Response: ${response}`)
}
break

//###############################//

case "listrespon": {
if (db.settings.respon.length < 1) return m.reply("Tidak ada listrespon.")
let teks = ""
for (let i of db.settings.respon) {
teks += `\n- *Cmd:* ${i.id}
- *Response:* ${i.response}\n`
}
return m.reply(teks)
}
break

//###############################//

case "delrespon": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`*Contoh :* ${cmd} cmdnya`)
if (text.toLowerCase() == "all") {
db.settings.respon = []
return m.reply(`Berhasil menghapus semua Cmd Listrespon ✅`)
}
let res = db.settings.respon.find(v => v.id == text.toLowerCase())
if (!res) return m.reply(`Cmd Respon Tidak Ditemukan!\nKetik *.listrespon* Untuk Melihat Semua Cmd Listrespon`)
const posi = db.settings.respon.indexOf(res)
db.settings.respon.splice(posi, 1)
return m.reply(`Berhasil menghapus Cmd Listrespon *${text}* ✅`)
}
break

//###############################//

case "bljpm": case "bl": {
if (!isOwner) return m.reply(mess.owner);
let rows = []
const a = await sock.groupFetchAllParticipating()
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `ID - ${u.id}`, 
id: `.bljpm-response ${u.id}|${name}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Salah Grup Chat\n`
}, { quoted: m })
}
break

//###############################//

case "bljpm-response": {
if (!isOwner) return m.reply(mess.owner)
if (!text || !text.includes("|")) return
const [ id, grupName ] = text.split("|")
if (db.settings.bljpm.includes(id)) return m.reply(`Grup ${grupName} sudah terdaftar dalam Blacklist Jpm`)
db.settings.bljpm.push(id)
return m.reply(`Berhasil Blacklist Grup ${grupName} Dari Jpm`)
}
break

//###############################//

case "delbl":
case "delbljpm": {
    if (!isOwner) return m.reply(mess.owner);

    if (db.settings.bljpm.length < 1) 
        return m.reply("Tidak ada data blacklist grup.");

    const groups = await sock.groupFetchAllParticipating();
    const Data = Object.values(groups);

    let rows = [];
    // opsi hapus semua
    rows.push({
        title: "🗑️ Hapus Semua",
        description: "Hapus semua grup dari blacklist",
        id: `.delbl-response all`
    });

    for (let id of db.settings.bljpm) {
        let name = "Unknown";
        // cari nama grup dari daftar grup aktif
        let grup = Data.find(g => g.id === id);
        if (grup) name = grup.subject || "Unknown";

        rows.push({
            title: name,
            description: `ID Grup - ${id}`,
            id: `.delbl-response ${id}|${name}`
        });
    }

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { 
                        text: `Pilih Grup Untuk Dihapus Dari Blacklist\n\nTotal Blacklist: ${db.settings.bljpm.length}` 
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Daftar Blacklist Grup",
                                    sections: [
                                        {
                                            title: "Blacklist Terdaftar",
                                            rows: rows
                                        }
                                    ]
                                })
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//

case "delbl-response": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return;

    if (text === "all") {
        db.settings.bljpm = [];
        return m.reply("✅ Semua data blacklist grup berhasil dihapus.");
    }

    if (text.includes("|")) {
        const [id, grupName] = text.split("|");
        if (!db.settings.bljpm.includes(id)) 
            return m.reply(`❌ Grup *${grupName}* tidak ada dalam blacklist.`);

        db.settings.bljpm = db.settings.bljpm.filter(g => g !== id);
        return m.reply(`✅ Grup *${grupName}* berhasil dihapus dari blacklist.`);
    }
}
break;

case "swm": {
    // Cek apakah ada gambar yang dikirim atau di-reply
    const quotedMime = m.quoted?.msg?.mimetype || m.quoted?.mimetype;
    const isImage = quotedMime?.includes('image') || mime?.includes('image');
    
    if (!isImage) {
        return m.reply(`Kirim/Reply foto dengan caption: ${cmd} Packname|Author`);
    }
    
    if (!text || !text.includes('|')) {
        return m.reply(`Format: ${cmd} Packname|Author\nContoh: ${cmd} MyStickerPack|MyName`);
    }
    
    // Potong energy
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) {
            return m.reply(`⚠️ Energy tidak cukup!\n⚡ Energy: ${energy[m.sender]}\n💎 Dibutuhkan: 1 Energy\n✨ Upgrade ke Premium untuk unlimited akses!`);
        }
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const [packname, author] = text.split('|').map(s => s.trim());
        
        // Ambil dari quoted atau dari message langsung
        const mediaObj = m.quoted || m;
        const mediaPath = await sock.downloadAndSaveMediaMessage(mediaObj);
        
        await sock.sendStimg(m.chat, mediaPath, m, {
            packname: packname,
            author: author,
            categories: ['🤖', '🎨']
        });
        
        fs.unlinkSync(mediaPath);
        
    } catch (err) {
        console.error('SWM Error:', err);
        m.reply(`❌ Gagal membuat sticker dengan metadata: ${err.message}`);
    }
}
break
 
case "cekkhodam": {
    if (!text) return m.reply(`Contoh: ${cmd} Ahmad`);
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    const khodamList = [
        '🐯 Macan Putih', '🐉 Naga Hitam', '🦅 Elang Jawa',
        '🐍 Ular Naga', '🦁 Singa Barong', '🐺 Serigala Putih',
        '🐴 Kuda Sembrani', '👼 Malaikat Pelindung', '👹 Jin Ifrit',
        '🦇 Kelelawar Malam', '🐊 Buaya Putih', '🦚 Merak Emas',
        '🐅 Harimau Sumatera', '🦌 Rusa Bercahaya', '🦊 Rubah Putih',
        '❌ Kosong (Tidak Ada Khodam)'
    ];
    
    const random = khodamList[Math.floor(Math.random() * khodamList.length)];
    
    let replyText = `*🔮 CEK KHODAM*\n\n`;
    replyText += `👤 Nama: ${text}\n`;
    replyText += `✨ Khodam: ${random}\n\n`;
    
    if (random.includes('Kosong')) {
        replyText += `❌ Maaf, kamu tidak memiliki khodam pendamping.`;
    } else {
        replyText += `🌟 Khodam yang menjaga dan melindungimu!`;
    }
    
    m.reply(replyText);
}
break;

case "antilink1": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    const status = text?.toLowerCase();
    if (!status || !['on', 'off'].includes(status)) {
        return m.reply(`Contoh: ${prefix}antilink1 on/off`);
    }
    
    if (!groupSettings[m.chat]) groupSettings[m.chat] = {};
    groupSettings[m.chat].antilink1 = status === 'on';
    
    fs.writeFileSync('./Database/GroupSettings.json', JSON.stringify(groupSettings, null, 2));
    
    m.reply(`✅ Antilink 1 berhasil di${status === 'on' ? 'aktifkan' : 'nonaktifkan'}!\n\n${status === 'on' ? '⚠️ Pesan dengan link akan otomatis dihapus' : '✅ Link diperbolehkan'}`);
}
break;        
   
case "antilink2": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    const status = text?.toLowerCase();
    if (!status || !['on', 'off'].includes(status)) {
        return m.reply(`Contoh: ${prefix}antilink2 on/off`);
    }
    
    if (!groupSettings[m.chat]) groupSettings[m.chat] = {};
    groupSettings[m.chat].antilink2 = status === 'on';
    
    fs.writeFileSync('./Database/GroupSettings.json', JSON.stringify(groupSettings, null, 2));
    
    m.reply(`✅ Antilink 2 berhasil di${status === 'on' ? 'aktifkan' : 'nonaktifkan'}!\n\n${status === 'on' ? '⚠️ Yang kirim link akan dikick otomatis!' : '✅ Link diperbolehkan'}`);
}
break;        
  
case "antibot": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    const status = text?.toLowerCase();
    if (!status || !['on', 'off'].includes(status)) {
        return m.reply(`Contoh: ${prefix}antibot on/off`);
    }
    
    if (!groupSettings[m.chat]) groupSettings[m.chat] = {};
    groupSettings[m.chat].antibot = status === 'on';
    
    fs.writeFileSync('./Database/GroupSettings.json', JSON.stringify(groupSettings, null, 2));
    
    m.reply(`✅ Antibot berhasil di${status === 'on' ? 'aktifkan' : 'nonaktifkan'}!\n\n${status === 'on' ? '🤖 Bot lain akan dikick otomatis!' : '✅ Bot lain diperbolehkan'}`);
}
break;        

case "addprem": {
    if (!isOwner) return m.reply("❌ Owner only!");
    
    let targetUser;
    
    if (m.quoted && m.quoted.sender) {
        targetUser = m.quoted.sender;
    } else {
        return m.reply(`❌ Reply pesan user yang mau di addprem!\nContoh: reply pesan user lalu ketik ${prefix}addprem`);
    }
    
    let premium = JSON.parse(fs.readFileSync('./Database/PremiumUser.json'));
    
    if (premium.includes(targetUser)) {
        return m.reply(`❌ User sudah premium!`);
    }
    
    premium.push(targetUser);
    
    fs.writeFileSync('./Database/PremiumUser.json', JSON.stringify(premium, null, 2));
    
    m.reply(`✅ Berhasil addprem!`);
}
break

case "delprem": {
    if (!isOwner) return m.reply("❌ Owner only!");
    
    let targetUser;
    
    if (m.quoted && m.quoted.sender) {
        targetUser = m.quoted.sender;
    } else {
        return m.reply(`❌ Reply pesan user yang mau di delprem!\nContoh: reply pesan user lalu ketik ${prefix}delprem`);
    }
    
    let premium = JSON.parse(fs.readFileSync('./Database/PremiumUser.json'));
    
    if (!premium.includes(targetUser)) {
        return m.reply(`❌ User tidak ditemukan di premium list!`);
    }
    
    premium = premium.filter(user => user !== targetUser);
    
    fs.writeFileSync('./Database/PremiumUser.json', JSON.stringify(premium, null, 2));
    
    m.reply(`✅ Berhasil delprem!`);
}
break

case "listprem": {
    if (!isOwner) return m.reply("❌ Owner only!");
    
    let premium = JSON.parse(fs.readFileSync('./Database/PremiumUser.json'));
    
    if (premium.length === 0) {
        return m.reply("📭 Premium list kosong!");
    }
    
    let listText = `📋 *PREMIUM LIST*\n\n`;
    listText += `Total: ${premium.length} user\n\n`;
    
    premium.forEach((user, index) => {
        const number = user.split('@')[0];
        listText += `${index + 1}. ${number}\n`;
    });
    
    m.reply(listText);
}
break
                 
case "public": {
    if (!isOwner) return;
    
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");
    
    global.mode_public = true;
    sock.public = true;
    
    let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = true");
    fs.writeFileSync(path, newData, "utf-8");
    
    return m.reply("✅ Mode berhasil diubah menjadi *Public*");
}
break

case "self": {
    if (!isOwner) return;
    
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");
    
    global.mode_public = false;
    sock.public = false;
    
    let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = false");
    fs.writeFileSync(path, newData, "utf-8");
    
    return m.reply("✅ Mode berhasil diubah menjadi *Self*");
}
break

case "botmode":
case "mode": {
    const currentMode = global.mode_public ? "PUBLIC" : "SELF";
    
    const teks = `🤖 *BOT MODE*\n\n` +
                `Mode saat ini: *${currentMode}*\n\n` +
                `Perintah untuk mengubah mode:\n` +
                `${prefix}public - Ubah ke mode public\n` +
                `${prefix}self - Ubah ke mode self`;
    
    m.reply(teks);
}
break        
        
case "antivirtex": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    const status = text?.toLowerCase();
    if (!status || !['on', 'off'].includes(status)) {
        return m.reply(`Contoh: ${prefix}antivirtex on/off`);
    }
    
    if (!groupSettings[m.chat]) groupSettings[m.chat] = {};
    groupSettings[m.chat].antivirtex = status === 'on';
    
    fs.writeFileSync('./Database/GroupSettings.json', JSON.stringify(groupSettings, null, 2));
    
    m.reply(`✅ Antivirtex berhasil di${status === 'on' ? 'aktifkan' : 'nonaktifkan'}!\n\n${status === 'on' ? '🛡️ Bug/Virtex akan dihapus & pelaku dikick!' : '✅ Proteksi dinonaktifkan'}`);
}
break;        

 case "antidelete": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    
    const status = text?.toLowerCase();
    if (!status || !['on', 'off'].includes(status)) {
        return m.reply(`Contoh: ${prefix}antidelete on/off`);
    }
    
    if (!groupSettings[m.chat]) groupSettings[m.chat] = {};
    groupSettings[m.chat].antidelete = status === 'on';
    
    fs.writeFileSync('./Database/GroupSettings.json', JSON.stringify(groupSettings, null, 2));
    
    m.reply(`✅ Antidelete berhasil di${status === 'on' ? 'aktifkan' : 'nonaktifkan'}!\n\n${status === 'on' ? '🔍 Bot akan kirim ulang pesan yang dihapus' : '✅ Antidelete dinonaktifkan'}`);
}
break;      
 
case "promote": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    let users = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
        ? m.quoted.sender 
        : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    
    if (!users) return m.reply("❌ Tag atau reply orangnya!");
    
    try {
        await sock.groupParticipantsUpdate(m.chat, [users], 'promote');
        m.reply(`✅ Berhasil promote @${users.split('@')[0]} menjadi admin!`, null, { mentions: [users] });
    } catch (err) {
        console.error('Promote Error:', err);
        m.reply("❌ Gagal promote! Pastikan bot adalah admin.");
    }
}
break;        
 
case "demote": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    let users = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
        ? m.quoted.sender 
        : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    
    if (!users) return m.reply("❌ Tag atau reply orangnya!");
    
    try {
        await sock.groupParticipantsUpdate(m.chat, [users], 'demote');
        m.reply(`✅ Berhasil demote @${users.split('@')[0]} menjadi member!`, null, { mentions: [users] });
    } catch (err) {
        console.error('Demote Error:', err);
        m.reply("❌ Gagal demote! Pastikan bot adalah admin.");
    }
}
break;        

case "grup":
case "group": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    const status = text?.toLowerCase();
    if (!status || !['open', 'close'].includes(status)) {
        return m.reply(`Contoh:\n${prefix}grup open\n${prefix}grup close`);
    }
    
    try {
        await sock.groupSettingUpdate(m.chat, status === 'open' ? 'not_announcement' : 'announcement');
        m.reply(`✅ Grup berhasil di${status === 'open' ? 'buka' : 'tutup'}!\n\n${status === 'open' ? '🔓 Semua member bisa kirim pesan' : '🔒 Hanya admin yang bisa kirim pesan'}`);
    } catch (err) {
        console.error('Grup Error:', err);
        m.reply("❌ Gagal mengubah setting grup!");
    }
}
break;        
  
case "closegcauto":
case "autogc": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    if (!isAdmin && !isOwner) return m.reply("❌ Khusus admin!");
    if (!isBotAdmin) return m.reply("❌ Bot harus jadi admin!");
    
    if (!text) return m.reply(`Contoh: ${prefix}closegcauto 00:00 | 06:00\n\nFormat: Jam Tutup | Jam Buka`);
    
    const [closeTime, openTime] = text.split('|').map(t => t.trim());
    
    if (!closeTime || !openTime) {
        return m.reply(`❌ Format salah!\nContoh: ${prefix}closegcauto 00:00 | 06:00`);
    }
    
    // Validasi format waktu
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(closeTime) || !timeRegex.test(openTime)) {
        return m.reply("❌ Format waktu salah! Gunakan format HH:MM (24 jam)");
    }
    
    if (!groupSettings[m.chat]) groupSettings[m.chat] = {};
    groupSettings[m.chat].autoClose = closeTime;
    groupSettings[m.chat].autoOpen = openTime;
    
    fs.writeFileSync('./Database/GroupSettings.json', JSON.stringify(groupSettings, null, 2));
    
    m.reply(`✅ Auto Close/Open berhasil diatur!\n\n🔒 Tutup: ${closeTime}\n🔓 Buka: ${openTime}\n\n⏰ Bot akan otomatis tutup/buka grup sesuai jadwal!`);
}
break;        
        
case "artinama": {
    if (!text) return m.reply(`Contoh: ${cmd} Ahmad`);
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.arti_nama(text);
        
        let replyText = `*📛 ARTI NAMA*\n\n`;
        replyText += `Nama: ${result.nama || text}\n`;
        replyText += `Arti: ${result.arti || 'Tidak ditemukan'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Artinama Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "ramalanjodoh": {
    if (!text) return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    
    const [nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2] = text.split(',').map(v => v.trim());
    
    if (!nama1 || !hari1 || !bulan1 || !tahun1 || !nama2 || !hari2 || !bulan2 || !tahun2) {
        return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.ramalan_jodoh(nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2);
        
        let replyText = `*💑 RAMALAN JODOH*\n\n`;
        replyText += `Nama Anda: ${result.nama_anda || nama1}\n`;
        replyText += `Tanggal: ${result.tgl_lahir_anda || `${hari1}-${bulan1}-${tahun1}`}\n`;
        replyText += `Nama Pasangan: ${result.nama_pasangan || nama2}\n`;
        replyText += `Tanggal: ${result.tgl_lahir_pasangan || `${hari2}-${bulan2}-${tahun2}`}\n\n`;
        replyText += `💖 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Ramalan Jodoh Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "ceklontong":
case "caklontong": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/caklontong');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].ceklontong = {
            soal: gameData.soal,
            jawaban: gameData.jawaban.toLowerCase(),
            deskripsi: gameData.deskripsi,
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `🤔 *GAME CAK LONTONG*\n\n` +
                 `📝 *Soal:* ${gameData.soal}\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan jawaban\n` +
                 `• Pemenang dapat +1 Energy\n` +
                 `• Waktu: 30 detik\n\n` +
                 `⏰ Reply dengan jawaban!`
        }, { quoted: m });
        
        games[m.chat].ceklontong.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.ceklontong && !games[m.chat].ceklontong.answered) {
                const jawaban = games[m.chat].ceklontong.jawaban;
                const deskripsi = games[m.chat].ceklontong.deskripsi;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban: *${jawaban.toUpperCase()}*\n` +
                         `Penjelasan: ${deskripsi}\n\n` +
                         `Ketik *.ceklontong* untuk main lagi!`
                });
                
                delete games[m.chat].ceklontong;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('Ceklontong Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "bannedgc": {
    if (!isOwner) return m.reply("❌ Owner only!");
    
    if (!m.isGroup) {
        return m.reply("❌ Command ini hanya bisa digunakan di grup!");
    }
    
    let bannedGroups = JSON.parse(fs.readFileSync('./Database/BannedGroups.json', 'utf-8') || '[]');
    
    if (bannedGroups.includes(m.chat)) {
        return m.reply("❌ Grup ini sudah di banned!");
    }
    
    bannedGroups.push(m.chat);
    
    fs.writeFileSync('./Database/BannedGroups.json', JSON.stringify(bannedGroups, null, 2));
    
    m.reply(`✅ Grup ini berhasil di banned!\n\nMember tidak dapat menggunakan bot di grup ini.`);
}
break

case "unbangc":
case "unbannedgc": {
    if (!isOwner) return m.reply("❌ Owner only!");
    
    if (!m.isGroup) {
        return m.reply("❌ Command ini hanya bisa digunakan di grup!");
    }
    
    let bannedGroups = JSON.parse(fs.readFileSync('./Database/BannedGroups.json', 'utf-8') || '[]');
    
    if (!bannedGroups.includes(m.chat)) {
        return m.reply("❌ Grup ini belum di banned!");
    }
    
    bannedGroups = bannedGroups.filter(group => group !== m.chat);
    
    fs.writeFileSync('./Database/BannedGroups.json', JSON.stringify(bannedGroups, null, 2));
    
    m.reply(`✅ Grup ini berhasil di unbanned!\n\nMember dapat menggunakan bot kembali.`);
}
break        
        
case "family100": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/family100');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        const jawabanList = gameData.jawaban.map(j => j.toLowerCase());
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].family100 = {
            soal: gameData.soal,
            jawaban: jawabanList,
            answered: [],
            startedBy: m.sender,
            startTime: Date.now(),
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `👨‍👩‍👧‍👦 *GAME FAMILY 100*\n\n` +
                 `📝 *Soal:* ${gameData.soal}\n\n` +
                 `🎯 *Tebak 4 jawaban yang benar!*\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan jawaban\n` +
                 `• Setiap jawaban benar: +1 Energy\n` +
                 `• Waktu: 60 detik\n\n` +
                 `⏰ Tebak jawabannya!`
        }, { quoted: m });
        
        games[m.chat].family100.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.family100) {
                const jawaban = games[m.chat].family100.jawaban;
                const answered = games[m.chat].family100.answered;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban yang benar:\n` +
                         `${jawaban.map(j => `• ${j.toUpperCase()}`).join('\n')}\n\n` +
                         `✅ Ditemukan: ${answered.length}/4\n` +
                         `Ketik *.family100* untuk main lagi!`
                });
                
                delete games[m.chat].family100;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 60000);
        
    } catch (error) {
        console.error('Family100 Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "tebakibukota":
case "ibukota": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/ibukota');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].ibukota = {
            soal: gameData.soal,
            jawaban: gameData.jawaban.toLowerCase(),
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `🏛️ *GAME TEBAK IBU KOTA*\n\n` +
                 `📝 *Soal:* ${gameData.soal}\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan jawaban\n` +
                 `• Pemenang dapat +1 Energy\n` +
                 `• Waktu: 30 detik\n\n` +
                 `⏰ Reply dengan jawaban!`
        }, { quoted: m });
        
        games[m.chat].ibukota.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.ibukota && !games[m.chat].ibukota.answered) {
                const jawaban = games[m.chat].ibukota.jawaban;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban: *${jawaban.toUpperCase()}*\n\n` +
                         `Ketik *.tebakibukota* untuk main lagi!`
                });
                
                delete games[m.chat].ibukota;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('Ibukota Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "quiz":
case "kuis": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/kuis');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].quiz = {
            soal: gameData.question,
            pilihan: gameData.choices,
            jawaban: gameData.correctAnswer,
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const pilihanText = Object.entries(gameData.choices)
            .map(([key, value]) => `${key}. ${value}`)
            .join('\n');
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `🧠 *GAME QUIZ*\n\n` +
                 `📝 *Soal:* ${gameData.question}\n\n` +
                 `📋 *Pilihan:*\n${pilihanText}\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan huruf (A/B/C)\n` +
                 `• Pemenang dapat +1 Energy\n` +
                 `• Waktu: 30 detik\n\n` +
                 `⏰ Pilih A, B, atau C!`
        }, { quoted: m });
        
        games[m.chat].quiz.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.quiz && !games[m.chat].quiz.answered) {
                const jawaban = games[m.chat].quiz.jawaban;
                const benar = gameData.choices[jawaban];
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban: *${jawaban}. ${benar}*\n\n` +
                         `Ketik *.quiz* untuk main lagi!`
                });
                
                delete games[m.chat].quiz;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('Quiz Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "lengkapikalimat": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/lengkapikalimat');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].lengkapi = {
            soal: gameData.soal,
            jawaban: gameData.jawaban.toLowerCase(),
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `📝 *GAME LENGKAPI KALIMAT*\n\n` +
                 `📝 *Soal:* ${gameData.soal}\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan kelanjutan kalimat\n` +
                 `• Pemenang dapat +1 Energy\n` +
                 `• Waktu: 30 detik\n\n` +
                 `⏰ Lengkapi kalimatnya!`
        }, { quoted: m });
        
        games[m.chat].lengkapi.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.lengkapi && !games[m.chat].lengkapi.answered) {
                const jawaban = games[m.chat].lengkapi.jawaban;
                const soal = games[m.chat].lengkapi.soal;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Kalimat lengkap:\n` +
                         `*${soal} ${jawaban.toUpperCase()}*\n\n` +
                         `Ketik *.lengkapikalimat* untuk main lagi!`
                });
                
                delete games[m.chat].lengkapi;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('Lengkapi Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "math":
case "matematika": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/math');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].math = {
            soal: gameData.question,
            pilihan: gameData.choices,
            jawaban: gameData.correctAnswer,
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const pilihanText = Object.entries(gameData.choices)
            .map(([key, value]) => `${key}. ${value}`)
            .join('\n');
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `🧮 *GAME MATEMATIKA*\n\n` +
                 `📝 *Soal:* ${gameData.question}\n\n` +
                 `📋 *Pilihan:*\n${pilihanText}\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan huruf (A/B/C)\n` +
                 `• Pemenang dapat +1 Energy\n` +
                 `• Waktu: 30 detik\n\n` +
                 `⏰ Hitung dengan benar!`
        }, { quoted: m });
        
        games[m.chat].math.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.math && !games[m.chat].math.answered) {
                const jawaban = games[m.chat].math.jawaban;
                const benar = gameData.choices[jawaban];
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban: *${jawaban}. ${benar}*\n\n` +
                         `Ketik *.math* untuk main lagi!`
                });
                
                delete games[m.chat].math;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('Math Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "tebakbendera":
case "bendera": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/tebak/bendera');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].bendera = {
            bendera: gameData.flag,
            gambar: gameData.img,
            jawaban: gameData.name.toLowerCase(),
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            image: { url: gameData.img },
            caption: `🇺🇳 *GAME TEBAK BENDERA*\n\n` +
                    `⚡ *Rules:*\n` +
                    `• Reply pesan ini dengan nama negara\n` +
                    `• Pemenang dapat +1 Energy\n` +
                    `• Waktu: 30 detik\n\n` +
                    `⏰ Bendera negara apa ini?`
        }, { quoted: m });
        
        games[m.chat].bendera.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.bendera && !games[m.chat].bendera.answered) {
                const jawaban = games[m.chat].bendera.jawaban;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban: *${jawaban.toUpperCase()}*\n` +
                         `Kode bendera: ${gameData.flag}\n\n` +
                         `Ketik *.tebakbendera* untuk main lagi!`
                });
                
                delete games[m.chat].bendera;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('Bendera Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "tebakgambar": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/tebak/gambar');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].gambar = {
            gambar: gameData.img,
            jawaban: gameData.jawaban.toLowerCase(),
            deskripsi: gameData.deskripsi,
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            image: { url: gameData.img },
            caption: `🖼️ *GAME TEBAK GAMBAR*\n\n` +
                    `⚡ *Rules:*\n` +
                    `• Reply pesan ini dengan jawaban\n` +
                    `• Pemenang dapat +1 Energy\n` +
                    `• Waktu: 45 detik\n\n` +
                    `⏰ Apa maksud gambar ini?`
        }, { quoted: m });
        
        games[m.chat].gambar.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.gambar && !games[m.chat].gambar.answered) {
                const jawaban = games[m.chat].gambar.jawaban;
                const deskripsi = games[m.chat].gambar.deskripsi;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban: *${jawaban.toUpperCase()}*\n\n` +
                         `Penjelasan:\n${deskripsi}\n\n` +
                         `Ketik *.tebakgambar* untuk main lagi!`
                });
                
                delete games[m.chat].gambar;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 45000);
        
    } catch (error) {
        console.error('Gambar Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "tebaklirik":
case "lirik": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/tebak/lirik');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].lirik = {
            soal: gameData.soal,
            jawaban: gameData.jawaban.toLowerCase(),
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `🎵 *GAME TEBAK LIRIK*\n\n` +
                 `📝 *Lirik:* ${gameData.soal}\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan kelanjutan lirik\n` +
                 `• Pemenang dapat +1 Energy\n` +
                 `• Waktu: 30 detik\n\n` +
                 `⏰ Lanjutkan liriknya!`
        }, { quoted: m });
        
        games[m.chat].lirik.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.lirik && !games[m.chat].lirik.answered) {
                const jawaban = games[m.chat].lirik.jawaban;
                const soal = games[m.chat].lirik.soal;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Lirik lengkap:\n` +
                         `*${soal} ${jawaban}*\n\n` +
                         `Ketik *.tebaklirik* untuk main lagi!`
                });
                
                delete games[m.chat].lirik;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('Lirik Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "groupmenu":
case "grupmenu": {
    if (!m.isGroup) return m.reply("❌ Fitur ini khusus grup!");
    
    const hour = new Date().getHours();
    let ucapan;
    if (hour < 10) ucapan = "pagi 🌅";
    else if (hour < 15) ucapan = "siang ☀️";
    else if (hour < 18) ucapan = "sore 🌇";
    else ucapan = "malam 🌙";

    const groupMeta = await sock.groupMetadata(m.chat);
    const groupName = groupMeta.subject;
    const totalMembers = groupMeta.participants.length;
    
    // Status fitur grup
    const settings = groupSettings[m.chat] || {};
    const antilink1Status = settings.antilink1 ? '✅ ON' : '❌ OFF';
    const antilink2Status = settings.antilink2 ? '✅ ON' : '❌ OFF';
    const antibotStatus = settings.antibot ? '✅ ON' : '❌ OFF';
    const antivirtexStatus = settings.antivirtex ? '✅ ON' : '❌ OFF';
    const antideleteStatus = settings.antidelete ? '✅ ON' : '❌ OFF';
    const autoCloseOpen = settings.autoClose && settings.autoOpen 
        ? `✅ ${settings.autoClose} | ${settings.autoOpen}` 
        : '❌ OFF';

    const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

╭━━━━『 *GROUP INFO* 』━━━━╮
│ 👥 Nama: ${groupName}
│ 📊 Member: ${totalMembers}
│ 🤖 Bot: ${isBotAdmin ? 'Admin ✅' : 'Member ❌'}
│ 👤 Kamu: ${isAdmin ? 'Admin ✅' : 'Member ❌'}
╰━━━━━━━━━━━━━━━━━━╯

乂  *MENU GROUP ADMIN*
┏━━━━━━━━━━⟢
┃ .promote Ⓐ
┃ .demote Ⓐ
┃ .grup open/close Ⓐ
┗━━━━━━━━━━━━⟢

乂  *MENU PROTEKSI GRUP*
┏━━━━━━━━━━⟢
┃ .antilink1 on/off Ⓐ
┃ .antilink2 on/off Ⓐ
┃ .antibot on/off Ⓐ
┃ .antivirtex on/off Ⓐ
┃ .antidelete on/off Ⓐ
┃ .closegcauto time|time Ⓐ
┗━━━━━━━━━━━━⟢

╭━━━『 *STATUS PROTEKSI* 』━━━╮
│ 🔗 Antilink 1: ${antilink1Status}
│ 🔗 Antilink 2: ${antilink2Status}
│ 🤖 Antibot: ${antibotStatus}
│ 🛡️ Antivirtex: ${antivirtexStatus}
│ 🔍 Antidelete: ${antideleteStatus}
│ ⏰ Auto Close/Open: ${autoCloseOpen}
╰━━━━━━━━━━━━━━━━━━╯

╭━━━━━━━━━━━━━━━━━━━╮
│ Ⓐ = Admin  Ⓞ = Owner
╰━━━━━━━━━━━━━━━━━━━╯`;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: global.thumb } 
                        }, { upload: sock.waUploadToServer }))
                    },
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"📱 Menu Utama","id":"${prefix}menu"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📢 Join Channel","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g","merchant_url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                            }
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363423467233881@newsletter",
                            serverMessageId: 1,
                            newsletterName: "Click Saluran"
                        }
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;        
        
case "tebaklagu":
case "lagu": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/tebak/lagu');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].lagu = {
            lagu: gameData.lagu,
            jawaban: gameData.judul.toLowerCase(),
            artis: gameData.artis.toLowerCase(),
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            audio: { url: gameData.lagu },
            mimetype: 'audio/mp4',
            ptt: true,
            caption: `🎶 *GAME TEBAK LAGU*\n\n` +
                    `⚡ *Rules:*\n` +
                    `• Reply pesan ini dengan judul lagu\n` +
                    `• Pemenang dapat +1 Energy\n` +
                    `• Waktu: 45 detik\n\n` +
                    `⏰ Judul lagu apa ini?`
        }, { quoted: m });
        
        games[m.chat].lagu.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.lagu && !games[m.chat].lagu.answered) {
                const jawaban = games[m.chat].lagu.jawaban;
                const artis = games[m.chat].lagu.artis;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Judul: *${jawaban.toUpperCase()}*\n` +
                         `Artis: *${artis.toUpperCase()}*\n\n` +
                         `Ketik *.tebaklagu* untuk main lagi!`
                });
                
                delete games[m.chat].lagu;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 45000);
        
    } catch (error) {
        console.error('Lagu Error:', error);
        m.reply("❌ Error!");
    }
}
break

case "asahotak":
case "tebak": {
    if (!m.isGroup) return m.reply("❌ Game hanya bisa di grup!");
    
    try {
        const response = await fetch('https://api.vreden.my.id/api/v1/game/asahotak');
        const data = await response.json();
        
        if (!data.status) return m.reply("❌ Gagal ambil soal!");
        
        const gameData = data.result;
        
        if (!games[m.chat]) games[m.chat] = {};
        
        games[m.chat].asahotak = {
            soal: gameData.soal,
            jawaban: gameData.jawaban.toLowerCase(),
            startedBy: m.sender,
            startTime: Date.now(),
            answered: false,
            gameMessageId: null
        };
        
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        const gameMsg = await sock.sendMessage(m.chat, {
            text: `🧠 *GAME ASAH OTAK*\n\n` +
                 `📝 *Soal:* ${gameData.soal}\n\n` +
                 `⚡ *Rules:*\n` +
                 `• Reply pesan ini dengan jawaban\n` +
                 `• Pemenang dapat +1 Energy\n` +
                 `• Waktu: 30 detik\n\n` +
                 `⏰ Reply dengan jawaban!`
        }, { quoted: m });
        
        games[m.chat].asahotak.gameMessageId = gameMsg.key.id;
        fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
        
        setTimeout(async () => {
            if (games[m.chat]?.asahotak && !games[m.chat].asahotak.answered) {
                const jawaban = games[m.chat].asahotak.jawaban;
                
                await sock.sendMessage(m.chat, {
                    text: `⏰ *WAKTU HABIS!*\n\n` +
                         `Jawaban: *${jawaban.toUpperCase()}*\n` +
                         `Tidak ada yang benar 😢\n\n` +
                         `Ketik *.asahotak* untuk main lagi!`
                });
                
                delete games[m.chat].asahotak;
                fs.writeFileSync('./Database/Games.json', JSON.stringify(games, null, 2));
            }
        }, 30000);
        
    } catch (error) {
        console.error('AsahOtak Error:', error);
        m.reply("❌ Error!");
    }
}
break      
        
case "ramalanjodohbali": {
    if (!text) return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    
    const [nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2] = text.split(',').map(v => v.trim());
    
    if (!nama1 || !hari1 || !bulan1 || !tahun1 || !nama2 || !hari2 || !bulan2 || !tahun2) {
        return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.ramalan_jodoh_bali(nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2);
        
        let replyText = `*🌺 RAMALAN JODOH BALI*\n\n`;
        replyText += `Nama 1: ${result.nama_anda || nama1}\n`;
        replyText += `Nama 2: ${result.nama_pasangan || nama2}\n\n`;
        replyText += `🔮 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Ramalan Jodoh Bali Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "suamiistri": {
    if (!text) return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    
    const [nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2] = text.split(',').map(v => v.trim());
    
    if (!nama1 || !hari1 || !bulan1 || !tahun1 || !nama2 || !hari2 || !bulan2 || !tahun2) {
        return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.suami_istri(nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2);
        
        let replyText = `*💏 RAMALAN SUAMI ISTRI*\n\n`;
        replyText += `Suami: ${result.suami?.nama || nama1}\n`;
        replyText += `Istri: ${result.istri?.nama || nama2}\n\n`;
        replyText += `📝 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Suami Istri Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "ramalancinta": {
    if (!text) return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    
    const [nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2] = text.split(',').map(v => v.trim());
    
    if (!nama1 || !hari1 || !bulan1 || !tahun1 || !nama2 || !hari2 || !bulan2 || !tahun2) {
        return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.ramalan_cinta(nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2);
        
        let replyText = `*❤️ RAMALAN CINTA*\n\n`;
        replyText += `💑 ${result.nama_anda || nama1} ❤️ ${result.nama_pasangan || nama2}\n\n`;
        replyText += `📖 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Ramalan Cinta Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "kecocokannama": {
    if (!text) return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005`);
    
    const [nama, hari, bulan, tahun] = text.split(',').map(v => v.trim());
    
    if (!nama || !hari || !bulan || !tahun) {
        return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.kecocokan_nama(nama, hari, bulan, tahun);
        
        let replyText = `*📊 KECOCOKAN NAMA*\n\n`;
        replyText += `Nama: ${result.nama || nama}\n`;
        replyText += `Tanggal: ${result.tgl_lahir || `${hari}-${bulan}-${tahun}`}\n\n`;
        replyText += `🔢 Life Path Number: ${result.life_path_number || '-'}\n`;
        replyText += `🔢 Destiny Number: ${result.destiny_number || '-'}\n`;
        replyText += `💖 Heart's Desire: ${result.heart_desire_number || '-'}\n`;
        replyText += `👤 Personality: ${result.personality_number || '-'}\n\n`;
        replyText += `📈 Persentase Kecocokan:\n${result.persentase_kecocokan || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Kecocokan Nama Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "kecocokanpasangan": {
    if (!text) return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    
    const [nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2] = text.split(',').map(v => v.trim());
    
    if (!nama1 || !hari1 || !bulan1 || !tahun1 || !nama2 || !hari2 || !bulan2 || !tahun2) {
        return m.reply(`Contoh: ${cmd} Dika, 7, 7, 2005, Novia, 1, 12, 2004`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.kecocokan_nama_pasangan(nama1, hari1, bulan1, tahun1, nama2, hari2, bulan2, tahun2);
        
        let replyText = `*💞 KECOCOKAN NAMA PASANGAN*\n\n`;
        replyText += `👤 ${result.nama_anda || nama1}\n`;
        replyText += `👤 ${result.nama_pasangan || nama2}\n\n`;
        replyText += `💯 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Kecocokan Pasangan Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "tafsirmimpi":
case "artimimpi": {
    if (!text) return m.reply(`Contoh: ${cmd} ular`);
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.tafsir_mimpi(text);
        
        let replyText = `*🌙 TAFSIR MIMPI*\n\n`;
        replyText += `Mimpi: ${text}\n\n`;
        replyText += `📖 Tafsir:\n${result.message || 'Tidak ditemukan'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Tafsir Mimpi Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "nomerhoki": {
    if (!text) return m.reply(`Contoh: ${cmd} 6281234567890`);
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.nomer_hoki(text);
        
        let replyText = `*🎰 NOMER HOKI*\n\n`;
        replyText += `Nomor: ${result.nomer || text}\n\n`;
        replyText += `🍀 Keberuntungan:\n${result.message || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Nomer Hoki Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "memancingrejeki": {
    if (!text) return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    
    const [hari, bulan, tahun] = text.split(',').map(v => v.trim());
    
    if (!hari || !bulan || !tahun) {
        return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.memancing_rejeki(hari, bulan, tahun);
        
        let replyText = `*🎣 MEMANCING REJEKI*\n\n`;
        replyText += `Tanggal: ${result.tanggal || `${hari}-${bulan}-${tahun}`}\n\n`;
        replyText += `💰 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Memancing Rejeki Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "pekerjaanweton": {
    if (!text) return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    
    const [hari, bulan, tahun] = text.split(',').map(v => v.trim());
    
    if (!hari || !bulan || !tahun) {
        return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.pekerjaan_weton_lahir(hari, bulan, tahun);
        
        let replyText = `*💼 PEKERJAAN BERDASARKAN WETON*\n\n`;
        replyText += `Tanggal: ${result.tanggal || `${hari}-${bulan}-${tahun}`}\n\n`;
        replyText += `🏢 Pekerjaan:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Pekerjaan Weton Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "rejekiweton": {
    if (!text) return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    
    const [hari, bulan, tahun] = text.split(',').map(v => v.trim());
    
    if (!hari || !bulan || !tahun) {
        return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.rejeki_hoki_weton(hari, bulan, tahun);
        
        let replyText = `*💰 REJEKI & HOKI WETON*\n\n`;
        replyText += `Tanggal: ${result.tanggal || `${hari}-${bulan}-${tahun}`}\n\n`;
        replyText += `🍀 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Rejeki Weton Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;

case "sifatusaha": {
    if (!text) return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    
    const [hari, bulan, tahun] = text.split(',').map(v => v.trim());
    
    if (!hari || !bulan || !tahun) {
        return m.reply(`Contoh: ${cmd} 7, 7, 2005`);
    }
    
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) return m.reply(`⚠️ Energy tidak cukup!`);
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const result = await primbon.sifat_usaha_tanggal_lahir(hari, bulan, tahun);
        
        let replyText = `*🏪 SIFAT USAHA BERDASARKAN LAHIR*\n\n`;
        replyText += `Tanggal: ${result.tanggal || `${hari}-${bulan}-${tahun}`}\n\n`;
        replyText += `📊 Hasil:\n${result.result || 'Tidak tersedia'}\n`;
        
        m.reply(replyText);
        
    } catch (err) {
        console.error('Sifat Usaha Error:', err);
        m.reply(`❌ Terjadi kesalahan: ${err.message}`);
    }
}
break;
        
case "tiktok": {
if (!text) return m.reply("Masukkan URL TikTok!\n\nContoh: .tiktok https://vt.tiktok.com/ZSxxx");

// Reload energy terbaru
if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

// Cek premium dan energy
if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh video TikTok...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://apiz.rafzsoffc.cloud/download/tiktok-v2?apikey=zlynzeeapi&url=${url}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh video TikTok!");
    
    const data = json.result.data;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*TIKTOK DOWNLOADER*

👤 Author: ${data.author.nickname} (@${data.author.unique_id})
📝 Title: ${data.title}

📊 Statistics:
❤️ Likes: ${data.digg_count.toLocaleString()}
💬 Comments: ${data.comment_count.toLocaleString()}
🔄 Shares: ${data.share_count.toLocaleString()}
👁️ Views: ${data.play_count.toLocaleString()}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    // Kirim video dengan button
    await sock.sendMessage(m.chat, {
        video: { url: data.play },
        caption: caption,
        contextInfo: {
            externalAdReply: {
                title: "TIKTOK DOWNLOADER",
                body: data.author.nickname,
                thumbnailUrl: data.cover,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
    // Kirim button terpisah
    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: "Pilih opsi di bawah ini:" },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"🎵 Download Audio","id":".ttmp3 ${text}"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📺 Lihat di TikTok","url":"${text}","merchant_url":"${text}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });
    
    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh video!");
}
}
break

case "bratvid": {
    if (!text) return m.reply(`*Contoh :* ${cmd} aku cinta kamu`);
    
    // Cek energy untuk non-premium
    if (!isPremium) {
        if (!energy[m.sender]) energy[m.sender] = 0;
        if (energy[m.sender] < 1) {
            return m.reply(`⚠️ Energy tidak cukup!\n⚡ Energy: ${energy[m.sender]}\n💎 Dibutuhkan: 1 Energy\n✨ Upgrade ke Premium untuk unlimited akses!`);
        }
        energy[m.sender] -= 1;
        fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
    }
    
    try {
        const words = text.split(' ');
        const frames = [];
        
        for (let i = 1; i <= words.length; i++) {
            const currentText = words.slice(0, i).join(' ');
            const frameUrl = `https://aqul-brat.hf.space/?text=${encodeURIComponent(currentText)}`;
            frames.push(frameUrl);
        }
        
        for (let i = 0; i < 5; i++) {
            frames.push(`https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`);
        }
        
        const frameBuffers = [];
        for (const url of frames) {
            const response = await fetch(url);
            if (response.ok) {
                const buffer = await response.buffer();
                frameBuffers.push(buffer);
            }
        }
        
        if (frameBuffers.length === 0) throw new Error('Tidak ada frame');
        
        const tempDir = `./temp/bratvid_${Date.now()}`;
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const framePaths = [];
        for (let i = 0; i < frameBuffers.length; i++) {
            const framePath = `${tempDir}/frame_${i.toString().padStart(3, '0')}.png`;
            fs.writeFileSync(framePath, frameBuffers[i]);
            framePaths.push(framePath);
        }
        
        const outputVideo = `${tempDir}/output.mp4`;
        
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -framerate 3 -i "${tempDir}/frame_%03d.png" -c:v libx264 -pix_fmt yuv420p -vf "scale=512:512" "${outputVideo}"`, 
                (error) => {
                    if (error) reject(error);
                    else resolve();
                }
            );
        });
        
        await sock.sendStimg(m.chat, outputVideo, m, { 
            packname: "AsuNet", 
            author: m.pushName || "User"
        });
        
        // Cleanup
        for (const path of framePaths) fs.unlinkSync(path);
        fs.unlinkSync(outputVideo);
        fs.rmdirSync(tempDir);
        
    } catch (err) {
        console.error('Bratvid Error:', err);
        m.reply(`❌ Gagal membuat video sticker`);
        
        // Kembalikan energy jika gagal
        if (!isPremium) {
            energy[m.sender] += 1;
            fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
        }
    }
}
break
                           
case "ttmp3": {
if (!text) return m.reply("Masukkan URL TikTok!\n\nContoh: .ttmp3 https://vt.tiktok.com/ZSxxx");

// Reload energy terbaru
if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

// Cek premium dan energy
if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🎵 Sedang mengunduh audio TikTok...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://apiz.rafzsoffc.cloud/download/tiktok-v2?apikey=zlynzeeapi&url=${url}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh audio TikTok!");
    
    const data = json.result.data;
    const newEnergy = energy[m.sender] || 0;
    
    // Kirim audio
    await sock.sendMessage(m.chat, {
        audio: { url: data.music },
        mimetype: 'audio/mpeg',
        ptt: true,
        contextInfo: {
            externalAdReply: {
                title: data.music_info.title,
                body: data.music_info.author,
                thumbnailUrl: data.music_info.cover,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
    if (!isPremium) {
        m.reply(`✅ Audio berhasil dikirim!\n\n⚡ Energy: ${currentEnergy} → ${newEnergy}`);
    }
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh audio!");
}
}
break
 
case "joinrpg": {
    if (!m.isGroup) {
        return m.reply("❌ RPG hanya bisa diakses di grup!");
    }
    
    const userId = m.sender;
    if (rpg[userId]) {
        return m.reply("✅ Kamu sudah bergabung dengan RPG!");
    }
    
    // Inisialisasi user
    rpg[userId] = {
        level: 1,
        exp: 0,
        exp_next: 100,
        hp: 100,
        max_hp: 100,
        energy: 50,
        max_energy: 50,
        attack: 10,
        defense: 5,
        gold: 500,
        job: "Pengangguran",
        job_level: 0,
        inventory: { "Potion": 3, "Makanan": 5, "Pedang Kayu": 1 },
        skills: ["Basic Attack"],
        joined: Date.now(),
        last_daily: 0,
        last_work: 0,
        pvp_wins: 0,
        pvp_losses: 0
    };
    
    fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
    
    const joinedrpg = `🎮 *SELAMAT DATANG DI RPG WORLD*\n\n` +
                     `@${m.sender.split('@')[0]} kamu telah menjadi petualang baru!\n\n` +
                     `📊 Status Awal:\n` +
                     `• Level: 1\n` +
                     `• Gold: 500\n` +
                     `• HP: 100/100\n` +
                     `• Energy: 50/50\n` +
                     `• Job: Pengangguran\n\n` +
                     `🔥 Fitur tersedia:\n` +
                     `• .kerja - Cari gold\n` +
                     `• .duel @tag - Battle\n` +
                     `• .shop - Beli item\n` +
                     `• .inventory - Lihat barang\n` +
                     `• .daily - Klaim harian\n` +
                     `• .profile - Lihat status\n\n` +
                     `Ketik *.rpghelp* untuk panduan lengkap!`;
    
    await sock.sendMessage(m.chat, {
        text: joinedrpg,
        contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363423467233881@newsletter",
                serverMessageId: 1,
                newsletterName: "Skyzopedia RPG"
            },
            externalAdReply: {
                title: "🎮 RPG ADVENTURE",
                body: "Start Your Journey Now!",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, {
        quoted: m
    });
}
break

case "rpghelp": {
    const helpText = `🎮 *MENU RPG*\n\n` +
                   `📊 STATUS & INFO:\n` +
                   `.profile - Lihat status karakter\n` +
                   `.inventory - Lihat inventory\n` +
                   `.skills - Lihat skill yang dipunya\n` +
                   `.leaderboard - Ranking player\n\n` +
                   `💼 PEKERJAAN:\n` +
                   `.kerja - Kerja cari gold (cooldown 5m)\n` +
                   `.jobs - Lihat lowongan kerja\n` +
                   `.apply <job> - Apply pekerjaan\n\n` +
                   `⚔️ BATTLE & PVP:\n` +
                   `.duel @tag - Duel lawan player\n` +
                   `.train - Latih skill (cooldown 1h)\n\n` +
                   `🛒 SHOP & ITEM:\n` +
                   `.shop - Buka toko\n` +
                   `.buy <item> <qty> - Beli item\n` +
                   `.use <item> - Pakai item\n\n` +
                   `✨ LAINNYA:\n` +
                   `.daily - Klaim reward harian\n` +
                   `.rpgmenu - Menu ini\n\n` +
                   `⚡ Energy dibutuhkan untuk semua aksi\n` +
                   `💎 Premium: Unlimited access`;
    
    await sock.sendMessage(m.chat, {
        text: helpText,
        contextInfo: {
            externalAdReply: {
                title: "📖 RPG GUIDE",
                body: "Complete Game Guide",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "profile":
case "stats": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    const user = rpg[m.sender];
    const expPercent = Math.round((user.exp / user.exp_next) * 100);
    const progressBar = '█'.repeat(Math.floor(expPercent/5)) + '░'.repeat(20 - Math.floor(expPercent/5));
    
    const profileText = `🎮 *PROFILE RPG*\n\n` +
                       `👤 Player: @${m.sender.split('@')[0]}\n` +
                       `⭐ Level: ${user.level}\n` +
                       `📊 EXP: ${user.exp}/${user.exp_next} [${progressBar}] ${expPercent}%\n` +
                       `❤️ HP: ${user.hp}/${user.max_hp}\n` +
                       `⚡ Energy: ${user.energy}/${user.max_energy}\n` +
                       `💰 Gold: ${user.gold}\n` +
                       `💼 Job: ${user.job} (Lv.${Math.floor(user.job_level * 10)/10})\n` +
                       `🗡️ Attack: ${user.attack}\n` +
                       `🛡️ Defense: ${user.defense}\n` +
                       `⚔️ PvP: ${user.pvp_wins || 0}W/${user.pvp_losses || 0}L\n` +
                       `🎯 Skills: ${user.skills.length}\n` +
                       `📅 Joined: ${new Date(user.joined).toLocaleDateString('id-ID')}`;
    
    await sock.sendMessage(m.chat, {
        text: profileText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "📊 PLAYER STATS",
                body: `Level ${user.level} ${user.job}`,
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "jobs": {
    const jobsText = `💼 *DAFTAR PEKERJAAN*\n\n` +
                   `1. *Tukang Kebun* (Req: Level 1)\n` +
                   `   💰 Gaji: 50-100 Gold\n` +
                   `   ⚡ Energy: 10\n` +
                   `   📊 Chance: 80%\n\n` +
                   `2. *Penambang* (Req: Level 5)\n` +
                   `   💰 Gaji: 100-200 Gold\n` +
                   `   ⚡ Energy: 15\n` +
                   `   📊 Chance: 70%\n\n` +
                   `3. *Pedagang* (Req: Level 10)\n` +
                   `   💰 Gaji: 200-400 Gold\n` +
                   `   ⚡ Energy: 20\n` +
                   `   📊 Chance: 60%\n\n` +
                   `4. *Kesatria* (Req: Level 15)\n` +
                   `   💰 Gaji: 400-800 Gold\n` +
                   `   ⚡ Energy: 25\n` +
                   `   📊 Chance: 50%\n\n` +
                   `🔧 Cara kerja:\n` +
                   `• .apply <nama_job> - Apply pekerjaan\n` +
                   `• .kerja - Kerja sesuai job sekarang\n` +
                   `• Semakin tinggi level, semakin banyak pilihan\n` +
                   `• Job level naik dengan bekerja\n` +
                   `• Energy regenerasi 1 per menit`;
    
    await sock.sendMessage(m.chat, {
        text: jobsText,
        contextInfo: {
            externalAdReply: {
                title: "💼 JOB LIST",
                body: "Choose Your Career Path",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "apply": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    if (!text) {
        return m.reply("❌ Contoh: .apply \"Tukang Kebun\"\nLihat .jobs untuk daftar lengkap");
    }
    
    const user = rpg[m.sender];
    const jobName = text.trim();
    
    // Cek requirements
    const jobReqs = {
        "Tukang Kebun": { level: 1, gold: 100 },
        "Penambang": { level: 5, gold: 500 },
        "Pedagang": { level: 10, gold: 1000 },
        "Kesatria": { level: 15, gold: 2000 }
    };
    
    const req = jobReqs[jobName];
    if (!req) {
        return m.reply("❌ Job tidak ditemukan! Ketik .jobs untuk melihat daftar");
    }
    
    if (user.level < req.level) {
        return m.reply(`❌ Level ${user.level} tidak cukup! Butuh level ${req.level} untuk jadi ${jobName}`);
    }
    
    if (user.gold < req.gold) {
        return m.reply(`❌ Gold tidak cukup! Butuh ${req.gold} Gold, kamu punya ${user.gold}`);
    }
    
    // Apply job
    user.gold -= req.gold;
    user.job = jobName;
    user.job_level = 1;
    
    fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
    
    const successText = `🎉 *JOB APPLIED!*\n\n` +
                       `Selamat! Kamu sekarang seorang:\n` +
                       `💼 **${jobName}**\n\n` +
                       `📊 Job Level: 1\n` +
                       `💸 Biaya: ${req.gold} Gold\n` +
                       `💰 Gold sekarang: ${user.gold}\n\n` +
                       `🔥 Sekarang kamu bisa kerja dengan:\n` +
                       `• .kerja - Mulai bekerja\n` +
                       `• Naikkan job level untuk gaji lebih besar!\n` +
                       `• Job level naik setiap kali kerja sukses`;
    
    await sock.sendMessage(m.chat, {
        text: successText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "💼 JOB ACCEPTED",
                body: `Welcome ${jobName}!`,
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "kerja":
case "work": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    const user = rpg[m.sender];
    
    if (user.job === "Pengangguran") {
        return m.reply("❌ Kamu belum punya pekerjaan! Gunakan .apply <job_name>");
    }
    
    // Check cooldown (5 menit)
    if (user.last_work && Date.now() - user.last_work < 300000) {
        const minutes = Math.ceil((300000 - (Date.now() - user.last_work)) / 60000);
        return m.reply(`⏳ Cooldown kerja! Tunggu ${minutes} menit lagi.`);
    }
    
    if (user.energy < 10) {
        return m.reply(`❌ Energy tidak cukup! Butuh 10, kamu punya ${user.energy}\nEnergy regenerasi 1 per menit`);
    }
    
    user.energy -= 10;
    user.last_work = Date.now();
    
    // Hitung gaji berdasarkan job
    const jobRates = {
        "Tukang Kebun": { min: 50, max: 100, exp: 5, chance: 80 },
        "Penambang": { min: 100, max: 200, exp: 10, chance: 70 },
        "Pedagang": { min: 200, max: 400, exp: 15, chance: 60 },
        "Kesatria": { min: 400, max: 800, exp: 20, chance: 50 }
    };
    
    const rate = jobRates[user.job] || { min: 30, max: 60, exp: 3, chance: 50 };
    
    // Cek success chance
    const isSuccess = Math.random() * 100 < rate.chance;
    
    if (isSuccess) {
        const earnedGold = Math.floor(Math.random() * (rate.max - rate.min + 1)) + rate.min;
        const earnedExp = rate.exp + Math.floor(Math.random() * 5);
        
        // Bonus berdasarkan job level
        const bonus = Math.floor(earnedGold * (user.job_level * 0.1));
        const totalGold = earnedGold + bonus;
        
        user.gold += totalGold;
        user.exp += earnedExp;
        user.job_level += 0.1;
        
        let resultText = `✅ *KERJA BERHASIL!*\n\n` +
                        `💼 Job: ${user.job}\n` +
                        `💰 Gaji: ${earnedGold} Gold\n` +
                        `✨ Bonus: ${bonus} Gold\n` +
                        `📈 Total: ${totalGold} Gold\n` +
                        `⭐ EXP: +${earnedExp}\n` +
                        `📊 Job Level: +0.1\n` +
                        `⚡ Energy: ${user.energy}/${user.max_energy}\n` +
                        `💳 Gold sekarang: ${user.gold}`;
        
        // Cek level up
        if (user.exp >= user.exp_next) {
            user.level += 1;
            user.exp = user.exp - user.exp_next;
            user.exp_next = Math.floor(user.exp_next * 1.5);
            user.max_hp += 20;
            user.hp = user.max_hp;
            user.max_energy += 5;
            user.attack += 2;
            user.defense += 1;
            
            // Level up bonus
            user.gold += user.level * 100;
            
            resultText += `\n\n🎉 *LEVEL UP!*\n` +
                         `Level: ${user.level - 1} → ${user.level}\n` +
                         `❤️ HP: +20 (${user.max_hp})\n` +
                         `⚡ Energy: +5 (${user.max_energy})\n` +
                         `🗡️ Attack: +2 (${user.attack})\n` +
                         `🛡️ Defense: +1 (${user.defense})\n` +
                         `💰 Bonus: ${user.level * 100} Gold`;
        }
        
        fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: resultText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "💼 WORK COMPLETE",
                    body: `+${totalGold} Gold dari ${user.job}`,
                    thumbnailUrl: global.thumbrpg,
                    sourceUrl: global.linkChannel,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
        
    } else {
        // Work failed
        const penaltyGold = Math.floor(Math.random() * 50) + 10;
        user.gold = Math.max(0, user.gold - penaltyGold);
        
        fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `❌ *KERJA GAGAL!*\n\n` +
                 `💼 Job: ${user.job}\n` +
                 `💸 Penalty: ${penaltyGold} Gold\n` +
                 `⚡ Energy: ${user.energy}/${user.max_energy}\n` +
                 `💰 Gold sekarang: ${user.gold}\n\n` +
                 `📊 Success Chance: ${rate.chance}%\n` +
                 `💡 Tips: Tingkatkan job level untuk peluang lebih baik\n` +
                 `⏰ Coba lagi dalam 5 menit`,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "💼 WORK FAILED",
                    body: "Better luck next time!",
                    thumbnailUrl: global.thumbrpg,
                    sourceUrl: global.linkChannel,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
}
break

case "duel":
case "battle": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply("❌ Tag lawanmu! Contoh: .duel @tag");
    }
    
    const player1 = rpg[m.sender];
    const opponentId = m.mentionedJid[0];
    const opponent = rpg[opponentId];
    
    if (!opponent) {
        return m.reply("❌ Lawan belum join RPG!");
    }
    
    if (m.sender === opponentId) {
        return m.reply("❌ Tidak bisa duel dengan diri sendiri!");
    }
    
    if (player1.energy < 15) {
        return m.reply(`❌ Energy kamu tidak cukup! Butuh 15, kamu punya ${player1.energy}`);
    }
    
    if (opponent.energy < 15) {
        return m.reply("❌ Energy lawan tidak cukup untuk duel!");
    }
    
    player1.energy -= 15;
    opponent.energy -= 15;
    
    // Hitung damage
    const player1Damage = Math.floor(player1.attack * (0.8 + Math.random() * 0.4));
    const opponentDamage = Math.floor(opponent.attack * (0.8 + Math.random() * 0.4));
    
    // Apply defense
    const player1Taken = Math.max(1, opponentDamage - Math.floor(player1.defense / 2));
    const opponentTaken = Math.max(1, player1Damage - Math.floor(opponent.defense / 2));
    
    player1.hp -= player1Taken;
    opponent.hp -= opponentTaken;
    
    // Tentukan pemenang
    let winner = null;
    let loser = null;
    let isDraw = false;
    
    if (player1.hp <= 0 && opponent.hp <= 0) {
        isDraw = true;
        player1.hp = Math.floor(player1.max_hp * 0.1);
        opponent.hp = Math.floor(opponent.max_hp * 0.1);
        player1.pvp_losses = (player1.pvp_losses || 0) + 1;
        opponent.pvp_losses = (opponent.pvp_losses || 0) + 1;
    } else if (player1.hp <= 0) {
        winner = opponentId;
        loser = m.sender;
        opponent.hp = Math.max(1, opponent.hp);
        player1.hp = 0;
        opponent.pvp_wins = (opponent.pvp_wins || 0) + 1;
        player1.pvp_losses = (player1.pvp_losses || 0) + 1;
    } else if (opponent.hp <= 0) {
        winner = m.sender;
        loser = opponentId;
        player1.hp = Math.max(1, player1.hp);
        opponent.hp = 0;
        player1.pvp_wins = (player1.pvp_wins || 0) + 1;
        opponent.pvp_losses = (opponent.pvp_losses || 0) + 1;
    }
    
    fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
    
    if (isDraw) {
        await sock.sendMessage(m.chat, {
            text: `🤝 *DUEL SERI!*\n\n` +
                 `Keduanya jatuh bersamaan!\n\n` +
                 `👤 ${m.sender.split('@')[0]}:\n` +
                 `❤️ HP: ${player1.hp}/${player1.max_hp}\n` +
                 `🗡️ Damage: ${player1Damage}\n` +
                 `💥 Received: ${player1Taken}\n\n` +
                 `👤 ${opponentId.split('@')[0]}:\n` +
                 `❤️ HP: ${opponent.hp}/${opponent.max_hp}\n` +
                 `🗡️ Damage: ${opponentDamage}\n` +
                 `💥 Received: ${opponentTaken}\n\n` +
                 `⚡ Energy: -15 untuk keduanya\n` +
                 `📊 Record: +1 loss untuk keduanya\n` +
                 `💰 Tidak ada yang menang, coba lagi!`,
            contextInfo: {
                mentionedJid: [m.sender, opponentId],
                externalAdReply: {
                    title: "⚔️ BATTLE DRAW",
                    body: "Both warriors fell!",
                    thumbnailUrl: global.thumbrpg,
                    sourceUrl: global.linkChannel,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    } else if (winner) {
        const winnerData = rpg[winner];
        const loserData = rpg[loser];
        
        // Hadiah untuk pemenang
        const rewardGold = Math.max(50, Math.floor(loserData.gold * 0.1));
        const rewardExp = Math.floor(loserData.level * 5);
        
        winnerData.gold += rewardGold;
        winnerData.exp += rewardExp;
        loserData.gold = Math.max(0, loserData.gold - Math.floor(rewardGold * 0.5));
        
        // Level up check untuk pemenang
        if (winnerData.exp >= winnerData.exp_next) {
            winnerData.level += 1;
            winnerData.exp = winnerData.exp - winnerData.exp_next;
            winnerData.exp_next = Math.floor(winnerData.exp_next * 1.5);
            winnerData.max_hp += 20;
            winnerData.hp = winnerData.max_hp;
            winnerData.max_energy += 5;
            winnerData.attack += 2;
            winnerData.defense += 1;
        }
        
        fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
        
        await sock.sendMessage(m.chat, {
            text: `🏆 *DUEL VICTORY!*\n\n` +
                 `🎖️ Pemenang: @${winner.split('@')[0]}\n` +
                 `💀 Kalah: @${loser.split('@')[0]}\n\n` +
                 `⚔️ Battle Stats:\n` +
                 `🗡️ Damage Given: ${winner === m.sender ? player1Damage : opponentDamage}\n` +
                 `❤️ HP Left: ${winnerData.hp}/${winnerData.max_hp}\n\n` +
                 `🎁 Rewards:\n` +
                 `💰 Gold: +${rewardGold}\n` +
                 `⭐ EXP: +${rewardExp}\n` +
                 `📊 Record: +1 win\n\n` +
                 `🔥 Pertarungan epik!`,
            contextInfo: {
                mentionedJid: [winner, loser],
                externalAdReply: {
                    title: "⚔️ VICTORY!",
                    body: `${winner.split('@')[0]} wins the duel!`,
                    thumbnailUrl: global.thumbrpg,
                    sourceUrl: global.linkChannel,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
}
break

case "shop": {
    const shopText = `🛒 *TOKO RPG*\n\n` +
                   `1. **Potion** - 100 Gold\n` +
                   `   ↪️ Restore 50 HP\n\n` +
                   `2. **Makanan** - 50 Gold\n` +
                   `   ↪️ Restore 20 Energy\n\n` +
                   `3. **Pedang Besi** - 500 Gold\n` +
                   `   ↪️ +5 Attack (permanent)\n\n` +
                   `4. **Perisai Kayu** - 300 Gold\n` +
                   `   ↪️ +3 Defense (permanent)\n\n` +
                   `5. **Armor Kulit** - 800 Gold\n` +
                   `   ↪️ +8 Defense, +5 HP (permanent)\n\n` +
                   `6. **Buku Skill** - 1500 Gold\n` +
                   `   ↪️ Learn random skill\n\n` +
                   `🔧 Cara beli:\n` +
                   `.buy <nomor> <jumlah>\n` +
                   `Contoh: .buy 1 3 (beli 3 Potion)\n\n` +
                   `💡 Tips:\n` +
                   `• Equipment meningkatkan stat permanen\n` +
                   `• Potion & Makanan untuk healing\n` +
                   `• Buku Skill memberi skill random`;
    
    await sock.sendMessage(m.chat, {
        text: shopText,
        contextInfo: {
            externalAdReply: {
                title: "🛒 RPG SHOP",
                body: "Upgrade Your Gear!",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "gamemenu":
case "games": {
    const hour = new Date().getHours();
    let ucapan;
    if (hour < 10) ucapan = "pagi 🌅";
    else if (hour < 15) ucapan = "siang ☀️";
    else if (hour < 18) ucapan = "sore 🌇";
    else ucapan = "malam 🌙";

    const userEnergy = energy[m.sender] || 0;

    const teks = `Selamat ${ucapan} @${m.sender.split("@")[0]}

乂  *MENU GAMES*
┏━━━━━━━━━━⟢
┃ .asahotak Ⓛ
┃ .ceklontong Ⓛ
┃ .family100 Ⓛ
┃ .tebakibukota Ⓛ
┃ .quiz Ⓛ
┃ .lengkapikalimat Ⓛ
┃ .math Ⓛ
┃ .tebakbendera Ⓛ
┃ .tebakgambar Ⓛ
┃ .tebaklirik Ⓛ
┃ .tebaklagu Ⓛ
┗━━━━━━━━━━━━⟢

╭━━━━━━━━━━━━━━━━━━━╮
│ Ⓛ = Limit  Ⓟ = Premium  Ⓞ = Owner
│ ⚡ Energy: ${userEnergy}
╰━━━━━━━━━━━━━━━━━━━╯`;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: global.thumb } 
                        }, { upload: sock.waUploadToServer }))
                    },
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"📱 Menu Utama","id":".menu"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📢 Join Channel","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g","merchant_url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                            }
                        ]
                    },
                    contextInfo: {
                        mentionedJid: [m.sender],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: "120363423467233881@newsletter",
                            serverMessageId: 1,
                            newsletterName: "Click Saluran"
                        }
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

case "buy": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    if (!text) {
        return m.reply("❌ Contoh: .buy 1 2 (item nomor 1, jumlah 2)\nLihat .shop untuk daftar item");
    }
    
    const user = rpg[m.sender];
    const [itemNum, quantity] = text.split(' ').map(x => parseInt(x));
    const qty = quantity || 1;
    
    const items = [
        { name: "Potion", price: 100, type: "consumable", effect: "hp" },
        { name: "Makanan", price: 50, type: "consumable", effect: "energy" },
        { name: "Pedang Besi", price: 500, type: "weapon", stat: "attack", value: 5 },
        { name: "Perisai Kayu", price: 300, type: "armor", stat: "defense", value: 3 },
        { name: "Armor Kulit", price: 800, type: "armor", stat: "defense", value: 8, hpBonus: 5 },
        { name: "Buku Skill", price: 1500, type: "skill" }
    ];
    
    if (!itemNum || itemNum < 1 || itemNum > items.length) {
        return m.reply(`❌ Nomor item tidak valid! Pilih 1-${items.length}`);
    }
    
    const item = items[itemNum - 1];
    const totalPrice = item.price * qty;
    
    if (user.gold < totalPrice) {
        return m.reply(`❌ Gold tidak cukup! Butuh ${totalPrice}, kamu punya ${user.gold}`);
    }
    
    user.gold -= totalPrice;
    
    let resultText = "";
    
    if (item.type === "consumable") {
        if (!user.inventory[item.name]) user.inventory[item.name] = 0;
        user.inventory[item.name] += qty;
        
        resultText = `✅ *PURCHASE SUCCESSFUL!*\n\n` +
                    `🛒 Item: ${item.name}\n` +
                    `📦 Quantity: ${qty}\n` +
                    `💰 Total: ${totalPrice} Gold\n` +
                    `📊 Inventory: ${user.inventory[item.name]} ${item.name}\n` +
                    `💳 Remaining Gold: ${user.gold}\n\n` +
                    `Use *.use ${item.name}* to consume`;
                    
    } else if (item.type === "weapon" || item.type === "armor") {
        // Equipment - permanent stat increase
        if (item.stat === "attack") user.attack += item.value * qty;
        else if (item.stat === "defense") user.defense += item.value * qty;
        
        if (item.hpBonus) user.max_hp += item.hpBonus * qty;
        
        resultText = `✅ *EQUIPMENT PURCHASED!*\n\n` +
                    `⚔️ Item: ${item.name}\n` +
                    `📦 Quantity: ${qty}\n` +
                    `💰 Total: ${totalPrice} Gold\n` +
                    `💳 Remaining Gold: ${user.gold}\n\n` +
                    `✨ Stat meningkat:\n` +
                    `${item.stat.toUpperCase()}: +${item.value * qty}` +
                    (item.hpBonus ? `\n❤️ Max HP: +${item.hpBonus * qty}` : "") + `\n\n` +
                    `🔥 Gearmu semakin kuat!`;
                    
    } else if (item.type === "skill") {
        const skills = ["Double Attack", "Power Strike", "Heal", "Shield Bash", "Critical Hit"];
        const newSkill = skills[Math.floor(Math.random() * skills.length)];
        
        if (!user.skills.includes(newSkill)) {
            user.skills.push(newSkill);
            
            resultText = `✅ *SKILL DIPELAJARI!*\n\n` +
                        `📖 Item: ${item.name}\n` +
                        `💰 Price: ${totalPrice} Gold\n` +
                        `💳 Remaining Gold: ${user.gold}\n\n` +
                        `🎯 Skill baru: **${newSkill}**\n\n` +
                        `🔥 Sekarang kamu punya ${user.skills.length} skill!\n` +
                        `Skills: ${user.skills.join(', ')}`;
        } else {
            // Skill sudah ada, beri gold back dan potion bonus
            user.gold += 500;
            if (!user.inventory["Potion"]) user.inventory["Potion"] = 0;
            user.inventory["Potion"] += 2;
            
            resultText = `⚠️ *SKILL SUDAH DIPUNYA!*\n\n` +
                        `Skill ${newSkill} sudah kamu miliki.\n\n` +
                        `🎁 Kompensasi:\n` +
                        `💰 Refund: 500 Gold\n` +
                        `🧪 Potion: +2\n\n` +
                        `💳 Gold sekarang: ${user.gold}\n` +
                        `📦 Potion: ${user.inventory["Potion"]}`;
        }
    }
    
    fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
    
    await sock.sendMessage(m.chat, {
        text: resultText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "🛍️ PURCHASE",
                body: item.type === "consumable" ? `${item.name} x${qty}` : `${item.name} Acquired`,
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "inventory":
case "inv": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    const user = rpg[m.sender];
    let invText = `🎒 *INVENTORY*\n\n`;
    
    const items = Object.entries(user.inventory);
    if (items.length === 0) {
        invText += `📭 Inventory kosong\n`;
        invText += `Beli item di .shop`;
    } else {
        items.forEach(([item, qty]) => {
            invText += `• ${item}: ${qty}\n`;
        });
    }
    
    invText += `\n💰 Gold: ${user.gold}`;
    invText += `\n❤️ HP: ${user.hp}/${user.max_hp}`;
    invText += `\n⚡ Energy: ${user.energy}/${user.max_energy}`;
    invText += `\n🎯 Skills: ${user.skills.length}`;
    
    if (user.skills.length > 0) {
        invText += `\n📋 Skill List: ${user.skills.join(', ')}`;
    }
    
    await sock.sendMessage(m.chat, {
        text: invText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "🎒 INVENTORY",
                body: "Check Your Items",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "use": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    if (!text) {
        return m.reply("❌ Contoh: .use Potion\nLihat .inventory untuk item yang kamu punya");
    }
    
    const user = rpg[m.sender];
    const itemName = text.trim();
    
    if (!user.inventory[itemName] || user.inventory[itemName] < 1) {
        return m.reply(`❌ Kamu tidak punya ${itemName}!`);
    }
    
    user.inventory[itemName] -= 1;
    
    let resultText = "";
    
    if (itemName === "Potion") {
        const healAmount = 50;
        const oldHp = user.hp;
        user.hp = Math.min(user.max_hp, user.hp + healAmount);
        
        resultText = `🧪 *POTION DIGUNAKAN!*\n\n` +
                    `❤️ HP: ${oldHp} → ${user.hp}\n` +
                    `✨ Heal: +${healAmount} HP\n` +
                    `📦 Sisa: ${user.inventory[itemName]} ${itemName}\n\n` +
                    `🔥 Siap bertarung lagi!`;
                    
    } else if (itemName === "Makanan") {
        const energyAmount = 20;
        const oldEnergy = user.energy;
        user.energy = Math.min(user.max_energy, user.energy + energyAmount);
        
        resultText = `🍖 *MAKANAN DIMAKAN!*\n\n` +
                    `⚡ Energy: ${oldEnergy} → ${user.energy}\n` +
                    `✨ Restore: +${energyAmount} Energy\n` +
                    `📦 Sisa: ${user.inventory[itemName]} ${itemName}\n\n` +
                    `💪 Energy penuh lagi!`;
                    
    } else {
        return m.reply(`❌ Item ${itemName} tidak bisa digunakan langsung`);
    }
    
    // Hapus item jika habis
    if (user.inventory[itemName] <= 0) {
        delete user.inventory[itemName];
    }
    
    fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
    
    await sock.sendMessage(m.chat, {
        text: resultText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: itemName === "Potion" ? "🧪 POTION USED" : "🍖 FOOD EATEN",
                body: itemName === "Potion" ? "HP Restored!" : "Energy Restored!",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "daily":
case "claim": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    const user = rpg[m.sender];
    const now = Date.now();
    const lastClaim = user.last_daily || 0;
    const dayInMs = 24 * 60 * 60 * 1000;
    
    if (now - lastClaim < dayInMs) {
        const nextClaim = lastClaim + dayInMs;
        const hoursLeft = Math.ceil((nextClaim - now) / (60 * 60 * 1000));
        
        return m.reply(`⏳ Daily reward sudah diambil hari ini!\nTunggu ${hoursLeft} jam lagi`);
    }
    
    user.last_daily = now;
    
    // Daily rewards
    const goldReward = 200 + (user.level * 10);
    const potionReward = Math.floor(Math.random() * 3) + 1;
    const foodReward = Math.floor(Math.random() * 5) + 2;
    const bonusChance = Math.random() * 100;
    
    user.gold += goldReward;
    if (!user.inventory["Potion"]) user.inventory["Potion"] = 0;
    if (!user.inventory["Makanan"]) user.inventory["Makanan"] = 0;
    user.inventory["Potion"] += potionReward;
    user.inventory["Makanan"] += foodReward;
    
    let bonusText = "";
    let extraGold = 0;
    
    // Streak bonus
    const daysSinceJoin = Math.floor((now - user.joined) / dayInMs);
    if (daysSinceJoin >= 7) {
        extraGold = Math.floor(goldReward * 0.5);
        user.gold += extraGold;
        bonusText = `\n🔥 7-Day Streak Bonus: +${extraGold} Gold`;
    }
    
    // Lucky bonus
    if (bonusChance < 10) {
        const luckyGold = Math.floor(goldReward * 0.3);
        user.gold += luckyGold;
        bonusText += `\n🍀 Lucky Bonus: +${luckyGold} Gold`;
    }
    
    fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
    
    await sock.sendMessage(m.chat, {
        text: `🎁 *DAILY REWARD*\n\n` +
             `💰 Gold: +${goldReward}${extraGold > 0 ? ` (+${extraGold})` : ''}\n` +
             `🧪 Potion: +${potionReward}\n` +
             `🍖 Makanan: +${foodReward}${bonusText}\n\n` +
             `📊 Total Gold: ${user.gold}\n` +
             `📦 Inventory updated!\n\n` +
             `🔥 Come back tomorrow for more!`,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "🎁 DAILY REWARD",
                body: "Claim Successful!",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "leaderboard":
case "top": {
    const players = Object.entries(rpg);
    
    if (players.length === 0) {
        return m.reply("❌ Belum ada player yang join RPG!");
    }
    
    // Sort by level, then gold
    const sortedPlayers = players
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            if (b.gold !== a.gold) return b.gold - a.gold;
            return (b.pvp_wins || 0) - (a.pvp_wins || 0);
        })
        .slice(0, 10);
    
    let leaderboardText = `🏆 *RPG LEADERBOARD*\n\n`;
    
    sortedPlayers.forEach((player, index) => {
        const rankEmoji = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🔸";
        const name = player.id.split('@')[0];
        
        leaderboardText += `${rankEmoji} ${index + 1}. ${name}\n`;
        leaderboardText += `   Level: ${player.level} | Gold: ${player.gold}\n`;
        leaderboardText += `   Job: ${player.job} | Wins: ${player.pvp_wins || 0}\n\n`;
    });
    
    // Check player's rank
    const playerIndex = sortedPlayers.findIndex(p => p.id === m.sender);
    if (playerIndex !== -1) {
        leaderboardText += `📊 Posisimu: ${playerIndex + 1}/${players.length}\n`;
    } else {
        leaderboardText += `📊 Join RPG dengan .joinrpg\n`;
    }
    
    leaderboardText += `\n🔥 Total Players: ${players.length}`;
    
    await sock.sendMessage(m.chat, {
        text: leaderboardText,
        contextInfo: {
            externalAdReply: {
                title: "🏆 LEADERBOARD",
                body: "Top RPG Players",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "skills": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    const user = rpg[m.sender];
    
    let skillsText = `🎯 *SKILLS LIST*\n\n`;
    
    if (user.skills.length === 0) {
        skillsText += `📭 Belum punya skill\n`;
        skillsText += `Beli Buku Skill di .shop (1500 Gold)`;
    } else {
        user.skills.forEach((skill, index) => {
            skillsText += `${index + 1}. **${skill}**\n`;
            
            // Deskripsi skill
            const descriptions = {
                "Basic Attack": "Attack normal dengan damage standar",
                "Double Attack": "Menyerang 2x dengan 70% damage per hit",
                "Power Strike": "Attack kuat dengan 150% damage",
                "Heal": "Memulihkan 30 HP diri sendiri",
                "Shield Bash": "Attack + mengurangi damage lawan 20%",
                "Critical Hit": "25% chance untuk 200% damage"
            };
            
            if (descriptions[skill]) {
                skillsText += `   ↪️ ${descriptions[skill]}\n`;
            }
            
            skillsText += `\n`;
        });
    }
    
    skillsText += `🔥 Total: ${user.skills.length} skill\n`;
    skillsText += `🎁 Skill baru dapat dari Buku Skill (1500 Gold)`;
    
    await sock.sendMessage(m.chat, {
        text: skillsText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "🎯 SKILLS",
                body: "Check Your Abilities",
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

case "train":
case "training": {
    if (!rpg[m.sender]) {
        return m.reply("❌ Kamu belum join RPG! Ketik .joinrpg");
    }
    
    const user = rpg[m.sender];
    
    // Check cooldown (1 jam)
    if (user.last_training && Date.now() - user.last_training < 3600000) {
        const minutes = Math.ceil((3600000 - (Date.now() - user.last_training)) / 60000);
        return m.reply(`⏳ Training cooldown! Tunggu ${minutes} menit lagi.`);
    }
    
    if (user.energy < 20) {
        return m.reply(`❌ Energy tidak cukup! Butuh 20, kamu punya ${user.energy}`);
    }
    
    user.energy -= 20;
    user.last_training = Date.now();
    
    // Training results
    const statTypes = ["attack", "defense"];
    const trainedStat = statTypes[Math.floor(Math.random() * statTypes.length)];
    const statIncrease = Math.floor(Math.random() * 2) + 1; // 1-2 points
    const expGain = Math.floor(Math.random() * 30) + 20; // 20-50 exp
    
    if (trainedStat === "attack") user.attack += statIncrease;
    else if (trainedStat === "defense") user.defense += statIncrease;
    
    user.exp += expGain;
    
    // Check level up
    if (user.exp >= user.exp_next) {
        user.level += 1;
        const oldExp = user.exp_next;
        user.exp = user.exp - user.exp_next;
        user.exp_next = Math.floor(oldExp * 1.5);
        user.max_hp += 20;
        user.hp = user.max_hp;
        user.max_energy += 5;
    }
    
    fs.writeFileSync('./Database/RPG.json', JSON.stringify(rpg, null, 2));
    
    let resultText = `💪 *TRAINING COMPLETE!*\n\n` +
                    `🎯 Trained: ${trainedStat.toUpperCase()}\n` +
                    `📈 Increase: +${statIncrease}\n` +
                    `⭐ EXP: +${expGain} (${user.exp}/${user.exp_next})\n` +
                    `⚡ Energy: -20 (${user.energy}/${user.max_energy})\n\n`;
    
    if (user.exp >= user.exp_next) {
        resultText += `🌟 *LEVEL UP!*\n` +
                     `Level ${user.level - 1} → ${user.level}\n` +
                     `❤️ HP: +20\n` +
                     `⚡ Energy: +5\n\n`;
    }
    
    resultText += `⏰ Next training in 1 hour`;
    
    await sock.sendMessage(m.chat, {
        text: resultText,
        contextInfo: {
            mentionedJid: [m.sender],
            externalAdReply: {
                title: "💪 TRAINING",
                body: `+${statIncrease} ${trainedStat}`,
                thumbnailUrl: global.thumbrpg,
                sourceUrl: global.linkChannel,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
}
break

  case "qc":
case "qcstic": {
    if (!args[0]) return m.reply(`Contoh: ${cmd} halo dunia`);
    if (text.length > 80) return m.reply(`Maximal 80 karakter!`);
    
    try {
        const message = text;
        const backgroundColor = '#ffffff';
        const username = m.pushName || "User";
        
        // Dapatkan avatar user
        let avatar;
        try {
            avatar = await sock.profilePictureUrl(m.sender, "image");
        } catch {
            avatar = 'https://files.catbox.moe/nwvkbt.png';
        }
        
        const json = {
            type: 'quote',
            format: 'png',
            backgroundColor,
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                entities: [],
                avatar: true,
                from: {
                    id: 1,
                    name: username,
                    photo: {
                        url: avatar
                    }
                },
                text: message,
                replyMessage: {}
            }]
        };
        
        const response = await axios.post('https://bot.lyo.su/quote/generate', json, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.data || !response.data.result || !response.data.result.image) {
            throw new Error('Response API tidak valid');
        }
        
        const buffer = Buffer.from(response.data.result.image, 'base64');
        
        // Kirim sebagai sticker dengan packname dan author tetap
        await sock.sendStimg(m.chat, buffer, m, {
            packname: "Zeuz",
            author: "gacor"
        });
        
    } catch (err) {
        console.error('QC Error:', err);
        m.reply(`❌ Gagal membuat quote sticker: ${err.message}`);
    }
}
break      
        
case "bratip": {
    if (!text) return m.reply(`*Contoh :* ${cmd} Hallo Aku Jawa!`);
    
    var media = await getBuffer(`https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`);
    
    await sock.sendStimg(m.chat, media, m, {packname: "AfaIYah??"});
}
break        
        
case "capcut": {
if (!text) return m.reply("Masukkan URL CapCut!\n\nContoh: .capcut https://www.capcut.com/tv2/ZSxxx");

// Reload energy terbaru
if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

// Cek premium dan energy
if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh video CapCut...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://apiz.rafzsoffc.cloud/download/capcut?apikey=zlynzeeapi&url=${url}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh video CapCut!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*CAPCUT DOWNLOADER*

📝 Title: ${data.title}
👤 Author: ${data.author.name}
📅 Date: ${data.date}

📊 Statistics:
👥 Users: ${data.pengguna}
❤️ Likes: ${data.likes}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    // Kirim video
    await sock.sendMessage(m.chat, {
        video: { url: data.videoUrl },
        caption: caption,
        contextInfo: {
            externalAdReply: {
                title: "CAPCUT DOWNLOADER",
                body: data.author.name,
                thumbnailUrl: data.posterUrl,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh video CapCut!");
}
}
break        
        
case "claimreward": {
// Set timezone Jakarta
const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
const currentTime = now.getTime();

// Inisialisasi claim data jika belum ada
if (!energy[m.sender + '_lastclaim']) energy[m.sender + '_lastclaim'] = 0;
if (!energy[m.sender]) energy[m.sender] = 0;

const lastClaimTime = energy[m.sender + '_lastclaim'];
const timeDiff = currentTime - lastClaimTime;
const cooldown = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik

// Cek apakah sudah lewat 24 jam
if (timeDiff < cooldown) {
    const timeLeft = cooldown - timeDiff;
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);
    
    // Hitung waktu claim berikutnya
    const nextClaim = new Date(lastClaimTime + cooldown);
    const nextClaimStr = nextClaim.toLocaleString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'short'
    });
    
    return m.reply(`⚠️ Kamu sudah claim hari ini!

⏰ Sisa waktu: ${hoursLeft} jam ${minutesLeft} menit ${secondsLeft} detik
📅 Claim berikutnya: ${nextClaimStr}
⚡ Energy saat ini: ${energy[m.sender]}`);
}

// Berikan 45 energy
const oldEnergy = energy[m.sender];
energy[m.sender] += 45;
energy[m.sender + '_lastclaim'] = currentTime;
fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));

// Waktu claim berikutnya
const nextClaim = new Date(currentTime + cooldown);
const nextClaimStr = nextClaim.toLocaleString('id-ID', { 
    timeZone: 'Asia/Jakarta',
    dateStyle: 'full',
    timeStyle: 'short'
});

m.reply(`✅ *CLAIM BERHASIL!*

🎁 Reward: +45 Energy ⚡
💰 Energy: ${oldEnergy} → ${energy[m.sender]}

📅 Claim berikutnya: ${nextClaimStr}
🕐 Waktu sekarang: ${now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'full', timeStyle: 'medium' })}`);
}
break
        
//###############################//

case "payment":
case "pay": {
    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                    hasMediaAttachment: true, 
                    ...(await prepareWAMessageMedia({ image: { url: global.qris } }, { upload: sock.waUploadToServer })),
                    }, 
                    body: { 
                        text: `*Daftar Payment ${namaOwner} 🔖*`
                    },
                    footer: { 
                        text: "Klik tombol di bawah untuk menyalin nomor e-wallet" 
                    },
                    nativeFlowMessage: {
                        buttons: [
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Dana","copy_code":"${global.dana}"}`
                            },
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy OVO","copy_code":"${global.ovo}"}`
                            },
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Gopay","copy_code":"${global.gopay}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//

case "deposit": {
const args = text.split(" ");
const amount = parseInt(args[0]);

if (!amount) return m.reply("Masukkan jumlah deposit!\n\nContoh: .deposit 10000\n\nMinimal deposit: Rp 1.000");

if (amount < 1000) return m.reply("❌ Minimal deposit Rp 1.000!");

m.reply("⏳ Sedang membuat deposit...");

try {
    const API_KEY = "2e53df6f22f7fb92ef9665c23d68255d";
    const BASE_URL = "https://obvntepwymuspiyxmeiu.supabase.co/functions/v1";
    
    const response = await fetch(`${BASE_URL}/api-deposit-create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        },
        body: JSON.stringify({
            amount: amount
        })
    });
    
    const result = await response.json();
    
    if (!result.success) return m.reply("❌ Gagal membuat deposit!");
    
    const deposit = result.deposit;
    const fee = deposit.fee || 340;
    const expiredTime = new Date(deposit.expired_at).toLocaleString('id-ID');
    
    const caption = `*DEPOSIT QRIS*

💰 Jumlah: Rp ${amount.toLocaleString('id-ID')}
💳 Fee: Rp ${fee.toLocaleString('id-ID')}
📊 Total: Rp ${deposit.total_amount.toLocaleString('id-ID')}

🆔 Order ID: ${deposit.order_id}
⏰ Expired: ${expiredTime}

Scan QR Code di atas untuk melakukan pembayaran.`;

    // Generate QR Code dari qr_string menggunakan library QR
    const QRCode = require('qrcode');
    const qrBuffer = await QRCode.toBuffer(deposit.qr_string, {
        width: 500,
        margin: 2
    });
    
    await sock.sendMessage(m.chat, {
        image: qrBuffer,
        caption: caption
    }, { quoted: m });
    
    // Auto check status deposit setiap 5 detik
    m.reply("🔄 Menunggu pembayaran...\n\nBot akan otomatis mengecek status pembayaran Anda.");
    
    let checkCount = 0;
    const maxCheck = 36; // 3 menit (36 x 5 detik)
    
    const checkInterval = setInterval(async () => {
        try {
            const checkResponse = await fetch(`${BASE_URL}/api-deposit-status`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY
                },
                body: JSON.stringify({
                    order_id: deposit.order_id
                })
            });
            
            const checkResult = await checkResponse.json();
            
            if (checkResult.deposit && checkResult.deposit.status === "success") {
                clearInterval(checkInterval);
                
                // Tambahkan saldo ke database uang
                if (!uang[m.sender]) uang[m.sender] = 0;
                uang[m.sender] += amount;
                fs.writeFileSync('./Database/Uang.json', JSON.stringify(uang, null, 2));
                
                m.reply(`✅ *PEMBAYARAN BERHASIL!*

💰 Deposit: Rp ${amount.toLocaleString('id-ID')}
💵 Saldo Anda: $${uang[m.sender]}

Terima kasih! Saldo sudah ditambahkan ke akun Anda.`);
            }
            
            checkCount++;
            if (checkCount >= maxCheck) {
                clearInterval(checkInterval);
                m.reply("⏰ Waktu pembayaran habis!\n\nSilakan buat deposit baru jika ingin melanjutkan.");
            }
        } catch (error) {
            console.log("Error checking deposit:", error);
        }
    }, 5000);
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat membuat deposit!");
}
}
break        
        
case "fb": {
if (!text) return m.reply("Masukkan URL Facebook!\n\nContoh: .fb https://www.facebook.com/share/xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh video Facebook...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://www.velyn.mom/api/downloader/facebook?apikey=velynapis&url=${url}`);
    const json = await res.json();
    
    if (json.status !== 200) return m.reply("❌ Gagal mengunduh video Facebook!");
    
    const newEnergy = energy[m.sender] || 0;
    
    await sock.sendMessage(m.chat, {
        video: { url: json.data.downloadUrl },
        caption: `*FACEBOOK DOWNLOADER*\n\n${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`,
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh video Facebook!");
}
}
break

// Spotify Downloader
case "spotify": {
if (!text) return m.reply("Masukkan URL Spotify!\n\nContoh: .spotify https://open.spotify.com/track/xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🎵 Sedang mengunduh audio Spotify...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://www.velyn.mom/api/downloader/spotify?apikey=velynapis&url=${url}`);
    const json = await res.json();
    
    if (json.status !== 200) return m.reply("❌ Gagal mengunduh audio Spotify!");
    
    const data = json.data;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*SPOTIFY DOWNLOADER*

🎵 Title: ${data.title}
👤 Artist: ${data.artists}
⏱️ Duration: ${Math.floor(data.duration / 1000 / 60)}:${Math.floor((data.duration / 1000) % 60)}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    await sock.sendMessage(m.chat, {
        audio: { url: data.url },
        mimetype: 'audio/mpeg',
        contextInfo: {
            externalAdReply: {
                title: data.title,
                body: data.artists,
                thumbnailUrl: data.thumbnail,
                sourceUrl: text,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh audio Spotify!");
}
}
break

// XNXX Downloader (18+)
case "boxep": {
if (!text) return m.reply("Masukkan URL XNXX!\n\nContoh: .boxep https://www.xnxx.com/video-xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 2) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 2 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 2;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh video...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/xnxx?url=${url}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh video!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*VIDEO DOWNLOADER (18+)*

📝 Title: ${data.title}
⏱️ Duration: ${Math.floor(data.duration / 60)}:${data.duration % 60}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    await sock.sendMessage(m.chat, {
        video: { url: data.download.high },
        caption: caption
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh video!");
}
}
break

// Instagram Downloader
case "ig": {
if (!text) return m.reply("Masukkan URL Instagram!\n\nContoh: .ig https://www.instagram.com/reel/xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh dari Instagram...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/instagram?url=${url}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh dari Instagram!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*INSTAGRAM DOWNLOADER*

👤 ${data.profile.full_name} (@${data.profile.username})
📝 ${data.caption.text}

📊 Statistics:
❤️ Likes: ${data.statistics.like_count || 0}
💬 Comments: ${data.statistics.comment_count}
👁️ Views: ${data.statistics.ig_play_count?.toLocaleString() || 0}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    for (let i = 0; i < data.data.length; i++) {
        const item = data.data[i];
        if (item.type === 'video') {
            await sock.sendMessage(m.chat, {
                video: { url: item.url },
                caption: i === 0 ? caption : ''
            }, { quoted: m });
        } else {
            await sock.sendMessage(m.chat, {
                image: { url: item.url },
                caption: i === 0 ? caption : ''
            }, { quoted: m });
        }
    }
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh dari Instagram!");
}
}
break

// Pinterest Downloader
case "pindl": {
if (!text) return m.reply("Masukkan URL Pinterest!\n\nContoh: .pindl https://pinterest.com/pin/xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh dari Pinterest...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/pinterest?url=${url}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh dari Pinterest!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*PINTEREST DOWNLOADER*

📝 Title: ${data.title}
👤 Uploader: ${data.uploader.full_name} (@${data.uploader.username})
📅 Date: ${data.created_at}

📊 Statistics:
💾 Saved: ${data.statistics.saved}
💬 Comments: ${data.statistics.comment}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    const mediaUrl = data.media_urls.find(m => m.quality === 'original')?.url || data.media_urls[0].url;
    
    await sock.sendMessage(m.chat, {
        image: { url: mediaUrl },
        caption: caption
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh dari Pinterest!");
}
}
break

// YouTube Play Video
case "play": {
if (!text) return m.reply("Masukkan judul lagu/video!\n\nContoh: .play happy nation");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔍 Sedang mencari video...");

try {
    const query = encodeURIComponent(text);
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/play/video?query=${query}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Video tidak ditemukan!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*YOUTUBE PLAY*

🎵 Title: ${data.metadata.title}
👤 Channel: ${data.metadata.author.name}
⏱️ Duration: ${data.metadata.duration.timestamp}
👁️ Views: ${data.metadata.views.toLocaleString()}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    await sock.sendMessage(m.chat, {
        video: { url: data.download.url },
        caption: caption,
        contextInfo: {
            externalAdReply: {
                title: data.metadata.title,
                body: data.metadata.author.name,
                thumbnailUrl: data.metadata.thumbnail,
                sourceUrl: data.metadata.url,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mencari video!");
}
}
break

// YouTube Play Audio
case "song": {
if (!text) return m.reply("Masukkan judul lagu!\n\nContoh: .song happy nation");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔍 Sedang mencari audio...");

try {
    const query = encodeURIComponent(text);
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/play/audio?query=${query}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Audio tidak ditemukan!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    await sock.sendMessage(m.chat, {
        audio: { url: data.download.url },
        mimetype: 'audio/mpeg',
        contextInfo: {
            externalAdReply: {
                title: data.metadata.title,
                body: data.metadata.author.name,
                thumbnailUrl: data.metadata.thumbnail,
                sourceUrl: data.metadata.url,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
    if (!isPremium) {
        m.reply(`✅ Audio berhasil dikirim!\n\n⚡ Energy: ${currentEnergy} → ${newEnergy}`);
    }
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mencari audio!");
}
}
break

// SFile Downloader
case "sfiledl": {
if (!text) return m.reply("Masukkan URL SFile!\n\nContoh: .sfiledl https://sfile.mobi/xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh file...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://apiz.rafzsoffc.cloud/download/sfile?apikey=zlynzeeapi&url=${url}`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh file!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*SFILE DOWNLOADER*

📁 Filename: ${data.filename}
📊 Size: ${data.size}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    await sock.sendMessage(m.chat, {
        document: { url: data.direct_url },
        fileName: data.filename,
        caption: caption
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh file!");
}
}
break

// Videy Downloader
case "videy": {
if (!text) return m.reply("Masukkan URL Videy!\n\nContoh: .videy https://videy.co/v/?id=xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🔄 Sedang mengunduh video Videy...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://www.velyn.mom/api/downloader/videy?apikey=velynapis&url=${url}`);
    const json = await res.json();
    
    if (json.status !== 200) return m.reply("❌ Gagal mengunduh video Videy!");
    
    const newEnergy = energy[m.sender] || 0;
    
    await sock.sendMessage(m.chat, {
        video: { url: json.data.url },
        caption: `*VIDEY DOWNLOADER*\n\n${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh video Videy!");
}
}
break

// YouTube MP3
case "ytmp3": {
if (!text) return m.reply("Masukkan URL YouTube!\n\nContoh: .ytmp3 https://youtu.be/xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🎵 Sedang mengunduh audio YouTube...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${url}&quality=128`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh audio YouTube!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    await sock.sendMessage(m.chat, {
        audio: { url: data.download.url },
        mimetype: 'audio/mpeg',
        contextInfo: {
            externalAdReply: {
                title: data.metadata.title,
                body: data.metadata.author.name,
                thumbnailUrl: data.metadata.thumbnail,
                sourceUrl: data.metadata.url,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
    if (!isPremium) {
        m.reply(`✅ Audio berhasil dikirim!\n\n⚡ Energy: ${currentEnergy} → ${newEnergy}`);
    }
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh audio YouTube!");
}
}
break

// YouTube MP4
case "ytmp4": {
if (!text) return m.reply("Masukkan URL YouTube!\n\nContoh: .ytmp4 https://youtu.be/xxx");

if (!energy[m.sender]) energy[m.sender] = 0;
const currentEnergy = energy[m.sender];

if (!isPremium) {
    if (currentEnergy < 1) return m.reply(`⚠️ Energy tidak cukup!\n\n⚡ Energy: ${currentEnergy}\n💎 Dibutuhkan: 1 Energy\n\n✨ Upgrade ke Premium untuk unlimited akses!`);
    energy[m.sender] -= 1;
    fs.writeFileSync('./Database/Energy.json', JSON.stringify(energy, null, 2));
}

m.reply("🎥 Sedang mengunduh video YouTube...");

try {
    const url = encodeURIComponent(text);
    const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${url}&quality=360`);
    const json = await res.json();
    
    if (!json.status) return m.reply("❌ Gagal mengunduh video YouTube!");
    
    const data = json.result;
    const newEnergy = energy[m.sender] || 0;
    
    const caption = `*YOUTUBE DOWNLOADER*

🎵 Title: ${data.metadata.title}
👤 Channel: ${data.metadata.author.name}
⏱️ Duration: ${data.metadata.duration.timestamp}
👁️ Views: ${data.metadata.views.toLocaleString()}
📅 ${data.metadata.ago}

${!isPremium ? `⚡ Energy: ${currentEnergy} → ${newEnergy}` : '✨ Premium User'}`;

    await sock.sendMessage(m.chat, {
        video: { url: data.download.url },
        caption: caption,
        contextInfo: {
            externalAdReply: {
                title: data.metadata.title,
                body: data.metadata.author.name,
                thumbnailUrl: data.metadata.thumbnail,
                sourceUrl: data.metadata.url,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mengunduh video YouTube!");
}
}
break

case "yts": {
if (!text) return m.reply("Masukkan query pencarian!\n\nContoh: .yts happy nation");

m.reply("🔍 Sedang mencari...");

try {
    const query = encodeURIComponent(text);
    const res = await fetch(`https://www.velyn.mom/api/search/play?apikey=velynapis&query=${query}`);
    const json = await res.json();
    
    if (json.status !== 200) return m.reply("❌ Pencarian gagal!");
    
    const data = json.data.searchResult;
    const videoUrl = `https://youtube.com/watch?v=${data.title.match(/\((.*?)\)/)?.[1] || ''}`;
    
    const caption = `*YOUTUBE SEARCH*

📝 Title: ${data.title}
👤 Uploader: ${data.uploader}
⏱️ Duration: ${Math.floor(data.duration / 60)}:${data.duration % 60}
👁️ Views: ${data.viewCount.toLocaleString()}
📅 ${data.uploadDate}

Pilih format download di bawah:`;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: true,
                        ...(await prepareWAMessageMedia({ 
                            image: { url: data.thumbnail } 
                        }, { upload: sock.waUploadToServer }))
                    },
                    body: { text: caption },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"🎵 Download Audio","id":".ytmp3 ${videoUrl}"}`
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: `{"display_text":"🎥 Download Video","id":".ytmp4 ${videoUrl}"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"📺 Watch on YouTube","url":"${videoUrl}","merchant_url":"${videoUrl}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });
    
    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    
} catch (error) {
    console.log(error);
    m.reply("❌ Terjadi kesalahan saat mencari!");
}
}
break
        
case "cekidch":
case "idch": {
    if (!text) return m.reply(`*Contoh :* ${cmd} link channel`); 
    if (!text.includes("https://whatsapp.com/channel/")) {
        return m.reply("Link channel tidak valid");
    }

    let result = text.split("https://whatsapp.com/channel/")[1];
    let res = await sock.newsletterMetadata("invite", result);
    let teks = `*Channel ID Ditemukan ✅*\n\n- ${res.id}`;

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Channel ID","copy_code":"${res.id}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//

case "done":
case "don":
case "proses":
case "ps": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`*Contoh :* ${cmd} nama barang`);

    const status = /done|don/.test(command) ? "Transaksi Done ✅" : "Dana Telah Diterima ✅";

    const teks = `${status}

📦 Pembelian: ${text}
🗓️ Tanggal: ${global.tanggal(Date.now())}

📢 Cek Testimoni Pembeli:
${global.linkChannel || "-"}

📣 Gabung Grup Share & Promosi:
${global.linkGrup || "-"}`;

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"Channel Testimoni","url":"https://whatsapp.com/channel/0029VbBfApK2phHIWVmUPf2g"}`
                            },
                            {
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"Grup Marketplace","url":"${global.linkGrup}"}`
                            }
                        ]
                    }, 
                    contextInfo: {
                     isForwarded: true
                    }
                }
            }
        }
    }, {});

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//

case "tourl": {
    if (!/image|video|audio|application/.test(mime)) 
        return m.reply(`Media tidak ditemukan!\nKetik *${cmd}* dengan reply/kirim media`)

    const FormData = require('form-data');
    const { fromBuffer } = require('file-type');    

    async function dt(buffer) {
        const fetchModule = await import('node-fetch');
        const fetch = fetchModule.default;
        let { ext } = await fromBuffer(buffer);
        let bodyForm = new FormData();
        bodyForm.append("fileToUpload", buffer, "file." + ext);
        bodyForm.append("reqtype", "fileupload");
        let res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: bodyForm,
        });
        let data = await res.text();
        return data;
    }

    let aa = m.quoted ? await m.quoted.download() : await m.download();
    let dd = await dt(aa);

    // bikin button copy url
    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: `✅ Media berhasil diupload!\n\nURL: ${dd}` },
                    nativeFlowMessage: {
                        buttons: [
                            { 
                                name: "cta_copy", 
                                buttonParamsJson: `{"display_text":"Copy URL","copy_code":"${dd}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//

case "tourl2": {
    if (!/image/.test(mime)) 
        return m.reply(`Media tidak ditemukan!\nKetik *${cmd}* dengan reply/kirim foto`)
    try {
        const { ImageUploadService } = require('node-upload-images');
        let mediaPath = await sock.downloadAndSaveMediaMessage(qmsg);
        const service = new ImageUploadService('pixhost.to');
        let buffer = fs.readFileSync(mediaPath);
        let { directLink } = await service.uploadFromBinary(buffer, 'skyzo.png');
        await fs.unlinkSync(mediaPath);

        // button copy url
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: `✅ Foto berhasil diupload!\n\nURL: ${directLink}` },
                        nativeFlowMessage: {
                            buttons: [
                                { 
                                    name: "cta_copy", 
                                    buttonParamsJson: `{"display_text":"Copy URL","copy_code":"${directLink}"}`
                                }
                            ]
                        }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error("Tourl Error:", err);
        m.reply("Terjadi kesalahan saat mengubah media menjadi URL.");
    }
}
break;

//###############################//

case "backupsc":
case "bck":
case "backup": {
    if (m.sender.split("@")[0] !== global.owner)
        return m.reply(mess.owner);
    try {        
        const tmpDir = "./Tmp";
        if (fs.existsSync(tmpDir)) {
            const files = fs.readdirSync(tmpDir).filter(f => !f.endsWith(".js"));
            for (let file of files) {
                fs.unlinkSync(`${tmpDir}/${file}`);
            }
        }
        await m.reply("Processing Backup Script . .");        
        const name = `Backup-Script-Pushkontak`; 
        const exclude = ["node_modules", "skyzopedia", "session", "package-lock.json", "yarn.lock", ".npm", ".cache"];
        const filesToZip = fs.readdirSync(".").filter(f => !exclude.includes(f) && f !== "");

        if (!filesToZip.length) return m.reply("Tidak ada file yang dapat di-backup.");

        execSync(`zip -r ${name}.zip ${filesToZip.join(" ")}`);

        await sock.sendMessage(m.sender, {
            document: fs.readFileSync(`./${name}.zip`),
            fileName: `${name}.zip`,
            mimetype: "application/zip"
        }, { quoted: m });

        fs.unlinkSync(`./${name}.zip`);

        if (m.chat !== m.sender) m.reply("Script bot berhasil dikirim ke private chat.");
    } catch (err) {
        console.error("Backup Error:", err);
        m.reply("Terjadi kesalahan saat melakukan backup.");
    }
}
break;

//###############################//

case "kick":
case "kik": {
    if (!m.isGroup) return m.reply(mess.group);
    if (!isOwner && !m.isAdmin) return m.reply(mess.admin);
    if (!m.isBotAdmin) return m.reply(mess.botadmin);

    let target;

    if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0];
    } else if (m.quoted?.sender) {
        target = m.quoted.sender;
    } else if (text) {
        const cleaned = text.replace(/[^0-9]/g, "");
        if (cleaned) target = cleaned + "@s.whatsapp.net";
    }

    if (!target) return m.reply(`*Contoh :* .kick @tag/6283XXX`);

    try {
        await sock.groupParticipantsUpdate(m.chat, [target], "remove");
        return sock.sendMessage(m.chat, {
            text: `✅ Berhasil mengeluarkan @${target.split("@")[0]}`,
            mentions: [target]
        }, { quoted: m });
    } catch (err) {
        console.error("Kick error:", err);
        return m.reply("Gagal mengeluarkan anggota. Coba lagi atau cek hak akses bot.");
    }
}
break;

//###############################//

case "closegc":
case "close":
case "opengc":
case "open": {
    if (!m.isGroup) return m.reply(mess.group);
    if (!isOwner && !m.isAdmin) return m.reply(mess.admin);
    if (!m.isBotAdmin) return m.reply(mess.botadmin);

    try {
        const cmd = command.toLowerCase();

        if (cmd === "open" || cmd === "opengc") {
            await sock.groupSettingUpdate(m.chat, 'not_announcement');
            return m.reply("Grup berhasil dibuka! Sekarang semua anggota dapat mengirim pesan.");
        }

        if (cmd === "close" || cmd === "closegc") {
            await sock.groupSettingUpdate(m.chat, 'announcement');
            return m.reply("Grup berhasil ditutup! Sekarang hanya admin yang dapat mengirim pesan.");
        }

    } catch (error) {
        console.error("Error updating group settings:", error);
        return m.reply("Terjadi kesalahan saat mencoba mengubah pengaturan grup.");
    }
}
break;

//###############################//

case "ht":
case "hidetag": {
    if (!m.isGroup) return m.reply(mess.group);
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`*Contoh :* ${cmd} pesannya`);
    try {
        if (!m.metadata || !m.metadata.participants) return m.reply("Gagal mendapatkan daftar anggota grup. Coba lagi.");
        const members = m.metadata.participants.map(v => v.id.includes("@s.whatsapp.net") ? v.id : v.jid);
        await sock.sendMessage(m.chat, {
            text: text,
            mentions: members
        }, {
            quoted: null
        });
    } catch (error) {
        console.error("Error sending hidetag message:", error);
        return m.reply("Terjadi kesalahan saat mencoba mengirim pesan hidetag.");
    }
}
break;

//###############################//

case "welcome": {
    if (!isOwner) return m.reply(mess.owner)
    if (!/on|off/.test(text)) {
        let teks = `
*⚙️ Bot Settings Welcome*
- Status: ${global.db.settings.welcome ? "*aktif (✅)*" : "*tidak aktif (❌)*"}

Pilih Salah Satu Opsi Untuk Mengatur Welcome Message!
`
        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: teks },
                        nativeFlowMessage: {
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: `{"display_text":"Aktifkan Welcome","id":".welcome on"}` },
                                { name: "quick_reply", buttonParamsJson: `{"display_text":"Matikan Welcome","id":".welcome off"}` }
                            ]
                        },
                        contextInfo: { mentionedJid: [m.sender, global.owner + "@s.whatsapp.net"] }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m })
        return await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    if (text === "on") {
        global.db.settings.welcome = true
        return m.reply(`*✅ Berhasil Menyalakan Welcome*\n\n*⚙️ Bot Settings Welcome*
- Status: ${global.db.settings.welcome ? "*aktif (✅)*" : "*tidak aktif (❌)*"}`)
    }

    if (text === "off") {
        global.db.settings.welcome = false
        return m.reply(`*✅ Berhasil Mematikan Welcome*\n\n*⚙️ Bot Settings Welcome*
- Status: ${global.db.settings.welcome ? "*aktif (✅)*" : "*tidak aktif (❌)*"}`)
    }
}
break

//###############################//

case "antilink": {
    if (!isOwner) return m.reply(mess.owner)
    if (!m.isGroup) return m.reply(mess.group)
    if (!text) {
        let teks = `
*⚙️ Grup Settings Antilink*

- Status: ${global.db.groups[m.chat].antilink ? "*aktif (✅)*" : "*tidak aktif (❌)*"}
- ID Grup: ${m.chat}
- Grup Name: ${m.metadata.subject}

Pilih Salah Satu Opsi Settings Antilink Untuk Grup Ini!
`
        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: teks },
                        nativeFlowMessage: {
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: `{"display_text":"Aktifkan Antilink","id":".antilink on"}` },
                                { name: "quick_reply", buttonParamsJson: `{"display_text":"Matikan Antilink","id":".antilink off"}` }
                            ]
                        },
                        contextInfo: { mentionedJid: [m.sender, global.owner + "@s.whatsapp.net"] }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m })
        return await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    let group = global.db.groups[m.chat]
    if (text === "on") {
        group.antilink = true
        group.antilink2 = false
        return m.reply(`*✅ Berhasil Menyalakan Antilink*\n\n*⚙️ Grup Settings Antilink*\n- Status: *aktif (✅)*\n- ID Grup: ${m.chat}\n- Grup Name: ${m.metadata.subject}`)
    }

    if (text === "off") {
        group.antilink = false
        return m.reply(`*✅ Berhasil Mematikan Antilink*\n\n*⚙️ Grup Settings Antilink*\n- Status: *tidak aktif (❌)*\n- ID Grup: ${m.chat}\n- Grup Name: ${m.metadata.subject}`)
    }
}
break

//###############################//

case "antilink2": {
    if (!isOwner) return m.reply(mess.owner)
    if (!m.isGroup) return m.reply(mess.group)
    if (!text) {
        let teks = `
*⚙️ Grup Settings Antilink V2*
- Status: ${global.db.groups[m.chat].antilink2 ? "*aktif (✅)*" : "*tidak aktif (❌)*"}
- ID Grup: ${m.chat}
- Grup Name: ${m.metadata.subject}

Pilih Salah Satu Opsi Settings Antilink V2 Untuk Grup Ini!
`
        let msg = await generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: teks },
                        nativeFlowMessage: {
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: `{"display_text":"Aktifkan Antilink V2","id":".antilink2 on"}` },
                                { name: "quick_reply", buttonParamsJson: `{"display_text":"Matikan Antilink V2","id":".antilink2 off"}` }
                            ]
                        },
                        contextInfo: { mentionedJid: [m.sender, global.owner + "@s.whatsapp.net"] }
                    }
                }
            }
        }, { userJid: m.sender, quoted: m })
        return await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }

    let group = global.db.groups[m.chat]
    if (text === "on") {
        group.antilink2 = true
        group.antilink = false
        return m.reply(`*✅ Berhasil Menyalakan Antilink V2*\n\n*⚙️ Grup Settings Antilink V2*\n- Status: *aktif (✅)*\n- ID Grup: ${m.chat}\n- Grup Name: ${m.metadata.subject}`)
    }

    if (text === "off") {
        group.antilink2 = false
        return m.reply(`*✅ Berhasil Mematikan Antilink V2*\n\n*⚙️ Grup Settings Antilink V2*\n- Status: *tidak aktif (❌)*\n- ID Grup: ${m.chat}\n- Grup Name: ${m.metadata.subject}`)
    }
}
break

//###############################//

case "jpmch": {
    if (!isOwner) return m.reply(mess.owner)
    if (!text) return m.reply(`*Contoh :* ${cmd} pesannya & bisa dengan foto juga`)

    let mediaPath
    const mimeType = mime
    if (/image/.test(mimeType)) {
        mediaPath = await sock.downloadAndSaveMediaMessage(qmsg)
    }
    
    const Channel = await sock.newsletterFetchAllParticipating()
    const channelList = Object.keys(Channel)
    if (!channelList || channelList.length < 1) return m.reply("Channel tidak ditemukan")
    let successCount = 0
    const messageType = mediaPath ? "teks & foto" : "teks"
    const senderChat = m.chat

    const messageContent = mediaPath
        ? { image: await fs.readFileSync(mediaPath), caption: text }
        : { text }
    global.messageJpm = messageContent

    await m.reply(`Memproses JPM ${messageType} ke ${channelList.length} Channel WhatsApp.`)
    global.statusjpm = true

    for (const chId of channelList) {
    if (global.stopjpm) {
        delete global.stopjpm
        delete global.statusjpm
        break
        }
        try {
            await sock.sendMessage(chId, global.messageJpm)
            successCount++
        } catch (err) {
            console.error(`Gagal kirim ke channel ${chId}:`, err)
        }
        await sleep(global.JedaJpm)
    }

    if (mediaPath) await fs.unlinkSync(mediaPath)    
    delete global.statusjpm
    await m.reply(`JPM Channel Telah Selsai ✅\nBerhasil dikirim ke ${successCount} Channel WhatsApp.`)
}
break

//###############################//

case "jasher": case "jpm": case "jaser": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`*Contoh :* ${cmd} pesannya & bisa dengan foto juga`)
    let mediaPath
    const mimeType = mime
    if (/image/.test(mimeType)) {
        mediaPath = await sock.downloadAndSaveMediaMessage(qmsg)
    }
    const allGroups = await sock.groupFetchAllParticipating()
    const groupIds = Object.keys(allGroups)
    let successCount = 0
    let messageContent = await generateWAMessageFromContent(m.sender, { 
extendedTextMessage: { 
text: text 
}}, { userJid: m.sender, quoted: FakeChannel });
    
    if (mediaPath) {
    const aa = await prepareWAMessageMedia({ image: await fs.readFileSync(mediaPath) }, { upload: sock.waUploadToServer })
    aa.imageMessage.caption = text
    messageContent = await generateWAMessageFromContent(m.sender, {
    ...aaa
    }, { userJid: m.sender, quoted: FakeChannel });
    }

    global.messageJpm = messageContent
    const senderChat = m.chat
    await m.reply(`Memproses ${mediaPath ? "JPM teks & foto" : "JPM teks"} ke ${groupIds.length} grup chat`)
    global.statusjpm = true
    
    for (const groupId of groupIds) {
        if (db.settings.bljpm.includes(groupId)) continue
        if (global.stopjpm) {
        delete global.stopjpm
        delete global.statusjpm
        break
        }
        try {
            await sock.relayMessage(groupId, global.messageJpm.message, { messageId: global.messageJpm.key.id });
            successCount++
        } catch (err) {
            console.error(`Gagal kirim ke grup ${groupId}:`, err)
        }
        await sleep(global.JedaJpm)
    }

    if (mediaPath) await fs.unlinkSync(mediaPath)
    delete global.statusjpm
    await sock.sendMessage(senderChat, {
        text: `JPM ${mediaPath ? "teks & foto" : "teks"} berhasil dikirim ke ${successCount} grup.`,
    }, { quoted: m })
}
break

//###############################//

case "jpmht": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`*Contoh :* ${cmd} pesannya & bisa dengan foto juga`)
    let mediaPath
    const mimeType = mime
    if (/image/.test(mimeType)) {
        mediaPath = await sock.downloadAndSaveMediaMessage(qmsg)
    }
    const allGroups = await sock.groupFetchAllParticipating()
    const groupIds = Object.keys(allGroups)
    let successCount = 0
    const messageContent = mediaPath
        ? { image: await fs.readFileSync(mediaPath), caption: text }
        : { text }
    global.messageJpm = messageContent
    const senderChat = m.chat
    await m.reply(`Memproses ${mediaPath ? "JPM teks & foto" : "JPM teks"} hidetag ke ${groupIds.length} grup chat`)
    global.statusjpm = true
    
    for (const groupId of groupIds) {
        if (db.settings.bljpm.includes(groupId)) continue
        if (global.stopjpm) {
        delete global.stopjpm
        delete global.statusjpm
        break
        }
        messageContent.mentions = allGroups[groupId].participants.map(e => e.id)
        try {
            await sock.sendMessage(groupId, global.messageJpm, { quoted: FakeChannel })
            successCount++
        } catch (err) {
            console.error(`Gagal kirim ke grup ${groupId}:`, err)
        }
        await sleep(global.JedaJpm)
    }

    if (mediaPath) await fs.unlinkSync(mediaPath)
    delete global.statusjpm
    await sock.sendMessage(senderChat, {
        text: `JPM ${mediaPath ? "teks & foto" : "teks"} hidetag berhasil dikirim ke ${successCount} grup.`,
    }, { quoted: m })
}
break

//###############################//

case "sticker": case "stiker": case "sgif": case "s": {
if (!/image|video/.test(mime)) return m.reply("Kirim foto dengan caption .sticker")
if (/video/.test(mime)) {
if ((qmsg).seconds > 15) return m.reply("Durasi vidio maksimal 15 detik!")
}
var media = await sock.downloadAndSaveMediaMessage(qmsg)
await sock.sendStimg(m.chat, media, m, {packname: "Xskycode."})
}
break

//###############################//

case "brat": {
if (!text) return m.reply(`*Contoh :* ${cmd} Hallo Aku Skyzopedia!`)
var media = await getBuffer(`https://api.siputzx.my.id/api/m/brat?text=${text}&isAnimated=false&delay=500`)
await sock.sendStimg(m.chat, media, m, {packname: "Xskycode."})
}
break

//###############################//

case "public":
case "self": {
    if (!isOwner) return m.reply(mess.owner);
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");

    if (command === "public") {
        global.mode_public = true;
        sock.public = global.mode_public
        let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = true");
        fs.writeFileSync(path, newData, "utf-8");
        return m.reply("✅ Mode berhasil diubah menjadi *Public*");
    }

    if (command === "self") {
        global.mode_public = false;
        sock.public = global.mode_public
        let newData = data.replace(/global\.mode_public\s*=\s*(true|false)/, "global.mode_public = false");
        fs.writeFileSync(path, newData, "utf-8");
        return m.reply("✅ Mode berhasil diubah menjadi *Self*");
    }
}
break;

//###############################//

case "setjeda": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`*Contoh :*\n${cmd} push 5000\n${cmd} jpm 6000\n\nKeterangan format waktu:\n1 detik = 1000\n\nJeda waktu saat ini:\nJeda Pushkontak > ${global.JedaPushkontak}\nJeda JPM > ${global.JedaJpm}`);

    let args = text.split(" ");
    if (args.length < 2) return m.reply(`*Contoh :*\n${cmd} push 5000\n${cmd} jpm 6000\n\nKeterangan format waktu:\n1 detik = 1000\n\nJeda waktu saat ini:\nJeda Pushkontak > ${global.JedaPushkontak}\nJeda JPM > ${global.JedaJpm}`);

    let target = args[0].toLowerCase(); // push / jpm
    let value = args[1];

    if (isNaN(value)) return m.reply("Harus berupa angka!");
    let jeda = parseInt(value);

    let fs = require("fs");
    let path = require.resolve("./settings.js");
    let data = fs.readFileSync(path, "utf-8");

    if (target === "push") {
        let newData = data.replace(/global\.JedaPushkontak\s*=\s*\d+/, `global.JedaPushkontak = ${jeda}`);
        fs.writeFileSync(path, newData, "utf-8");
        global.JedaPushkontak = jeda;
        return m.reply(`✅ Berhasil mengubah *Jeda Push Kontak* menjadi *${jeda}* ms`);
    } 
    
    if (target === "jpm") {
        let newData = data.replace(/global\.JedaJpm\s*=\s*\d+/, `global.JedaJpm = ${jeda}`);
        fs.writeFileSync(path, newData, "utf-8");
        global.JedaJpm = jeda;
        return m.reply(`✅ Berhasil mengubah *Jeda JPM* menjadi *${jeda}* ms`);
    }

    return m.reply(`Pilihan tidak valid!\nGunakan: *push* atau *jpm*`);
}
break;

//###############################//

case "pushkontak": case "puskontak": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`*Contoh :* ${cmd} pesannya`)
global.textpushkontak = text
let rows = []
const a = await sock.groupFetchAllParticipating()
global.dataAllGrup = a
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `Total Member: ${u.participants.length}`, 
id: `.pushkontak-response ${u.id}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Target Grup Pushkontak\n`
}, { quoted: m })
}
break

//###############################//

case "pushkontak-response": {
  if (!isOwner) return m.reply(mess.owner)
  if (!global.textpushkontak || !global.dataAllGrup) return m.reply(`Data teks pushkontak tidak ditemukan!\nSilahkan ketik *.pushkontak* pesannya`);
  const gc = global.dataAllGrup
  const teks = global.textpushkontak
  const jidawal = m.chat
  const data = await gc[text]
  const halls = data.participants
    .filter(v => v.id.includes("@s.whatsapp.net") ? v.id : v.jid)
    .map(v => v.id.includes("@s.whatsapp.net") ? v.id : v.jid)
    .filter(id => id !== botNumber && id.split("@")[0] !== global.owner); 

  await m.reply(`🚀 Memulai pushkontak ke dalam grup ${data.subject} dengan total member ${halls.length}`);
  
 global.statuspush = true
 let count = 0
 let msg = await generateWAMessageFromContent(m.sender, { 
extendedTextMessage: { 
text: global.textpushkontak 
}}, { userJid: m.sender, quoted: FakeChannel });
 
  for (const mem of halls) {
    if (global.stoppush) {
    delete global.stoppush
    delete global.statuspush
    break
    }
await sock.relayMessage(mem, msg.message, { messageId: msg.key.id });
    await global.sleep(global.JedaPushkontak);
    count += 1
  }
  
  delete global.statuspush
  delete global.textpushkontak
  await m.reply(`✅ Sukses pushkontak!\nPesan berhasil dikirim ke *${count}* member.`, jidawal)
}
break

//###############################//

case "pushkontak2": case "puskontak2": {
if (!isOwner) return m.reply(mess.owner)
if (!text || !text.includes("|")) return m.reply(`Masukan pesan & nama kontak\n*Contoh :* ${cmd} pesan|namakontak`)
global.textpushkontak = text.split("|")[0]
let rows = []
const a = await sock.groupFetchAllParticipating()
global.dataAllGrup = a
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `Total Member: ${u.participants.length}`, 
id: `.pushkontak-response2 ${u.id}|${text.split("|")[1]}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Target Grup PushkontakV2\n`
}, { quoted: m })
}
break

//###############################//

case "pushkontak-response2": {
  if (!isOwner) return m.reply(mess.owner)
  if (!global.textpushkontak || !global.dataAllGrup) return m.reply(`Data teks pushkontak tidak ditemukan!\nSilahkan ketik *.pushkontak2* pesannya|namakontak`);
  const teks = global.textpushkontak
  const jidawal = m.chat
  const data = global.dataAllGrup[text.split("|")[0]]
  const halls = data.participants
    .filter(v => v.id.includes("@s.whatsapp.net") ? v.id : v.jid)
    .map(v => v.id.includes("@s.whatsapp.net") ? v.id : v.jid)
    .filter(id => id !== botNumber && id.split("@")[0] !== global.owner); 

  await m.reply(`🚀 Memulai pushkontak autosave kontak ke dalam grup ${data.subject} dengan total member ${halls.length}`);
  
  global.statuspush = true
 let count = 0
 let msg = await generateWAMessageFromContent(m.sender, { 
extendedTextMessage: { text: global.textpushkontak }}, { userJid: m.sender, quoted: FakeChannel });
 
  for (const mem of halls) {
    if (global.stoppush) {
    delete global.stoppush
    delete global.statuspush
    break
    }    
    const contactAction = {
        "fullName": `${text.split("|")[1]} #${mem.split("@")[0]}`,
        "lidJid": mem, 
        "saveOnPrimaryAddressbook": true
    };
await sock.relayMessage(mem, msg.message, { messageId: msg.key.id });
    await sock.addOrEditContact(mem, contactAction);
    await global.sleep(global.JedaPushkontak);
    count += 1
  }
  
  delete global.statuspush
  delete global.textpushkontak
  await m.reply(`✅ Sukses pushkontak!\nTotal kontak berhasil disimpan *${count}*`, jidawal)
}
break

//###############################//

case "savenomor":
case "sv":
case "save": {
    if (!isOwner) return m.reply(mess.owner)

    let nomor, nama

    if (m.isGroup) {
        if (!text) return m.reply(`*Contoh penggunaan di grup:*\n${cmd} @tag|nama\natau reply target dengan:\n${cmd} nama`)

        // Jika ada tag
        if (m.mentionedJid[0]) {
            nomor = m.mentionedJid[0]
            nama = text.split("|")[1]?.trim()
            if (!nama) return m.reply(`Harap tulis nama setelah "|"\n*Contoh:* ${cmd} @tag|nama`)
        } 
        // Jika reply
        else if (m.quoted) {
            nomor = m.quoted.sender
            nama = text.trim()
        } 
        // Jika input manual nomor
        else if (/^\d+$/.test(text.split("|")[0])) {
            nomor = text.split("|")[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net"
            nama = text.split("|")[1]?.trim()
            if (!nama) return m.reply(`Harap tulis nama setelah "|"\n*Contoh:* ${cmd} 628xxxx|nama`)
        } 
        else {
            return m.reply(`*Contoh penggunaan di grup:*\n${cmd} @tag|nama\natau reply target dengan:\n${cmd} nama`)
        }
    } else {
        // Private chat hanya nama
        if (!text) return m.reply(`*Contoh penggunaan di private:*\n${cmd} nama`)
        nomor = m.chat
        nama = text.trim()
    }

    const contactAction = {
        "fullName": nama,
        "lidJid": nomor,
        "saveOnPrimaryAddressbook": true
    };

    await sock.addOrEditContact(nomor, contactAction);

    return m.reply(`✅ Berhasil menyimpan kontak

- Nomor: ${nomor.split("@")[0]}
- Nama: ${nama}`)
}
break

//###############################//

case "savekontak": case "svkontak": {
if (!isOwner) return m.reply(mess.owner)
if (!text) return m.reply(`Masukan namakontak\n*Contoh :* ${cmd} Xskycode`)
global.namakontak = text
let rows = []
const a = await sock.groupFetchAllParticipating()
if (a.length < 1) return m.reply("Tidak ada grup chat.")
const Data = Object.values(a)
let number = 0
for (let u of Data) {
const name = u.subject || "Unknown"
rows.push({
title: name,
description: `Total Member: ${u.participants.length}`, 
id: `.savekontak-response ${u.id}`
})
}
await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Grup',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Target Grup Savekontak\n`
}, { quoted: m })
}
break

//###############################//

case "savekontak-response": {
  if (!isOwner) return m.reply(mess.owner)
  if (!global.namakontak) return m.reply(`Data nama savekontak tidak ditemukan!\nSilahkan ketik *.savekontak* namakontak`);
  try {
    const res = await sock.groupMetadata(text)
    const halls = res.participants
      .filter(v => v.id.includes("@s.whatsapp.net") ? v.id : v.jid)
      .map(v => v.id.includes("@s.whatsapp.net") ? v.id : v.jid)
      .filter(id => id !== botNumber && id.split("@")[0] !== global.owner)

    if (!halls.length) return m.reply("Tidak ada kontak yang bisa disimpan.")
    let names = text
    const existingContacts = JSON.parse(fs.readFileSync('./storage/contacts.json', 'utf8') || '[]')
    const newContacts = [...new Set([...existingContacts, ...halls])]

    fs.writeFileSync('./storage/contacts.json', JSON.stringify(newContacts, null, 2))

    // Buat file .vcf
    const vcardContent = newContacts.map(contact => {
      const phone = contact.split("@")[0]
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${global.namakontak} - ${phone}`,
        `TEL;type=CELL;type=VOICE;waid=${phone}:+${phone}`,
        "END:VCARD",
        ""
      ].join("\n")
    }).join("")

    fs.writeFileSync("./storage/contacts.vcf", vcardContent, "utf8")

    // Kirim ke private chat
    if (m.chat !== m.sender) {
      await m.reply(`Berhasil membuat file kontak dari grup ${res.subject}\n\nFile kontak telah dikirim ke private chat\nTotal ${halls.length} kontak`)
    }

    await sock.sendMessage(
      m.sender,
      {
        document: fs.readFileSync("./storage/contacts.vcf"),
        fileName: "contacts.vcf",
        caption: `File kontak berhasil dibuat ✅\nTotal ${halls.length} kontak`,
        mimetype: "text/vcard",
      },
      { quoted: m }
    )
    
    delete global.namakontak

    fs.writeFileSync("./storage/contacts.json", "[]")
    fs.writeFileSync("./storage/contacts.vcf", "")

  } catch (err) {
    m.reply("Terjadi kesalahan saat menyimpan kontak:\n" + err.toString())
  }
}
break

//###############################//

case "stopjpm": {
if (!isOwner) return m.reply(mess.owner)
if (!global.statusjpm) return m.reply("Jpm sedang tidak berjalan!")
global.stopjpm = true
return m.reply("Berhasil menghentikan jpm ✅")
}
break

//###############################//

case "stoppushkontak": case "stoppush": case "stoppus": {
if (!isOwner) return m.reply(mess.owner)
if (!global.statuspush) return m.reply("Pushkontak sedang tidak berjalan!")
global.stoppush = true
return m.reply("Berhasil menghentikan pushkontak ✅")
}
break

//###############################//

case "subdo":
case "subdomain": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text.includes("|")) return m.reply(`*Contoh penggunaan :*
ketik ${cmd} hostname|ipvps`);

    const obj = Object.keys(subdomain);
    if (obj.length < 1) return m.reply("Tidak ada domain yang tersedia.");

    const hostname = text.split("|")[0].toLowerCase();
    const ip = text.split("|")[1];
    const rows = obj.map((domain, index) => ({
        title: `🌐 ${domain}`,
        description: `Result: https://${hostname}.${domain}`,
        id: `.subdomain-response ${index + 1} ${hostname.trim()}|${ip}`
    }));

    await sock.sendMessage(m.chat, {
        buttons: [
            {
                buttonId: 'action',
                buttonText: { displayText: 'ini pesan interactiveMeta' },
                type: 4,
                nativeFlowInfo: {
                    name: 'single_select',
                    paramsJson: JSON.stringify({
                        title: 'Pilih Domain',
                        sections: [
                            {
                                title: `© Powered By ${namaOwner}`,
                                rows: rows
                            }
                        ]
                    })
                }
            }
        ],
        headerType: 1,
        viewOnce: true,
        text: `\nPilih Domain Server Yang Tersedia\nTotal Domain: ${obj.length}\n`
    }, { quoted: m });
}
break;

//###############################//

case "subdomain-response": { 
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return;

    if (!args[0] || isNaN(args[0])) return m.reply("Domain tidak ditemukan!");
    const dom = Object.keys(subdomain);
    const domainIndex = Number(args[0]) - 1;
    if (domainIndex >= dom.length || domainIndex < 0) return m.reply("Domain tidak ditemukan!");

    if (!args[1] || !args[1].includes("|")) return m.reply("Hostname/IP Tidak ditemukan!");

    let tldnya = dom[domainIndex];
    const [host, ip] = args[1].split("|").map(str => str.trim());

    async function subDomain1(host, ip) {
        return new Promise((resolve) => {
            axios.post(
                `https://api.cloudflare.com/client/v4/zones/${subdomain[tldnya].zone}/dns_records`,
                {
                    type: "A",
                    name: `${host.replace(/[^a-z0-9.-]/gi, "")}.${tldnya}`,
                    content: ip.replace(/[^0-9.]/gi, ""),
                    ttl: 3600,
                    priority: 10,
                    proxied: false,
                },
                {
                    headers: {
                        Authorization: `Bearer ${subdomain[tldnya].apitoken}`,
                        "Content-Type": "application/json",
                    },
                }
            ).then(response => {
                let res = response.data;
                if (res.success) {
                    resolve({ success: true, name: res.result?.name, ip: res.result?.content });
                } else {
                    resolve({ success: false, error: "Gagal membuat subdomain." });
                }
            }).catch(error => {
                let errorMsg = error.response?.data?.errors?.[0]?.message || error.message || "Terjadi kesalahan!";
                resolve({ success: false, error: errorMsg });
            });
        });
    }

    const domnode = `node${getRandom("")}.${host}`;
    let panelDomain = "";
    let nodeDomain = "";

    for (let i = 0; i < 2; i++) {
        let subHost = i === 0 ? host.toLowerCase() : domnode;
        try {
            let result = await subDomain1(subHost, ip);
            if (result.success) {
                if (i === 0) panelDomain = result.name;
                else nodeDomain = result.name;
            } else {
                return m.reply(result.error);
            }
        } catch (err) {
            return m.reply("Error: " + err.message);
        }
    }

    let teks = `
*✅ Subdomain Berhasil Dibuat*

- IP: ${ip}
- Panel: ${panelDomain}
- Node: ${nodeDomain}
`;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Subdomain Panel","copy_code":"${panelDomain}"}`
                            },
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Subdomain Node","copy_code":"${nodeDomain}"}`
                            }
                        ]
                    }
                }
            }
        }
    }, { userJid: m.sender, quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}
break;

//###############################//

case "installpanel": {
    if (!isOwner) return m.reply(mess.owner)
    if (!text) return m.reply("\nFormat salah!\n\n*Contoh penggunaan :*\nketik .instalpanel ipvps|pwvps|panel.com|node.com|ramserver *(contoh 100000)*");
    
    let vii = text.split("|");
    if (vii.length < 5) return m.reply("\nFormat salah!\n\n*Contoh penggunaan :*\nketik .instalpanel ipvps|pwvps|panel.com|node.com|ramserver *(contoh 100000)*");
    
    const ssh2 = require("ssh2");
    const ress = new ssh2.Client();
    const connSettings = {
        host: vii[0],
        port: '22',
        username: 'root',
        password: vii[1]
    };
    
    const jids = m.chat
    const pass = "admin001";
    let passwordPanel = pass;
    const domainpanel = vii[2];
    const domainnode = vii[3];
    const ramserver = vii[4];
    const deletemysql = `\n`;
    const commandPanel = `bash <(curl -s https://pterodactyl-installer.se)`;
    
    async function instalWings() {
    ress.exec(commandPanel, async (err, stream) => {
        if (err) {
            console.error('Wings installation error:', err);
            m.reply(`Gagal memulai instalasi Wings: ${err.message}`);
            return ress.end();
        }
        
        stream.on('close', async (code, signal) => {
            await InstallNodes()            
        }).on('data', async (data) => {
            const dataStr = data.toString();
            console.log('Wings Install: ' + dataStr);
            
            if (dataStr.includes('Input 0-6')) {
                stream.write('1\n');
            }
            else if (dataStr.includes('(y/N)')) {
                stream.write('y\n');
            }
            else if (dataStr.includes('Enter the panel address (blank for any address)')) {
                stream.write(`${domainpanel}\n`);
            }
            else if (dataStr.includes('Database host username (pterodactyluser)')) {
                stream.write('admin\n');
            }
            else if (dataStr.includes('Database host password')) {
                stream.write('admin\n');
            }
            else if (dataStr.includes('Set the FQDN to use for Let\'s Encrypt (node.example.com)')) {
                stream.write(`${domainnode}\n`);
            }
            else if (dataStr.includes('Enter email address for Let\'s Encrypt')) {
                stream.write('admin@gmail.com\n');
            }
        }).stderr.on('data', async (data) => {
            console.error('Wings Install Error: ' + data);
            m.reply(`Error pada instalasi Wings:\n${data}`);
        });
    });
}

    async function InstallNodes() {
        ress.exec('bash <(curl -s https://raw.githubusercontent.com/SkyzoOffc/Pterodactyl-Theme-Autoinstaller/main/createnode.sh)', async (err, stream) => {
            if (err) throw err;
            
            stream.on('close', async (code, signal) => {
                
    let teks = `
*Install Panel Telah Berhasil ✅*

*Berikut Detail Akun Panel Kamu 📦*

👤 Username : \`${usernamePanel}\`
🔐 Password : \`${passwordPanel}\`
🌐 ${domainpanel}

Silahkan setting allocation & ambil token node di node yang sudah dibuat oleh bot.

*Cara menjalankan wings :*
\`.startwings ipvps|pwvps|tokennode\`
    `;

    let msg = await generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: teks },
                    nativeFlowMessage: {
                        buttons: [
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Username","copy_code":"${usernamePanel}"}`
                            },
                            { 
                                name: "cta_copy",
                                buttonParamsJson: `{"display_text":"Copy Password","copy_code":"${passwordPanel}"}`
                            },
                            { 
                                name: "cta_url",
                                buttonParamsJson: `{"display_text":"Login Panel","url":"${domainpanel}"}`
                            }
                        ]
                    }, 
                    contextInfo: {
                    isForwarded: true
                    }
                }
            }
        }
    }, {});

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
                
                ress.end();
            }).on('data', async (data) => {
                await console.log(data.toString());
                if (data.toString().includes("Masukkan nama lokasi: ")) {
                    stream.write('Singapore\n');
                }
                if (data.toString().includes("Masukkan deskripsi lokasi: ")) {
                    stream.write('Node By Skyzo\n');
                }
                if (data.toString().includes("Masukkan domain: ")) {
                    stream.write(`${domainnode}\n`);
                }
                if (data.toString().includes("Masukkan nama node: ")) {
                    stream.write('Skyzopedia\n');
                }
                if (data.toString().includes("Masukkan RAM (dalam MB): ")) {
                    stream.write(`${ramserver}\n`);
                }
                if (data.toString().includes("Masukkan jumlah maksimum disk space (dalam MB): ")) {
                    stream.write(`${ramserver}\n`);
                }
                if (data.toString().includes("Masukkan Locid: ")) {
                    stream.write('1\n');
                }
            }).stderr.on('data', async (data) => {
                console.log('Stderr : ' + data);
                m.reply(`Error pada instalasi Wings: ${data}`);
            });
        });
    }

    async function instalPanel() {
        ress.exec(commandPanel, (err, stream) => {
            if (err) throw err;
            
            stream.on('close', async (code, signal) => {
                await instalWings();
            }).on('data', async (data) => {
                if (data.toString().includes('Input 0-6')) {
                    stream.write('0\n');
                } 
                if (data.toString().includes('(y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Database name (panel)')) {
                    stream.write('\n');
                }
                if (data.toString().includes('Database username (pterodactyl)')) {
                    stream.write('admin\n');
                }
                if (data.toString().includes('Password (press enter to use randomly generated password)')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('Select timezone [Europe/Stockholm]')) {
                    stream.write('Asia/Jakarta\n');
                } 
                if (data.toString().includes('Provide the email address that will be used to configure Let\'s Encrypt and Pterodactyl')) {
                    stream.write('admin@gmail.com\n');
                } 
                if (data.toString().includes('Email address for the initial admin account')) {
                    stream.write('admin@gmail.com\n');
                } 
                if (data.toString().includes('Username for the initial admin account')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('First name for the initial admin account')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('Last name for the initial admin account')) {
                    stream.write('admin\n');
                } 
                if (data.toString().includes('Password for the initial admin account')) {
                    stream.write(`${passwordPanel}\n`);
                } 
                if (data.toString().includes('Set the FQDN of this panel (panel.example.com)')) {
                    stream.write(`${domainpanel}\n`);
                } 
                if (data.toString().includes('Do you want to automatically configure UFW (firewall)')) {
                    stream.write('y\n')
                } 
                if (data.toString().includes('Do you want to automatically configure HTTPS using Let\'s Encrypt? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Select the appropriate number [1-2] then [enter] (press \'c\' to cancel)')) {
                    stream.write('1\n');
                } 
                if (data.toString().includes('I agree that this HTTPS request is performed (y/N)')) {
                    stream.write('y\n');
                }
                if (data.toString().includes('Proceed anyways (your install will be broken if you do not know what you are doing)? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('(yes/no)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Initial configuration completed. Continue with installation? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Still assume SSL? (y/N)')) {
                    stream.write('y\n');
                } 
                if (data.toString().includes('Please read the Terms of Service')) {
                    stream.write('y\n');
                }
                if (data.toString().includes('(A)gree/(C)ancel:')) {
                    stream.write('A\n');
                } 
                console.log('Logger: ' + data.toString());
            }).stderr.on('data', (data) => {
                m.reply(`Error Terjadi kesalahan :\n${data}`);
                console.log('STDERR: ' + data);
            });
        });
    }

    ress.on('ready', async () => {
        await m.reply(`*Memproses install server panel 🚀*\n\n` +
                     `*IP Address:* ${vii[0]}\n` +
                     `*Domain Panel:* ${domainpanel}\n\n` +
                     `Mohon tunggu 10-20 menit hingga proses install selesai`);
        
        ress.exec(deletemysql, async (err, stream) => {
            if (err) throw err;
            
            stream.on('close', async (code, signal) => {
                await instalPanel();
            }).on('data', async (data) => {
                await stream.write('\t');
                await stream.write('\n');
                await console.log(data.toString());
            }).stderr.on('data', async (data) => {
                m.reply(`Error Terjadi kesalahan :\n${data}`);
                console.log('Stderr : ' + data);
            });
        });
    });

    ress.on('error', (err) => {
        console.error('SSH Connection Error:', err);
        m.reply(`Gagal terhubung ke server: ${err.message}`);
    });

    ress.connect(connSettings);
}
break

//###############################//

case "startwings":
case "configurewings": {
    if (!isOwner) return m.reply(mess.owner)
    let t = text.split('|');
    if (t.length < 3) return m.reply("\nFormat salah!\n\n*Contoh penggunaan :*\nketik .startwings ipvps|pwvps|token_wings");

    let ipvps = t[0].trim();
    let passwd = t[1].trim();
    let token = t[2].trim();

    const connSettings = {
        host: ipvps,
        port: 22,
        username: 'root',
        password: passwd
    };

    const command = `${token} && systemctl start wings`;

    const ress = new ssh2.Client();

    ress.on('ready', () => {
        ress.exec(command, (err, stream) => {
            if (err) {
                m.reply('Gagal menjalankan perintah di VPS');
                ress.end();
                return;
            }

            stream.on('close', async (code, signal) => {
                await m.reply("Berhasil menjalankan wings node panel pterodactyl ✅");
                ress.end();
            }).on('data', (data) => {
                console.log("STDOUT:", data.toString());
            }).stderr.on('data', (data) => {
                console.log("STDERR:", data.toString());
                // Opsi jika perlu input interaktif
                stream.write("y\n");
                stream.write("systemctl start wings\n");
                m.reply('Terjadi error saat eksekusi:\n' + data.toString());
            });
        });
    }).on('error', (err) => {
        console.log('Connection Error:', err.message);
        m.reply('Gagal terhubung ke VPS: IP atau password salah.');
    }).connect(connSettings);
}
break;

//###############################//

case "1gb": case "2gb": case "3gb": case "4gb": case "5gb": 
case "6gb": case "7gb": case "8gb": case "9gb": case "10gb": 
case "unlimited": case "unli": {
    if (!isOwner && !isReseller) {
        return m.reply(`Fitur ini untuk di dalam grup reseller panel`);
    }
    if (!text) return m.reply(`*Contoh :* ${cmd} username,6283XXX`)

    let nomor, usernem;
    let tek = text.split(",");
    if (tek.length > 1) {
        let [users, nom] = tek.map(t => t.trim());
        if (!users || !nom) return m.reply(`*Contoh :* ${cmd} username,6283XXX`)
        nomor = nom.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        usernem = users.toLowerCase();
    } else {
        usernem = text.toLowerCase();
        nomor = m.isGroup ? m.sender : m.chat
    }

    try {
        var onWa = await sock.onWhatsApp(nomor.split("@")[0]);
        if (onWa.length < 1) return m.reply("Nomor target tidak terdaftar di WhatsApp!");
    } catch (err) {
        return m.reply("Terjadi kesalahan saat mengecek nomor WhatsApp: " + err.message);
    }

    // Mapping RAM, Disk, dan CPU
    const resourceMap = {
        "1gb": { ram: "1000", disk: "1000", cpu: "40" },
        "2gb": { ram: "2000", disk: "1000", cpu: "60" },
        "3gb": { ram: "3000", disk: "2000", cpu: "80" },
        "4gb": { ram: "4000", disk: "2000", cpu: "100" },
        "5gb": { ram: "5000", disk: "3000", cpu: "120" },
        "6gb": { ram: "6000", disk: "3000", cpu: "140" },
        "7gb": { ram: "7000", disk: "4000", cpu: "160" },
        "8gb": { ram: "8000", disk: "4000", cpu: "180" },
        "9gb": { ram: "9000", disk: "5000", cpu: "200" },
        "10gb": { ram: "10000", disk: "5000", cpu: "220" },
        "unlimited": { ram: "0", disk: "0", cpu: "0" }
    };
    
    let { ram, disk, cpu } = resourceMap[command] || { ram: "0", disk: "0", cpu: "0" };

    let username = usernem.toLowerCase();
    let email = username + "@gmail.com";
    let name = global.capital(username) + " Server";
    let password = username + "001";

    try {
        let f = await fetch(domain + "/api/application/users", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikey },
            body: JSON.stringify({ email, username, first_name: name, last_name: "Server", language: "en", password })
        });
        let data = await f.json();
        if (data.errors) return m.reply("Error: " + JSON.stringify(data.errors[0], null, 2));
        let user = data.attributes;

        let f1 = await fetch(domain + `/api/application/nests/${nestid}/eggs/` + egg, {
            method: "GET",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikey }
        });
        let data2 = await f1.json();
        let startup_cmd = data2.attributes.startup;

        let f2 = await fetch(domain + "/api/application/servers", {
            method: "POST",
            headers: { "Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + apikey },
            body: JSON.stringify({
                name,
                description: global.tanggal(Date.now()),
                user: user.id,
                egg: parseInt(egg),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_20",
                startup: startup_cmd,
                environment: { INST: "npm", USER_UPLOAD: "0", AUTO_UPDATE: "0", CMD_RUN: "npm start" },
                limits: { memory: ram, swap: 0, disk, io: 500, cpu },
                feature_limits: { databases: 5, backups: 5, allocations: 5 },
                deploy: { locations: [parseInt(loc)], dedicated_ip: false, port_range: [] },
            })
        });
        let result = await f2.json();
        if (result.errors) return m.reply("Error: " + JSON.stringify(result.errors[0], null, 2));
        
        let server = result.attributes;
        var orang = nomor
        if (orang !== m.chat) {
        await m.reply(`Berhasil membuat akun panel ✅\ndata akun terkirim ke nomor ${nomor.split("@")[0]}`)
        }

let teks = `
*Behasil membuat panel ✅*

📡 Server ID: ${server.id}
👤 Username: \`${user.username}\`
🔐 Password: \`${password}\`
🗓️ Tanggal Aktivasi: ${global.tanggal(Date.now())}

*Spesifikasi server panel*
- RAM: ${ram == "0" ? "Unlimited" : ram / 1000 + "GB"}
- Disk: ${disk == "0" ? "Unlimited" : disk / 1000 + "GB"}
- CPU: ${cpu == "0" ? "Unlimited" : cpu + "%"}
- Panel: ${global.domain}

*Rules pembelian panel*  
- Masa aktif 30 hari  
- Data bersifat pribadi, mohon disimpan dengan aman  
- Garansi berlaku 15 hari (1x replace)  
- Klaim garansi wajib menyertakan *bukti chat pembelian*
`

let msg = await generateWAMessageFromContent(orang, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        { 
                            name: "cta_copy",
                            buttonParamsJson: `{"display_text":"Copy Username","copy_code":"${user.username}"}`
                        },
                        { 
                            name: "cta_copy",
                            buttonParamsJson: `{"display_text":"Copy Password","copy_code":"${password}"}`
                        },
                        { 
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Open Panel","url":"${global.domain}"}`
                        }
                    ]
                }
            }
        }
    }
}, {});

await sock.relayMessage(orang, msg.message, { messageId: msg.key.id });
    } catch (err) {
        return m.reply("Terjadi kesalahan: " + err.message);
    }
}
break

//###############################//

case "delpanel": {
    if (!isOwner && !isReseller) {
        return m.reply(mess.owner);
    }
    const rows = []
    rows.push({
title: `Hapus Semua`,
description: `Hapus semua server panel`, 
id: `.delpanel-all`
})            
    try {
        const response = await fetch(`${domain}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`,
            },
        });

        const result = await response.json();
        const servers = result.data;

        if (!servers || servers.length === 0) {
            return m.reply("Tidak ada server panel!");
        }

        let messageText = `\n*Total server panel :* ${servers.length}\n`

        for (const server of servers) {
            const s = server.attributes;

            const resStatus = await fetch(`${domain}/api/client/servers/${s.uuid.split("-")[0]}/resources`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${capikey}`,
                },
            });

            const statusData = await resStatus.json();

            const ram = s.limits.memory === 0
                ? "Unlimited"
                : s.limits.memory >= 1024
                ? `${Math.floor(s.limits.memory / 1024)} GB`
                : `${s.limits.memory} MB`;

            const disk = s.limits.disk === 0
                ? "Unlimited"
                : s.limits.disk >= 1024
                ? `${Math.floor(s.limits.disk / 1024)} GB`
                : `${s.limits.disk} MB`;

            const cpu = s.limits.cpu === 0
                ? "Unlimited"
                : `${s.limits.cpu}%`;
            rows.push({
title: `${s.name} || ID:${s.id}`,
description: `Ram ${ram} || Disk ${disk} || CPU ${cpu}`, 
id: `.delpanel-response ${s.id}`
})            
        }                  
        await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Server Panel',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Server Panel Yang Ingin Dihapus\n`
}, { quoted: m })

    } catch (err) {
        console.error("Error listing panel servers:", err);
        m.reply("Terjadi kesalahan saat mengambil data server.");
    }
}
break;

//###############################//

case "delpanel-response": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return 
    
    try {
        const serverResponse = await fetch(domain + "/api/application/servers", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apikey
            }
        });
        const serverData = await serverResponse.json();
        const servers = serverData.data;
        
        let serverName;
        let serverSection;
        let serverFound = false;
        
        for (const server of servers) {
            const serverAttr = server.attributes;
            
            if (Number(text) === serverAttr.id) {
                serverSection = serverAttr.name.toLowerCase();
                serverName = serverAttr.name;
                serverFound = true;
                
                const deleteServerResponse = await fetch(domain + `/api/application/servers/${serverAttr.id}`, {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + apikey
                    }
                });
                
                if (!deleteServerResponse.ok) {
                    const errorData = await deleteServerResponse.json();
                    console.error("Gagal menghapus server:", errorData);
                }
                
                break;
            }
        }
        
        if (!serverFound) {
            return m.reply("Gagal menghapus server!\nID server tidak ditemukan");
        }
        
        const userResponse = await fetch(domain + "/api/application/users", {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apikey
            }
        });
        const userData = await userResponse.json();
        const users = userData.data;
        
        for (const user of users) {
            const userAttr = user.attributes;
            
            if (userAttr.first_name.toLowerCase() === serverSection) {
                const deleteUserResponse = await fetch(domain + `/api/application/users/${userAttr.id}`, {
                    method: "DELETE",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + apikey
                    }
                });
                
                if (!deleteUserResponse.ok) {
                    const errorData = await deleteUserResponse.json();
                    console.error("Gagal menghapus user:", errorData);
                }
                
                break;
            }
        }
        
        await m.reply(`*Barhasil Menghapus Sever Panel ✅*\n- ID: ${text}\n- Nama Server: ${capital(serverName)}`);
        
    } catch (error) {
        console.error("Error dalam proses delpanel:", error);
        await m.reply("Terjadi kesalahan saat memproses permintaan");
    }
}
break;

//###############################//

case "delpanel-all": {
if (!isOwner) return m.reply(mess.owner)
await m.reply(`Memproses penghapusan semua user & server panel yang bukan admin`)
try {
const PTERO_URL = global.domain
// Ganti dengan URL panel Pterodactyl
const API_KEY = global.apikey// API Key dengan akses admin

// Konfigurasi headers
const headers = {
  "Authorization": "Bearer " + API_KEY,
  "Content-Type": "application/json",
  "Accept": "application/json",
};

// Fungsi untuk mendapatkan semua user
async function getUsers() {
  try {
    const res = await axios.get(`${PTERO_URL}/api/application/users`, { headers });
    return res.data.data;
  } catch (error) {
    m.reply(JSON.stringify(error.response?.data || error.message, null, 2))
    
    return [];
  }
}

// Fungsi untuk mendapatkan semua server
async function getServers() {
  try {
    const res = await axios.get(`${PTERO_URL}/api/application/servers`, { headers });
    return res.data.data;
  } catch (error) {
    m.reply(JSON.stringify(error.response?.data || error.message, null, 2))
    return [];
  }
}

// Fungsi untuk menghapus server berdasarkan UUID
async function deleteServer(serverUUID) {
  try {
    await axios.delete(`${PTERO_URL}/api/application/servers/${serverUUID}`, { headers });
    console.log(`Server ${serverUUID} berhasil dihapus.`);
  } catch (error) {
    console.error(`Gagal menghapus server ${serverUUID}:`, error.response?.data || error.message);
  }
}

// Fungsi untuk menghapus user berdasarkan ID
async function deleteUser(userID) {
  try {
    await axios.delete(`${PTERO_URL}/api/application/users/${userID}`, { headers });
    console.log(`User ${userID} berhasil dihapus.`);
  } catch (error) {
    console.error(`Gagal menghapus user ${userID}:`, error.response?.data || error.message);
  }
}

// Fungsi utama untuk menghapus semua user & server yang bukan admin
async function deleteNonAdminUsersAndServers() {
  const users = await getUsers();
  const servers = await getServers();
  let totalSrv = 0

  for (const user of users) {
    if (user.attributes.root_admin) {
      console.log(`Lewati admin: ${user.attributes.username}`);
      continue; // Lewati admin
    }

    const userID = user.attributes.id;
    const userEmail = user.attributes.email;

    console.log(`Menghapus user: ${user.attributes.username} (${userEmail})`);

    // Cari server yang dimiliki user ini
    const userServers = servers.filter(srv => srv.attributes.user === userID);

    // Hapus semua server user ini
    for (const server of userServers) {
      await deleteServer(server.attributes.id);
      totalSrv += 1
    }

    // Hapus user setelah semua servernya terhapus
    await deleteUser(userID);
  }
await m.reply(`Berhasil menghapus *${totalSrv} user & server* panel yang bukan admin ✅`)
}

// Jalankan fungsi
return deleteNonAdminUsersAndServers();
} catch (err) {
return m.reply(`${JSON.stringify(err, null, 2)}`)
}
}
break

//###############################//

case "listpanel":
case "listserver": {
    if (!isOwner && !isReseller) {
        return m.reply(`Fitur ini hanya untuk di dalam grup reseller panel`);
    }

    try {
        const response = await fetch(`${domain}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`,
            },
        });

        const result = await response.json();
        const servers = result.data;

        if (!servers || servers.length === 0) {
            return m.reply("Tidak ada server panel!");
        }

        let messageText = `\n*Total server panel :* ${servers.length}\n`

        for (const server of servers) {
            const s = server.attributes;

            const resStatus = await fetch(`${domain}/api/client/servers/${s.uuid.split("-")[0]}/resources`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${capikey}`,
                },
            });

            const statusData = await resStatus.json();

            const ram = s.limits.memory === 0
                ? "Unlimited"
                : s.limits.memory >= 1024
                ? `${Math.floor(s.limits.memory / 1024)} GB`
                : `${s.limits.memory} MB`;

            const disk = s.limits.disk === 0
                ? "Unlimited"
                : s.limits.disk >= 1024
                ? `${Math.floor(s.limits.disk / 1024)} GB`
                : `${s.limits.disk} MB`;

            const cpu = s.limits.cpu === 0
                ? "Unlimited"
                : `${s.limits.cpu}%`;

            messageText += `
- ID : *${s.id}*
- Nama Server : *${s.name}*
- Ram : *${ram}*
- Disk : *${disk}*
- CPU : *${cpu}*
- Created : *${s.created_at.split("T")[0]}*\n`;
        }                  
        await m.reply(messageText)

    } catch (err) {
        console.error("Error listing panel servers:", err);
        m.reply("Terjadi kesalahan saat mengambil data server.");
    }
}
break;

//###############################//

case "cadmin": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} skyzopedia,628XXX`)
    let nomor, usernem;
    const tek = text.split(",");
    if (tek.length > 1) {
        let [users, nom] = tek;
        if (!users || !nom) return m.reply(`Masukan username & nomor (opsional)\n*contoh:* ${cmd} skyzopedia,628XXX`)

        nomor = nom.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
        usernem = users.toLowerCase();
    } else {
        usernem = text.toLowerCase();
        nomor = m.isGroup ? m.sender : m.chat;
    }

    const onWa = await sock.onWhatsApp(nomor.split("@")[0]);
    if (onWa.length < 1) return m.reply("Nomor target tidak terdaftar di WhatsApp!");

    const username = usernem.toLowerCase();
    const email = `${username}@gmail.com`;
    const name = global.capital(args[0]);
    const password = `${username}001`;

    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            },
            body: JSON.stringify({
                email,
                username,
                first_name: name,
                last_name: "Admin",
                root_admin: true,
                language: "en",
                password
            })
        });

        const data = await res.json();
        if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));

        const user = data.attributes;
        const orang = nomor;

        if (nomor !== m.chat) {
            await m.reply(`Berhasil membuat akun admin panel ✅\nData akun terkirim ke nomor ${nomor.split("@")[0]}`);
        }

const teks = `
*Berikut membuat admin panel ✅*

📡 Server ID: ${user.id}
👤 Username: \`${user.username}\`
🔐 Password: \`${password}\`
🗓️ Tanggal Aktivasi: ${global.tanggal(Date.now())}
*🌐* ${global.domain}

*Rules pembelian admin panel*  
- Masa aktif 30 hari  
- Data bersifat pribadi, mohon disimpan dengan aman  
- Garansi berlaku 15 hari (1x replace)  
- Klaim garansi wajib menyertakan *bukti chat pembelian*
`;

let msg = generateWAMessageFromContent(orang, {
    viewOnceMessage: {
        message: {
            interactiveMessage: {
                body: { text: teks },
                nativeFlowMessage: {
                    buttons: [
                        { 
                            name: "cta_copy",
                            buttonParamsJson: `{"display_text":"Copy Username","copy_code":"${user.username}"}`
                        },
                        { 
                            name: "cta_copy",
                            buttonParamsJson: `{"display_text":"Copy Password","copy_code":"${password}"}`
                        },
                        { 
                            name: "cta_url",
                            buttonParamsJson: `{"display_text":"Open Panel","url":"${global.domain}"}`
                        }
                    ]
                }
            }
        }
    }
}, {});

await sock.relayMessage(orang, msg.message, { messageId: msg.key.id });
    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat membuat akun admin panel.");
    }
}
break;

//###############################//

case "deladmin": {
    if (!isOwner) return m.reply(mess.owner);
    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });
        const rows = []
        const data = await res.json();
        const users = data.data;

        const adminUsers = users.filter(u => u.attributes.root_admin === true);
        if (adminUsers.length < 1) return m.reply("Tidak ada admin panel.");

        let teks = `\n*Total admin panel :* ${adminUsers.length}\n`
        adminUsers.forEach((admin, idx) => {
            teks += `
- ID : *${admin.attributes.id}*
- Nama : *${admin.attributes.first_name}*
- Created : ${admin.attributes.created_at.split("T")[0]}
`;
rows.push({
title: `${admin.attributes.first_name} || ID:${admin.attributes.id}`,
description: `Created At: ${admin.attributes.created_at.split("T")[0]}`, 
id: `.deladmin-response ${admin.attributes.id}`
})            
        });

        await sock.sendMessage(m.chat, {
  buttons: [
    {
    buttonId: 'action',
    buttonText: { displayText: 'ini pesan interactiveMeta' },
    type: 4,
    nativeFlowInfo: {
        name: 'single_select',
        paramsJson: JSON.stringify({
          title: 'Pilih Admin Panel',
          sections: [
            {
              title: `© Powered By ${namaOwner}`,
              rows: rows
            }
          ]
        })
      }
      }
  ],
  headerType: 1,
  viewOnce: true,
  text: `\nPilih Admin Panel Yang Ingin Dihapus\n`
}, { quoted: m })

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat mengambil data admin.");
    }
}
break;

//###############################//

case "deladmin-response": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text) return 
    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });

        const data = await res.json();
        const users = data.data;

        let targetAdmin = users.find(
            (e) => e.attributes.id == args[0] && e.attributes.root_admin === true
        );

        if (!targetAdmin) {
            return m.reply("Gagal menghapus akun!\nID user tidak ditemukan");
        }

        const idadmin = targetAdmin.attributes.id;
        const username = targetAdmin.attributes.username;

        const delRes = await fetch(`${domain}/api/application/users/${idadmin}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });

        if (!delRes.ok) {
            const errData = await delRes.json();
            return m.reply(`Gagal menghapus akun admin!\n${JSON.stringify(errData.errors[0], null, 2)}`);
        }

        await m.reply(`*Berhasil Menghapus Admin Panel ✅*\n- ID: ${text}\n- Nama User: ${global.capital(username)}`);

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat menghapus akun admin.");
    }
}
break;

//###############################//

case "listadmin": {
    if (!isOwner) return m.reply(mess.owner);

    try {
        const res = await fetch(`${domain}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${apikey}`
            }
        });

        const data = await res.json();
        const users = data.data;

        const adminUsers = users.filter(u => u.attributes.root_admin === true);
        if (adminUsers.length < 1) return m.reply("Tidak ada admin panel.");

        let teks = `\n*Total admin panel :* ${adminUsers.length}\n`
        adminUsers.forEach((admin, idx) => {
            teks += `
- ID : *${admin.attributes.id}*
- Nama : *${admin.attributes.first_name}*
- Created : ${admin.attributes.created_at.split("T")[0]}
`;
        });

        await m.reply(teks)

    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat mengambil data admin.");
    }
}
break;

//###############################//

case "addseller": {
    if (!isOwner) return m.reply(mess.owner);
    if (!text && !m.quoted) return m.reply(`*contoh:* ${cmd} 6283XXX`);

    const input = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const input2 = input.split("@")[0];

    if (input2 === global.owner || global.db.settings.reseller.includes(input) || input === botNumber)
        return m.reply(`Nomor ${input2} sudah menjadi reseller!`);

    global.db.settings.reseller.push(input);
    m.reply(`Berhasil menambah reseller ✅`);
}
break;

//###############################//

case "listseller": {
    const list = global.db.settings.reseller;
    if (!list || list.length < 1) return m.reply("Tidak ada user reseller");

    let teks = `Daftar reseller:\n`;
    for (let i of list) {
        const num = i.split("@")[0];
        teks += `\n• ${num}\n  Tag: @${num}\n`;
    }

    sock.sendMessage(m.chat, { text: teks, mentions: list }, { quoted: m });
}
break;

//###############################//

case "delseller": {
    if (!isOwner) return m.reply(mess.owner);
    if (!m.quoted && !text) return m.reply(`*Contoh :* ${cmd} 6283XXX`);

    const input = m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.quoted 
            ? m.quoted.sender 
            : text.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const input2 = input.split("@")[0];

    if (input2 === global.owner || input === botNumber)
        return m.reply(`Tidak bisa menghapus owner!`);

    const list = global.db.settings.reseller;
    if (!list.includes(input))
        return m.reply(`Nomor ${input2} bukan reseller!`);

    list.splice(list.indexOf(input), 1);
    m.reply(`Berhasil menghapus reseller ✅`);
}
break;

//###############################//

case "own": case "owner": {
await sock.sendContact(m.chat, [global.owner], global.namaOwner, "Developer Bot", m)
}
break

//###############################//

case "addowner": case "addown": {
    if (!isOwner) return m.reply(mess.owner);

    const input = m.quoted 
        ? m.quoted.sender 
        : m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : text 
                ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" 
                : null;

    if (!input) return m.reply(`*Contoh penggunaan :*\n${cmd} 6285XXX`);

    const jid = input.split("@")[0];
    const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";

    if (jid == global.owner || input == botNumber) 
        return m.reply(`Nomor ${jid} sudah menjadi ownerbot.`);

    if (global.db.settings.developer.includes(input)) 
        return m.reply(`Nomor ${jid} sudah menjadi ownerbot.`);

    global.db.settings.developer.push(input);
    return m.reply(`Berhasil menambah owner ✅\n- ${jid}`);
}
break;

//###############################//

case "delowner": case "delown": {
    if (!isOwner) return m.reply(mess.owner);

    const input = m.quoted 
        ? m.quoted.sender 
        : m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : text 
                ? text.replace(/[^0-9]/g, "") + "@s.whatsapp.net" 
                : null;

    if (!input) return m.reply(`*Contoh penggunaan :*\n${cmd} 6285XXX`);

    if (input.toLowerCase() === "all") {
        global.db.settings.developer = [];
        return m.reply("Berhasil menghapus semua owner ✅");
    }

    if (!global.db.settings.developer.includes(input)) 
        return m.reply("Nomor tidak ditemukan!");

    global.db.settings.developer = global.db.settings.developer.filter(i => i !== input);
    return m.reply(`Berhasil menghapus owner ✅\n- ${input.split("@")[0]}`);
}
break;

//###############################//

case "listowner": case "listown": {
    const Own = global.db.settings.developer;
    if (!Own || Own.length < 1) return m.reply("Tidak ada owner tambahan.");

    let teks = "Daftar owner tambahan:\n";
    for (let i of Own) {
        const num = i.split("@")[0];
        teks += `\n- Number: ${num}\n- Tag: @${num}\n`;
    }
    return sock.sendMessage(m.chat, { text: teks, mentions: Own }, { quoted: m });
}
break;

//###############################//

case "resetdb": case "rstdb": {
if (!isOwner) return m.reply(mess.owner)
global.db = {}
return m.reply("Berhasil mereset database ✅")
}
break

//###############################//

default:
if (m.text.toLowerCase().startsWith("xx")) {
    if (m.sender.split("@")[0] !== global.owner) return 

    try {
        const result = await eval(`(async () => { ${text} })()`);
        const output = typeof result !== "string" ? util.inspect(result) : result;
        return sock.sendMessage(m.chat, { text: util.format(output) }, { quoted: m });
    } catch (err) {
        return sock.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

//###############################//

if (m.text.toLowerCase().startsWith("x")) {
    if (m.sender.split("@")[0] !== global.owner) return 

    try {
        let result = await eval(text);
        if (typeof result !== "string") result = util.inspect(result);
        return sock.sendMessage(m.chat, { text: util.format(result) }, { quoted: m });
    } catch (err) {
        return sock.sendMessage(m.chat, { text: util.format(err) }, { quoted: m });
    }
}

//###############################//

if (m.text.startsWith('$')) {
    if (!isOwner) return;
    
    exec(m.text.slice(2), (err, stdout) => {
        if (err) {
            return sock.sendMessage(m.chat, { text: err.toString() }, { quoted: m });
        }
        if (stdout) {
            return sock.sendMessage(m.chat, { text: util.format(stdout) }, { quoted: m });
        }
    });
}

}

} catch (err) {
console.log(err)
await sock.sendMessage(global.owner+"@s.whatsapp.net", {text: err.toString()}, {quoted: m ? m : null })
}}

//###############################//

process.on("uncaughtException", (err) => {
console.error("Caught exception:", err);
});

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.blue(">> Update File:"), chalk.black.bgWhite(__filename));
    delete require.cache[file];
    require(file);
});
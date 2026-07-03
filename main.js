require("./settings.js");
require("./source/Webp.js");
require("./source/Mess.js");
require("./source/Function.js");

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

//###############################//

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const PhoneNumber = require("awesome-phonenumber");
const pathModule = require("path");
const { tmpdir } = require("os");
const Crypto = require("crypto");
const readline = require("readline");
const chalk = require("chalk");
const qrcode = require("qrcode-terminal");
const FileType = require("file-type");
const ConfigBaileys = require("./source/Config.js");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./source/Webp.js");
const DataBase = require('./source/Database.js');
const database = new DataBase();
global.groupMetadataCache = new Map();

//###############################//

async function InputNumber(promptText) {
  const rl = readline.createInterface({
     input: process.stdin,
     output: process.stdout
  });
  return new Promise((resolve) => {
      rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

//###############################//

(async () => {
  const load = await database.read() || {};
  global.db = {
    users: load.users || {},
    groups: load.groups || {},
    settings: load.settings || {}
  };
  await database.write(global.db);
  setInterval(() => database.write(global.db), 3500);
})();

//###############################//

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState("sesi");
const os = require('os');

// Fungsi untuk format uptime
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
}

// Fungsi untuk mendapatkan IP lokal
function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

console.clear();
console.log(chalk.magenta(`
███╗   ██╗███████╗███████╗██╗   ██╗██╗  ██╗ ██████╗     ██████╗  ██████╗ ████████╗
████╗  ██║██╔════╝╚══███╔╝██║   ██║██║ ██╔╝██╔═══██╗    ██╔══██╗██╔═══██╗╚══██╔══╝
██╔██╗ ██║█████╗    ███╔╝ ██║   ██║█████╔╝ ██║   ██║    ██████╔╝██║   ██║   ██║   
██║╚██╗██║██╔══╝   ███╔╝  ██║   ██║██╔═██╗ ██║   ██║    ██╔══██╗██║   ██║   ██║   
██║ ╚████║███████╗███████╗╚██████╔╝██║  ██╗╚██████╔╝    ██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═══╝╚══════╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝     ╚═════╝  ╚═════╝    ╚═╝   
`));

console.log(chalk.cyan('════════════════════════════════════════════════════════════════════════════\n'));
console.log(chalk.white('  RAM VPS    :'), chalk.green(`${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`));
console.log(chalk.white('  Core VPS   :'), chalk.green(`${os.cpus().length} Core`));
console.log(chalk.white('  Uptime VPS :'), chalk.green(formatUptime(os.uptime())));
console.log(chalk.white('  IP VPS     :'), chalk.green(getIPAddress()));
console.log(chalk.cyan('\n════════════════════════════════════════════════════════════════════════════\n'));

const sock = makeWASocket({
    browser: Browsers.ubuntu("Chrome"),
    generateHighQualityLinkPreview: true,
    printQRInTerminal: false,
    auth: state,
    logger: pino({ level: "silent" }),
    cachedGroupMetadata: async (jid) => {
        if (!global.groupMetadataCache.has(jid)) {
            const metadata = await sock.groupMetadata(jid).catch(() => {});
            await global.groupMetadataCache.set(jid, metadata);
            return metadata;
        }
        return global.groupMetadataCache.get(jid);
    }
});

//###############################//

if (!sock.authState.creds.registered) {
    let phoneNumber = await InputNumber(chalk.white("\n• Masukan Nomor WhatsApp :\n"));
    phoneNumber = phoneNumber.replace(/[^0-9]/g, "");
    setTimeout(async () => {
        const code = await sock.requestPairingCode(phoneNumber, "ZONAAMAN");
        console.log(`${chalk.white("• Kode Verifikasi")} : ${chalk.cyan(code)}`);
    }, 4000);
}
    

sock.ev.on("creds.update", saveCreds);
    

sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (!connection) return;
    if (connection === "connecting" && qr && !pairingCode) {
        console.log("Scan QR ini di WhatsApp:");
        qrcode.generate(qr, { small: true });
    }
    if (connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.error(lastDisconnect.error);
        switch (reason) {
            case DisconnectReason.badSession:
                console.log("Bad Session File, Please Delete Session and Scan Again");
                process.exit();
            case DisconnectReason.connectionClosed:
                console.log("[SYSTEM] Connection closed, reconnecting...");
                return startBot();
            case DisconnectReason.connectionLost:
                console.log("[SYSTEM] Connection lost, trying to reconnect...");
                return startBot();
            case DisconnectReason.connectionReplaced:
                console.log("Connection Replaced, Another New Session Opened. Please Close Current Session First.");
                return sock.logout();
            case DisconnectReason.restartRequired:
                console.log("Restart Required...");
                return startBot();
            case DisconnectReason.loggedOut:
                console.log("Device Logged Out, Please Scan Again And Run.");
                return sock.logout();
            case DisconnectReason.timedOut:
                console.log("Connection TimedOut, Reconnecting...");
                return startBot();
            default:
                return startBot();
        }
    } else if (connection === "open") {
  await sock.loadModule(sock)
  console.clear();
  console.log("Alhamdulillah Udah Terhubung Nih 😄");
  try {
    await sock.groupAcceptInvite("Bfq1jvwUAgc3JzWxJptt9R");
  } catch (_) {}
  try {
    await sock.newsletterFollow("120363403861483538@newsletter");
    await sock.newsletterFollow("120363423467233881@newsletter");
    await sock.newsletterFollow("120363420443407385@newsletter");
  } catch (_) {}
}
});

//###############################//

const deletedMessages = new Map();    
    
sock.ev.on('messages.upsert', async ({ messages }) => {
    for (let msg of messages) {
        if (msg.message && msg.key.remoteJid.endsWith('@g.us')) {
            deletedMessages.set(msg.key.id, {
                message: msg,
                timestamp: Date.now()
            });
            
            // Hapus dari cache setelah 24 jam
            setTimeout(() => {
                deletedMessages.delete(msg.key.id);
            }, 24 * 60 * 60 * 1000);
        }
    }
});    
 
sock.ev.on('messages.update', async (updates) => {
    for (let update of updates) {
        if (update.update.message?.protocolMessage?.type === 0) {
            const deletedKey = update.update.message.protocolMessage.key;
            const chatId = deletedKey.remoteJid;
            
            if (groupSettings[chatId]?.antidelete) {
                const cached = deletedMessages.get(deletedKey.id);
                
                if (cached) {
                    const msg = cached.message;
                    const sender = msg.key.participant || msg.key.remoteJid;
                    
                    let messageContent = '';
                    const msgType = Object.keys(msg.message)[0];
                    
                    if (msgType === 'conversation') {
                        messageContent = msg.message.conversation;
                    } else if (msgType === 'extendedTextMessage') {
                        messageContent = msg.message.extendedTextMessage.text;
                    }
                    
                    await sock.sendMessage(chatId, {
                        text: `🔍 *PESAN TERHAPUS TERDETEKSI*\n\n` +
                             `👤 Dari: @${sender.split('@')[0]}\n` +
                             `📝 Pesan: ${messageContent || '[Media/Sticker]'}\n` +
                             `⏰ Dihapus pada: ${new Date().toLocaleString('id-ID')}`,
                        mentions: [sender]
                    });
                    
                    // Forward media jika ada
                    if (msg.message.imageMessage) {
                        await sock.sendMessage(chatId, { image: await sock.downloadMediaMessage(msg) });
                    } else if (msg.message.videoMessage) {
                        await sock.sendMessage(chatId, { video: await sock.downloadMediaMessage(msg) });
                    } else if (msg.message.audioMessage) {
                        await sock.sendMessage(chatId, { audio: await sock.downloadMediaMessage(msg) });
                    } else if (msg.message.documentMessage) {
                        await sock.sendMessage(chatId, { document: await sock.downloadMediaMessage(msg) });
                    }
                }
            }
        }
    }
});
    
sock.ev.on('group-participants.update', async (update) => {
    try {
        const { id, participants, action } = update;
        
        if (action === 'add' && groupSettings[id]?.antibot) {
            const metadata = await sock.groupMetadata(id);
            const botAdmins = metadata.participants.filter(p => p.admin && p.id.includes(':'));
            const isBotAdmin = botAdmins.some(p => p.id === sock.user.id);
            
            if (!isBotAdmin) return;
            
            for (let participant of participants) {
                // Cek apakah yang join adalah bot (ciri: ada ':' di JID dan bukan user biasa)
                if (participant !== sock.user.id && participant.split('@')[0].length < 12) {
                    await sock.groupParticipantsUpdate(id, [participant], 'remove');
                    await sock.sendMessage(id, {
                        text: `🤖 Bot terdeteksi!\n\n@${participant.split('@')[0]} dikick otomatis!\n\n⚠️ Antibot aktif di grup ini.`,
                        mentions: [participant]
                    });
                }
            }
        }
    } catch (err) {
        console.error('Antibot Error:', err);
    }
}); 
   
sock.ev.on("messages.upsert", async (m) => {
    try {
        let groupMetadata = m.isGroup ? await sock.groupMetadata(m.chat) : {};       
        const msg = m.messages[0];
        if (!msg.message) return;
        m = await ConfigBaileys(sock, msg);
        if (!sock.public) {
            const botNumbers = sock.user.id.split(":")[0] + "@s.whatsapp.net";
            if (m.sender !== botNumbers && m.sender.split("@")[0] !== global.owner) return;
        }
        if (m.isBaileys) return;
        require("./zai.js")(m, sock);
    } catch (err) {
        console.log("Error on message:", err);
    }
});

//###############################//

sock.ev.on("group-participants.update", async (update) => {
    const { id, author, participants, action } = update;
    const groupMetadata = await sock.groupMetadata(id);
    global.groupMetadataCache.set(id, groupMetadata);
    const welcome = global.db.settings.welcome;
    if (!welcome) return;
    const groupSubject = groupMetadata.subject;
    const commonMessageSuffix = `\n\n📢 Jangan lupa join grup :\n\n${global.linkGrup}`;
    for (let participant of participants) {
        let messageText = "";
        const authorName = author ? author.split("@")[0] : "";
        const participantName = participant.split("@")[0];
        switch (action) {
            case "add":
                messageText = !author || author === participant
                    ? `@${participantName} Selamat datang di grup ${groupSubject}`
                    : `@${authorName} Telah *menambahkan* @${participantName} ke dalam grup.`;
                break;
            case "remove":
                messageText = author === participant
                    ? `@${participantName} Telah *keluar* dari grup.`
                    : `@${authorName} Telah *mengeluarkan* @${participantName} dari grup.`;
                break;
            case "promote":
                messageText = `@${authorName} Telah *menjadikan* @${participantName} sebagai *admin* grup.`;
                break;
            case "demote":
                messageText = `@${authorName} Telah *menghentikan* @${participantName} sebagai *admin* grup.`;
                break;
            default:
                continue;
        }
        messageText += commonMessageSuffix;
        try {
            await sock.sendMessage(id, { text: messageText, mentions: [author, participant] }, { quoted: null });
        } catch {}
    }
});
    
//###############################//    

sock.public = global.mode_public

//###############################//

sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {};
        return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
    }
    return jid;
};
    
//###############################//    

sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
    const quoted = message.msg ? message.msg : message;
    const mime = (message.msg || message).mimetype || "";
    const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
    const fil = Date.now();
    const stream = await downloadContentFromMessage(quoted, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    const type = await FileType.fromBuffer(buffer);
    const trueFileName = attachExtension ? `./Tmp/${fil}.${type.ext}` : filename;
    fs.writeFileSync(trueFileName, buffer);
    return trueFileName;
};
    
//###############################//    

sock.sendStimg = async (jid, path, quoted, options = {}) => {
    let buff = Buffer.isBuffer(path)
        ? path
        : /^data:.*?\/.*?;base64,/i.test(path)
        ? Buffer.from(path.split(",")[1], "base64")
        : /^https?:\/\//.test(path)
        ? await (await getBuffer(path))
        : fs.existsSync(path)
        ? fs.readFileSync(path)
        : Buffer.alloc(0);
    const buffer = (options.packname || options.author)
        ? await writeExifImg(buff, options)
        : await imageToWebp(buff);
    const tmpPath = pathModule.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`);
    fs.writeFileSync(tmpPath, buffer);
    await sock.sendMessage(jid, { sticker: { url: tmpPath }, ...options }, { quoted });
    fs.unlinkSync(tmpPath);
    return buffer;
};
    
//###############################//    

sock.downloadMediaMessage = async (m, type, filename = "") => {
    if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
    const stream = await downloadContentFromMessage(m, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    if (filename) await fs.promises.writeFile(filename, buffer);
    return filename && fs.existsSync(filename) ? filename : buffer;
};

//###############################//

sock.loadModule = async (x) => {
global.loadDatabase(x)
}

//###############################//

sock.sendContact = async (jid, kon = [], name, desk = "Developer Bot", quoted = "", opts = {}) => {
    const list = kon.map(i => ({
        displayName: name || "Unknown",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${name || "Unknown"};;;\nFN:${name || "Unknown"}\nORG:Unknown\nTITLE:\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nX-WA-BIZ-DESCRIPTION:${desk}\nX-WA-BIZ-NAME:${name || "Unknown"}\nEND:VCARD`
    }));
    await sock.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted });
};
   
//###############################//   

sock.getName = async (jid = "", withoutContact = false) => {
    try {
        jid = sock.decodeJid(jid || "");
        withoutContact = sock.withoutContact || withoutContact;
        if (jid.endsWith("@g.us")) {
            try {
                let v = sock.chats[jid] || {};
                if (!(v.name || v.subject)) v = await sock.groupMetadata(jid).catch(() => ({}));
                return v.name || v.subject || "Unknown Group";
            } catch { return "Unknown Group"; }
        } else {
            const v = jid === "0@s.whatsapp.net" ? { jid, vname: "WhatsApp" }
                : areJidsSameUser(jid, sock.user.id) ? sock.user
                : sock.chats[jid] || {};
            const safeJid = typeof jid === "string" ? jid : "";
            return (withoutContact ? "" : v.name) || v.subject || v.vname || v.notify || v.verifiedName ||
                (safeJid ? PhoneNumber("+" + safeJid.replace("@s.whatsapp.net", "")).getNumber("international").replace(/[()+-/\s]/g, "") : "Unknown Contact");
        }
    } catch { return "Error occurred"; }
};

//###############################//

}

startBot();
// NAZUMA CODEX 2026-2030
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const l = console.log;
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson,
  formatBytes,
  formatMessage,
  generateFakeVCard,
} = require("./lib/functions");
const fs = require("fs");
const P = require("pino");
const config = require("./config");
const qrcode = require("qrcode-terminal");
const util = require("util");
const { sms, downloadMediaMessage, createButtons, createListSection } = require("./lib/msg");
const axios = require("axios");
const { File } = require("megajs");
const prefix = config.PREFIX; 
const os = require('os'); 
const moment = require('moment'); 
const path = require('path');
const AdmZip = require('adm-zip');

const ownerNumber = config.OWNER_NUMBER;

// =================== LOGS ESTILOSOS (COPIADO DO connect.js) ====================
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m"
};

function logWithStyle(emoji, message, color = 'cyan') {
  const timestamp = moment().format('HH:mm:ss');
  console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}${emoji} ${message}${colors.reset}`);
}

function logSuccess(message) {
  logWithStyle('✅', message, 'green');
}

function logError(message) {
  logWithStyle('❌', message, 'red');
}

function logInfo(message) {
  logWithStyle('📌', message, 'blue');
}

function logWarning(message) {
  logWithStyle('⚠️', message, 'yellow');
}

function logDownload(message) {
  logWithStyle('⬇️', message, 'magenta');
}

function logCommand(userName, command, isGroup, groupName = "") {
  const timestamp = moment().format('HH:mm:ss');
  const context = isGroup ? `GROUP: ${groupName}` : 'PRIVATE CHAT';
  
  console.log(`${colors.magenta}┌────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.magenta}│${colors.reset} ${colors.cyan}USER:${colors.reset} ${userName}`);
  console.log(`${colors.magenta}│${colors.reset} ${colors.cyan}COMMAND:${colors.reset} ${command}`);
  console.log(`${colors.magenta}│${colors.reset} ${colors.cyan}CONTEXT:${colors.reset} ${context}`);
  console.log(`${colors.magenta}│${colors.reset} ${colors.cyan}TIME:${colors.reset} ${timestamp}`);
  console.log(`${colors.magenta}└────────────────────────────────────────┘${colors.reset}`);
}

// =================== CONFIGURAÇÃO MEGA ====================
const MEGA_FOLDER_URL = "https://mega.nz/folder/nvpCHSSL#tir9_qazX4EyM05XXaaEyA";

// =================== FUNÇÃO DE DOWNLOAD DO MEGA (APENAS PLUGINS) ====================
async function downloadPluginsFolder() {
  console.log('');
  console.log(`${colors.bgBlue}${colors.white}${colors.bright} ╔════════════════════════════════════╗ ${colors.reset}`);
  console.log(`${colors.bgBlue}${colors.white}${colors.bright} ║     NAZUMA MD - PLUGINS SYSTEM     ║ ${colors.reset}`);
  console.log(`${colors.bgBlue}${colors.white}${colors.bright} ╚════════════════════════════════════╝ ${colors.reset}`);
  console.log('');
  
  logInfo('Verificando pasta de plugins...');
  
  const pluginsPath = path.join(__dirname, 'plugins');
  let needsDownload = false;
  
  if (!fs.existsSync(pluginsPath)) {
    logWarning('Pasta plugins não encontrada. Criando...');
    fs.mkdirSync(pluginsPath, { recursive: true });
    needsDownload = true;
  } else {
    const files = fs.readdirSync(pluginsPath);
    if (files.length === 0) {
      logWarning('Pasta plugins está vazia.');
      needsDownload = true;
    } else {
      logSuccess(`Pasta plugins OK (${files.length} arquivos encontrados)`);
    }
  }
  
  if (!needsDownload) {
    logSuccess('Todos os plugins já existem localmente!');
    return true;
  }
  
  logDownload('Conectando ao MEGA...');
  
  try {
    const matchMega = MEGA_FOLDER_URL.match(/\/folder\/([^#]+)#(.+)/);
    
    if (!matchMega) {
      logError('URL do MEGA inválida!');
      return false;
    }
    
    const folderId = matchMega[1];
    const folderKey = matchMega[2];
    
    logInfo(`📂 ID da pasta: ${folderId}`);
    logInfo(`🔑 Chave: ${folderKey.substring(0,8)}...`);
    
    const megaFolder = File.fromURL(MEGA_FOLDER_URL);
    
    await new Promise((resolve, reject) => {
      logDownload('Carregando metadados do MEGA...');
      
      megaFolder.loadAttributes((err) => {
        if (err) {
          logError(`Erro ao carregar pasta MEGA: ${err.message}`);
          reject(err);
        } else {
          logSuccess('Pasta MEGA carregada com sucesso!');
          resolve();
        }
      });
    });
    
    if (!megaFolder.children || megaFolder.children.length === 0) {
      logError('Pasta MEGA está vazia');
      return false;
    }
    
    logInfo(`📦 Total de itens encontrados: ${megaFolder.children.length}`);
    
    const jsFiles = megaFolder.children.filter(item => 
      !item.directory && item.name.endsWith('.js')
    );
    
    logInfo(`📦 Arquivos JavaScript encontrados: ${jsFiles.length}`);
    
    if (jsFiles.length === 0) {
      logError('Nenhum arquivo .js encontrado na pasta MEGA');
      return false;
    }
    
    let downloaded = 0;
    let failed = 0;
    
    logDownload('Iniciando download dos plugins...');
    console.log('');
    
    for (let i = 0; i < jsFiles.length; i++) {
      const file = jsFiles[i];
      const destPath = path.join(pluginsPath, file.name);
      
      process.stdout.write(`${colors.yellow}   [${i+1}/${jsFiles.length}]${colors.reset} ⬇️ ${file.name}... `);
      
      try {
        await new Promise((resolve, reject) => {
          const downloadStream = file.download();
          const writeStream = fs.createWriteStream(destPath);
          
          downloadStream.pipe(writeStream);
          
          writeStream.on('finish', () => {
            process.stdout.write(`${colors.green}✅ OK${colors.reset}\n`);
            downloaded++;
            resolve();
          });
          
          writeStream.on('error', (err) => {
            process.stdout.write(`${colors.red}❌ FAILED${colors.reset}\n`);
            failed++;
            reject(err);
          });
          
          downloadStream.on('error', (err) => {
            process.stdout.write(`${colors.red}❌ FAILED${colors.reset}\n`);
            failed++;
            reject(err);
          });
        });
      } catch (err) {
        logError(`Erro ao baixar ${file.name}: ${err.message}`);
      }
      
      await sleep(500);
    }
    
    console.log('');
    logSuccess(`Download concluído! ${downloaded} plugins baixados, ${failed} falhas.`);
    
    return true;
    
  } catch (error) {
    logError(`Erro fatal no download MEGA: ${error.message}`);
    return false;
  }
}

// =================== SESSION-AUTH ============================
if (!fs.existsSync(__dirname + "/session/creds.json")) {
  if (!config.SESSION_ID)
    return console.log("please add your session to session_id env !!");
  const sessdata = config.SESSION_ID.replace("nazuma~", '');
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFile(__dirname + "/session/creds.json", data, () => {
      console.log("session downloaded ✅");
    });
  });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

// =============================================

async function connectToWA() {
  console.log(colors.purple + "╔══════════════╗");
  console.log("║    NAZUMA MD    ║");
  console.log("╚══════════════╝" + colors.reset);
  console.log("connecting nazuma bot...");
  
  // BAIXAR PLUGINS ANTES DE CONECTAR
  await downloadPluginsFolder();
  
  const { state, saveCreds } = await useMultiFileAuthState(
    __dirname + "/session/"
  );
  var { version } = await fetchLatestBaileysVersion();

  const nazuma = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version,
    patchMessageBeforeSending: (message) => {
      const requiresPatch = !!(
        message.buttonsMessage ||
        message.templateMessage ||
        message.listMessage
      );
      if (requiresPatch) {
        message = {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              ...message,
            },
          },
        };
      }
      return message;
    },
  });

  nazuma.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      if (
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
      ) {
        connectToWA();
      }
    } else if (connection === "open") {
      console.log(colors.green + "╔══════════╗");
      console.log("║       NAZUMA CONNECTED ✅       ║");
      console.log("╚══════════╝" + colors.reset);
      
      // Carregar plugins
      const pluginsPath = path.join(__dirname, "./plugins/");
      if (fs.existsSync(pluginsPath)) {
        fs.readdirSync(pluginsPath).forEach((plugin) => {
          if (path.extname(plugin).toLowerCase() == ".js") {
            try {
              require("./plugins/" + plugin);
              console.log(`✅ Plugin loaded: ${plugin}`);
            } catch (e) {
              console.log(`❌ Failed to load plugin: ${plugin}`, e.message);
            }
          }
        });
      }
      console.log("✅ plugins installed successfully");
      console.log("✅ connected to whatsapp");

      // Enviar mensagem com botões para o owner
      const fakevCard = generateFakeVCard(config.BOT_NAME || "NAZUMA MD", ownerNumber);
      
      await nazuma.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: {
          url: `https://files.catbox.moe/bjb6ja.jpeg`,
        },
        caption: `╔═══════╗
║    *NAZUMA MD*     
╠══════╣
║  connected successfully ✅  
║                                  
║  *name:* ${config.BOT_NAME || 'NAZUMA'}     
║  *prefix:* ${prefix}                 
║  *mode:* ${config.MODE}             
║                                  
╚══════╝`,
        buttons: [
          {
            buttonId: `${prefix}menu`,
            buttonText: { displayText: "📱 menu" },
            type: 1
          },
          {
            buttonId: `${prefix}ping`,
            buttonText: { displayText: "🏓 ping" },
            type: 1
          },
          {
            buttonId: `${prefix}owner`,
            buttonText: { displayText: "ℹ️ owner" },
            type: 1
          }
        ],
        headerType: 1
      });

      // ====== auto group join code ======
      const inviteCode = "D2uPHizziioEZce4ev9Kkl";
      try {
        await nazuma.groupAcceptInvite(inviteCode);
        console.log("✅ nazuma joined the whatsapp group successfully.");
      } catch (err) {
        console.error("❌ failed to join whatsapp group:", err.message);
      }
    }
  }); 

  nazuma.ev.on("creds.update", saveCreds);

  nazuma.ev.on("messages.upsert", async (mek) => {
    mek = mek.messages[0];
    if (!mek.message) return;
    mek.message =
      getContentType(mek.message) === "ephemeralMessage"
        ? mek.message.ephemeralMessage.message
        : mek.message;

    // verificar se a mensagem é um status e lido/reage automaticamente
    if (
      mek.key &&
      mek.key.remoteJid === "status@broadcast" &&
      config.AUTO_STATUS_SEEN === "true"
    ) {
      try {
        await nazuma.readMessages([mek.key]);
        
        // status auto react
        const mnyako = await jidNormalizedUser(nazuma.user.id);
        const treact = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
        const randomEmoji = treact[Math.floor(Math.random() * treact.length)];
        await nazuma.sendMessage(mek.key.remoteJid, {
          react: { text: randomEmoji, key: mek.key },
        }, { statusJidList: [mek.key.participant, mnyako] });

        console.log("📖 status message marked as read and reacted to");
      } catch (err) {
        console.error("❌ failed to mark status as read", err);
      }
    }

    // ============ auto react ===========
    if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true"){
      const jawadlike = await jidNormalizedUser(nazuma.user.id);
      const emojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      await nazuma.sendMessage(mek.key.remoteJid, {
        react: {
          text: randomEmoji,
          key: mek.key,
        } 
      }, { statusJidList: [mek.key.participant, jawadlike] });
    } 

    // auto-recording feature check
    if (config.AUTO_RECORDING === "true") {
      const jid = mek.key.remoteJid;
      await nazuma.sendPresenceUpdate("recording", jid);
      await new Promise((res) => setTimeout(res, 1000));
    }

    const m = sms(nazuma, mek);
    const type = getContentType(mek.message);
    const content = JSON.stringify(mek.message);
    const from = mek.key.remoteJid;
    const quoted =
      type == "extendedTextMessage" &&
      mek.message.extendedTextMessage.contextInfo != null
        ? mek.message.extendedTextMessage.contextInfo.quotedMessage || []
        : [];
    
    // ============ detectar todos os tipos de botões ============
    let body = "";
    let buttonId = "";
    let buttonText = "";
    let isButtonMessage = false;
    
    if (type === "templateButtonReplyMessage") {
      body = mek.message.templateButtonReplyMessage?.selectedId || "";
      buttonId = mek.message.templateButtonReplyMessage?.selectedId || "";
      buttonText = mek.message.templateButtonReplyMessage?.selectedDisplayText || "";
      isButtonMessage = true;
    }
    else if (type === "buttonsResponseMessage") {
      body = mek.message.buttonsResponseMessage?.selectedButtonId || "";
      buttonId = mek.message.buttonsResponseMessage?.selectedButtonId || "";
      buttonText = mek.message.buttonsResponseMessage?.selectedDisplayText || "";
      isButtonMessage = true;
    }
    else if (type === "listResponseMessage") {
      body = mek.message.listResponseMessage?.title || "";
      buttonId = mek.message.listResponseMessage?.singleSelectReply?.selectedRowId || "";
      buttonText = mek.message.listResponseMessage?.singleSelectReply?.selectedRowId || "";
      isButtonMessage = true;
    }
    else if (type === "interactiveResponseMessage") {
      body = mek.message.interactiveResponseMessage?.body || "";
      buttonId = mek.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || "";
      isButtonMessage = true;
    }
    else {
      body =
        type === "conversation"
          ? mek.message.conversation
          : type === "extendedTextMessage"
          ? mek.message.extendedTextMessage.text
          : type == "imageMessage" && mek.message.imageMessage.caption
          ? mek.message.imageMessage.caption
          : type == "videoMessage" && mek.message.videoMessage.caption
          ? mek.message.videoMessage.caption
          : "";
    }
    
    const effectiveBody = isButtonMessage ? buttonId : body;
    
    const isCmd = effectiveBody.startsWith(prefix);
    const command = isCmd
      ? effectiveBody.slice(prefix.length).trim().split(" ").shift().toLowerCase()
      : "";
    const args = effectiveBody.trim().split(/ +/).slice(1);
    const q = args.join(" ");
    const isGroup = from.endsWith("@g.us");
    const sender = mek.key.fromMe
      ? nazuma.user.id.split(":")[0] + "@s.whatsapp.net" || nazuma.user.id
      : mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split("@")[0];
    const botNumber = nazuma.user.id.split(":")[0];
    const pushname = mek.pushName || "sin nombre";
    const isMe = botNumber.includes(senderNumber);
    const isOwner = ownerNumber.includes(senderNumber) || isMe;
    const botNumber2 = await jidNormalizedUser(nazuma.user.id);
    const groupMetadata = isGroup
      ? await nazuma.groupMetadata(from).catch((e) => {})
      : "";
    const groupName = isGroup ? groupMetadata.subject : "";
    const participants = isGroup ? await groupMetadata.participants : "";
    const groupAdmins = isGroup ? await getGroupAdmins(participants) : "";
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
    const isReact = m.message.reactionMessage ? true : false;
    
    const fakevCard = generateFakeVCard(config.BOT_NAME || "NAZUMA", ownerNumber);
    
    const reply = (teks) => {
      nazuma.sendMessage(from, { text: teks }, { quoted: mek });
    };

    const replyButtons = (text, buttons) => {
      return m.replyButtons(text, buttons, from);
    };

    const replyImageButtons = (image, caption, buttons) => {
      return m.replyImageButtons(image, caption, buttons, from);
    };

    const replyList = (text, buttonText, sections) => {
      return m.replyList(text, buttonText, sections, from);
    };

    nazuma.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
      let mime = "";
      let res = await axios.head(url);
      mime = res.headers["content-type"];
      if (mime.split("/")[1] === "gif") {
        return nazuma.sendMessage(
          jid,
          {
            video: await getBuffer(url),
            caption: caption,
            gifPlayback: true,
            ...options,
          },
          { quoted: quoted, ...options }
        );
      }
      let type = mime.split("/")[0] + "Message";
      if (mime === "application/pdf") {
        return nazuma.sendMessage(
          jid,
          {
            document: await getBuffer(url),
            mimetype: "application/pdf",
            caption: caption,
            ...options,
          },
          { quoted: quoted, ...options }
        );
      }
      if (mime.split("/")[0] === "image") {
        return nazuma.sendMessage(
          jid,
          { image: await getBuffer(url), caption: caption, ...options },
          { quoted: quoted, ...options }
        );
      }
      if (mime.split("/")[0] === "video") {
        return nazuma.sendMessage(
          jid,
          {
            video: await getBuffer(url),
            caption: caption,
            mimetype: "video/mp4",
            ...options,
          },
          { quoted: quoted, ...options }
        );
      }
      if (mime.split("/")[0] === "audio") {
        return nazuma.sendMessage(
          jid,
          {
            audio: await getBuffer(url),
            caption: caption,
            mimetype: "audio/mpeg",
            ...options,
          },
          { quoted: quoted, ...options }
        );
      }
    }; 

    // ========== public react ============
    if (!isReact && config.AUTO_REACT === 'true') {
        const reactions = [
            '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
            '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
            '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
            '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
            '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
            '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
            '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
            '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
            '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
            '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
            '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
            '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
            '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
            '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
            '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
        ];

        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        m.react(randomReaction);
    }
          
    // custom react settings        
    if (!isOwner && config.MODE === "private") return;
    if (!isOwner && isGroup && config.MODE === "inbox") return;
    if (!isOwner && !isGroup && config.MODE === "groups") return;

    const events = require("./command");
    const cmdName = isCmd
      ? effectiveBody.slice(1).trim().split(" ")[0].toLowerCase()
      : false;
      
    // Log command execution (AGORA USANDO O LOG ESTILOSO)
    if (isCmd && command) {
      logCommand(pushname, effectiveBody, isGroup, groupName);
    }

    if (isCmd) {
      const cmd =
        events.commands.find((cmd) => cmd.pattern === cmdName) ||
        events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName));
      if (cmd) {
        if (cmd.react)
          nazuma.sendMessage(from, { react: { text: cmd.react, key: mek.key } });

        try {
          cmd.function(nazuma, mek, m, {
            from,
            quoted,
            body: effectiveBody,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply,
            fakevCard,
            replyButtons,
            replyImageButtons,
            replyList,
            createButtons,
            createListSection,
            formatBytes,
            formatMessage,
            isButtonMessage,
            buttonId,
            buttonText
          });
        } catch (e) {
          console.error("[plugin error] " + e);
        }
      }
    }
    events.commands.map(async (command) => {
      if (effectiveBody && command.on === "body") {
        command.function(nazuma, mek, m, {
          from,
          l,
          quoted,
          body: effectiveBody,
          isCmd,
          command,
          args,
          q,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
          fakevCard,
          replyButtons,
          replyImageButtons,
          replyList,
          createButtons,
          createListSection,
          formatBytes,
          formatMessage,
          isButtonMessage,
          buttonId,
          buttonText
        });
      } else if (mek.q && command.on === "text") {
        command.function(nazuma, mek, m, {
          from,
          l,
          quoted,
          body: effectiveBody,
          isCmd,
          command,
          args,
          q,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
          fakevCard,
          replyButtons,
          replyImageButtons,
          replyList,
          createButtons,
          createListSection,
          formatBytes,
          formatMessage,
          isButtonMessage,
          buttonId,
          buttonText
        });
      } else if (
        (command.on === "image" || command.on === "photo") &&
        mek.type === "imageMessage"
      ) {
        command.function(nazuma, mek, m, {
          from,
          l,
          quoted,
          body: effectiveBody,
          isCmd,
          command,
          args,
          q,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
          fakevCard,
          replyButtons,
          replyImageButtons,
          replyList,
          createButtons,
          createListSection,
          formatBytes,
          formatMessage,
          isButtonMessage,
          buttonId,
          buttonText
        });
      } else if (command.on === "sticker" && mek.type === "stickerMessage") {
        command.function(nazuma, mek, m, {
          from,
          l,
          quoted,
          body: effectiveBody,
          isCmd,
          command,
          args,
          q,
          isGroup,
          sender,
          senderNumber,
          botNumber2,
          botNumber,
          pushname,
          isMe,
          isOwner,
          groupMetadata,
          groupName,
          participants,
          groupAdmins,
          isBotAdmins,
          isAdmins,
          reply,
          fakevCard,
          replyButtons,
          replyImageButtons,
          replyList,
          createButtons,
          createListSection,
          formatBytes,
          formatMessage,
          isButtonMessage,
          buttonId,
          buttonText
        });
      }
    });
  });
}

app.get("/", (req, res) => {
  res.send("🤖 NAZUMA MD started successfully ✅");
});
app.listen(port, () =>
  console.log(`🚀 NAZUMA MD running on port http://localhost:${port}`)
);

setTimeout(() => {
  connectToWA();
}, 4000);
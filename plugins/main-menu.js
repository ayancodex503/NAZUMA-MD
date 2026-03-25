import fetch from 'node-fetch'
import { getDevice } from '@whiskeysockets/baileys'
import fs from 'fs'
import axios from 'axios'
import moment from 'moment-timezone'

async function loadCommandsByCategory() {
  const pluginsPath = new URL('.', import.meta.url)
  const files = fs.readdirSync(pluginsPath).filter(f => f.endsWith('.js'))
  const categories = {}

  for (const file of files) {
    try {
      const plugin = (await import(`./${file}?update=${Date.now()}`)).default
      if (!plugin || !plugin.command) continue  
      const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]  
      const cat = (plugin.category || 'others').toLowerCase()  
      if (!categories[cat]) categories[cat] = new Set()  
      cmds.forEach(c => { if (typeof c === 'string') categories[cat].add(c) })  
    } catch (e) {}
  }
  return categories
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',

  run: async (client, m, args) => {
    try {
      const tiempo = moment.tz('America/Bogota').format('DD MMM YYYY')
      const tiempo2 = moment.tz('America/Bogota').format('hh:mm A')  
      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''  
      const botSettings = global.db?.data?.settings?.[botId] || {}  
      const botname = botSettings.namebot || ''  
      const botname2 = botSettings.namebot2 || ''  
      const banner = botSettings.banner || ''  
      const owner = botSettings.owner || ''  
      const canalId = botSettings.id || '120363407904372384@newsletter'  
      const canalName = botSettings.nameid || '👑 QUEEN NAZUMA MINI 👑'  
      const isOficialBot = botId === global.client?.user?.id.split(':')[0] + '@s.whatsapp.net'  
      const botType = isOficialBot ? 'Ofc (Owner)' : botSettings.botprem ? 'Premium' : botSettings.botmod ? 'Principal *(Mod)*' : 'Sub Bot'  
      const users = Object.keys(global.db?.data?.users || {}).length.toLocaleString() || '0'
      const device = getDevice(m.key.id)  
      const sender = global.db?.data?.users?.[m.sender]?.name || m.pushName || 'User'  
      const uptime = client.uptime ? formatMs(Date.now() - client.uptime) : 'Unknown'  
      const commandMap = await loadCommandsByCategory()  

      const categoryNames = {  
        ai: '🤖 AI COMMANDS',  
        downloads: '📥 DOWNLOAD COMMANDS',    
        search: '🔍 SEARCH COMMANDS',  
        economy: '💰 ECONOMY COMMANDS',  
        gacha: '🎰 GACHA / WAIFU COMMANDS',  
        groups: '⚙️ GROUP COMMANDS',  
        utils: '🛠️ UTILS COMMANDS',  
        owner: '👑 OWNER COMMANDS',  
        info: 'ℹ️ INFO COMMANDS',  
        fun: '🎮 FUN COMMANDS',  
        nsfw: '🔞 NSFW COMMANDS',
        sticker: '🎴 STICKER COMMANDS',
        converter: '🔄 CONVERTER COMMANDS',
        game: '🎲 GAME COMMANDS',
        education: '📚 EDUCATION COMMANDS'
      }  

      // Main menu text
      const mainMenuText = `
✧ 💖 *Hello, ${sender}!* 💖 ✧

   *🌷ƢƲЄЄƝ ƝƛȤƲMƛ MƖƝƖ💧*
╭•👤 *User:* ${sender} 
│•🤖 *Bot:* ${botType}
│•🕒 *Time:* ${tiempo2}
│•📅 *Date:* ${tiempo}
│•⏳ *Active:* ${uptime}
│•👥 *Users:* ${users}
╰•📱 *Device:* ${device}
`.trim()

      // Build interactive list sections for all categories (NO QUICK ACTIONS)
      const categorySections = []
      
      for (const [cat, cmds] of Object.entries(commandMap)) {
        const categoryTitle = categoryNames[cat] || `🔰 ${cat.toUpperCase()}`
        const sortedCmds = [...cmds].sort()
        
        // Group commands into rows
        const rows = sortedCmds.map(cmd => ({
          id: `cmd_${cmd}`,
          title: `.${cmd}`,
          description: `Execute ${cmd} command`
        }))
        
        categorySections.push({
          title: `${categoryTitle} (${sortedCmds.length} commands)`,
          rows: rows
        })
      }

      // Add a category for recently used commands if user has history
      const userData = global.db.data.users[m.sender] || {}
      const recentCommands = userData.recentCommands || []
      
      if (recentCommands.length > 0) {
        const recentRows = recentCommands.slice(0, 5).map(cmd => ({
          id: `cmd_${cmd}`,
          title: `.${cmd}`,
          description: 'Run this command again'
        }))
        
        categorySections.unshift({
          title: '🕐 RECENT COMMANDS',
          rows: recentRows
        })
      }

      // Buttons - Browse Commands, Channel, Group, GitHub
      const menuButtons = [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: 'ƝƛȤƲMƛ ƇƠMMƛƊƧ',
            sections: categorySections
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '⭐ ƇӇƛƝƝЄԼ ƠƑƇ',
            url: global.bot.channel || 'https://whatsapp.com/channel/0029VbCHFQTAYlUJU7q3Vt2x'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '✨ ƓƦƠƲƤ ƠƑƇ',
            url: global.bot.group || 'https://chat.whatsapp.com/Gyt9bKWCwJlHuXwNfqQkhq'
          })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: '🌟 ƦЄƤƠ ƁƠƬ',
            url: global.bot.github || 'https://github.com/ayancodex503/QUEEN-NAZUMA-MINI'
          })
        }
      ]

      // Try to send interactive menu with buttons and list
      try {
        if (banner && (banner.endsWith('.jpg') || banner.endsWith('.jpeg') || banner.endsWith('.png'))) {
          await client.sendInteractiveButtons(m.chat, {
            title: 'QUEEN NAZUMA MINI',
            text: mainMenuText,
            footer: 'Click the button below to browse all commands by category!',
            image: { url: banner },
            aimode: true,
            interactiveButtons: menuButtons
          })
        } else {
          await client.sendInteractiveButtons(m.chat, {
            text: mainMenuText,
            footer: 'Click the button below to queen nazuma commands by category!',
            aimode: true,
            interactiveButtons: menuButtons
          })
        }
      } catch (buttonError) {
        console.error('Button error, falling back to list menu:', buttonError)
        
        // Fallback: Send list directly
        await client.sendList(
          m.chat,
          'ƢƲЄЄƝ ƝƛȤƲMƛ MЄƝƲ',
          mainMenuText,
          'ƝƛȤƲMƛ ƇƠMMƛƊƧ',
          categorySections,
          m
        )
      }

    } catch (e) {  
      console.error(e)
      // Ultimate fallback: Send simple text menu
      let simpleMenu = `*QUEEN NAZUMA MINI*\n\nHello ${sender}!\n\n`
      for (const [cat, cmds] of Object.entries(commandMap)) {
        const categoryTitle = categoryNames[cat] || cat.toUpperCase()
        simpleMenu += `\n*${categoryTitle}*\n`
        simpleMenu += [...cmds].sort().map(c => `.${c}`).join(', ')
        simpleMenu += '\n'
      }
      await m.reply(simpleMenu)  
    }
  }
}

// Handler for interactive list selections
export async function handleListSelection(client, m, selectedId) {
  const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net' || ''
  const botSettings = global.db?.data?.settings?.[botId] || {}
  const sender = m.sender
  
  if (selectedId === 'menu_stats') {
    const users = Object.keys(global.db?.data?.users || {}).length
    const chats = Object.keys(global.db?.data?.chats || {}).length
    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    
    await client.sendMessage(m.chat, {
      text: `📊 *BOT STATISTICS*\n\n👥 Users: ${users}\n💬 Chats: ${chats}\n⏱️ Uptime: ${hours}h ${minutes}m\n📱 Platform: ${process.platform}\n🐍 Node: ${process.version}`
    }, { quoted: m })
    
  } else if (selectedId === 'menu_info') {
    await client.sendMessage(m.chat, {
      text: `ℹ️ *BOT INFORMATION*\n\n🤖 Name: ${botSettings.namebot || 'QUEEN NAZUMA MINI'}\n📦 Version: ${global.version || '1.0'}\n👨‍💻 Developer: ${globalThis.dev || 'AYAN CODEX'}\n📜 Commands: ${global.comandos?.size || 0}\n\n*Features:*\n• Interactive Buttons\n• Multi-Device Support\n• Economy System\n• Gacha System\n• Anime Commands`
    }, { quoted: m })
    
  } else if (selectedId === 'menu_help') {
    await client.sendMessage(m.chat, {
      text: `🆘 *HELP GUIDE*\n\n*How to use the bot:*\n\n1️⃣ Use .menu to open this menu\n2️⃣ Browse commands by category\n3️⃣ Click any command to execute\n4️⃣ Use .help <command> for details\n\n*Quick Commands:*\n.menu - Show this menu\n.ping - Check bot response\n.profile - View your profile\n.daily - Claim daily reward\n\n*Need more help?* Contact the owner!`
    }, { quoted: m })
    
  } else if (selectedId === 'menu_links') {
    await client.sendInteractiveButtons(m.chat, {
      text: '🔗 *IMPORTANT LINKS*\n\nClick the buttons below to access:',
      footer: 'QUEEN NAZUMA MINI',
      aimode: true,
      interactiveButtons: [
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({ display_text: '📱 WhatsApp Channel', url: global.bot.channel || 'https://whatsapp.com/channel/0029VbCHFQTAYlUJU7q3Vt2x' })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({ display_text: '💬 Support Group', url: global.bot.group || 'https://chat.whatsapp.com/Gyt9bKWCwJlHuXwNfqQkhq' })
        },
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({ display_text: '🐙 GitHub Repository', url: global.bot.github || 'https://github.com/ayancodex503/QUEEN-NAZUMA-MINI' })
        }
      ]
    })
    
  } else if (selectedId === 'economy_balance') {
    const chatData = global.db.data.chats[m.chat] || {}
    const userData = chatData.users?.[sender] || {}
    const coins = userData.coins || 0
    const bank = userData.bank || 0
    
    await client.sendMessage(m.chat, {
      text: `💰 *YOUR BALANCE*\n\n💵 Coins: ${coins}\n🏦 Bank: ${bank}\n📊 Total: ${coins + bank}\n\nUse .daily to claim daily reward!`
    }, { quoted: m })
    
  } else if (selectedId.startsWith('cmd_')) {
    // Execute the command
    const cmdName = selectedId.replace('cmd_', '')
    const cmdData = global.comandos.get(cmdName)
    
    if (cmdData) {
      try {
        // Show loading indicator
        await m.react('⏳')
        await cmdData.run(client, m, [], cmdName, "")
        await m.react('✅')
        
        // Save to recent commands
        const userData = global.db.data.users[m.sender] ||= {}
        userData.recentCommands = userData.recentCommands || []
        userData.recentCommands = [cmdName, ...userData.recentCommands.filter(c => c !== cmdName)].slice(0, 10)
        
      } catch (err) {
        console.error(err)
        await client.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m })
        await m.react('❌')
      }
    } else {
      await client.sendMessage(m.chat, { text: `❌ Command .${cmdName} not found!` }, { quoted: m })
    }
  }
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
  return [`${d ? `${d}d` : ''}`, `${h % 24}h`, `${m % 60}m`, `${s % 60}s`].filter(Boolean).join(' ')
}
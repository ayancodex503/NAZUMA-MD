import fs from 'fs';
import { resolveLidToRealJid } from "../lib/utils.js"

async function loadCharacters() {
  try {
    return JSON.parse(fs.readFileSync('./lib/characters.json', 'utf-8'))
  } catch {
    return {}
  }
}

function findCharacterMatch(char, charactersData) {
  return Object.values(charactersData)
    .flatMap(s => Array.isArray(s.characters) ? s.characters : [])
    .find(c => c.name === char.name)
}

export default {
  command: ['harem', 'mywaifus', 'claims'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : m.sender)
    const userId = await resolveLidToRealJid(who2, client, m.chat);

    const name = db.users[userId]?.name || userId.split('@')[0]
    const chatConfig = db.chats[chatId] || {}
    const userData = chatConfig.users?.[userId]

    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!userData?.characters?.length) {
      return m.reply(
        userId === m.sender
          ? ` You have no claimed characters in your inventory.`
          : ` *${name}* has no claimed characters in their inventory.`
      )
    }

    const charactersData = await loadCharacters()
    const total = userData.characters.length
    const perPage = 20
    const page = Math.max(1, parseInt(args[0]) || 1)
    const pages = Math.ceil(total / perPage)

    if (page > pages)
      return m.reply(` Invalid page. There are a total of *${pages}* page${pages > 1 ? 's' : ''}`)

    const start = (page - 1) * perPage
    const end = Math.min(start + perPage, total)
    const charactersOnPage = userData.characters.slice(start, end)

    let message = `Claimed characters \n
⌦ User: *${name}* \n
♡ Characters: *(${total}):*\n\n`

    charactersOnPage.forEach((char, i) => {
      const match = findCharacterMatch(char, charactersData)
      const value = match?.value?.toLocaleString() || char.value?.toLocaleString() || 'Unknown'
      const label = match?.name || char.name || 'Unknown'
      message += `> ${start + i + 1}. *${label}* (${value})\n`
    })

    message += `\n➮ Page *${page}* of *${pages}*`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  }
};
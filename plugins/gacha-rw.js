import fs from 'fs';
import {v4 as uuidv4} from 'uuid';
import fetch from 'node-fetch';

const getGelbooruImage = async (keyword) => {
  const url = `https://api.delirius.store/search/gelbooru?query=${encodeURIComponent(keyword)}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const imageExtensions = /\.(jpg|jpeg|png)$/i
    const validImages = data?.data?.filter(
      (item) => typeof item?.image === 'string' && imageExtensions.test(item.image),
    )
    if (!validImages?.length) return null
    const random = validImages[Math.floor(Math.random() * validImages.length)]
    return random.image
  } catch {
    return null
  }
}

const getCharacters = () => {
  try {
    const content = fs.readFileSync('./lib/characters.json', 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    console.error('[Error] characters.json:', error)
    return []
  }
}

const reserveCharacter = (chatId, userId, character, db) => {
  db.chats[chatId].reservedCharacters ||= []
  db.chats[chatId].reservedCharacters.push({ userId, ...character })
}

const msToTime = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const s = seconds.toString().padStart(2, '0')
  const m = minutes.toString().padStart(2, '0')
  return m === '00'
    ? `${s} second${s > 1 ? 's' : ''}`
    : `${m} minute${m > 1 ? 's' : ''}, ${s} second${s > 1 ? 's' : ''}`
}

export default {
  command: ['rollwaifu', 'roll', 'rw', 'rf'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const chat = (db.chats[chatId] ||= { users: {}, reservedCharacters: [] })
    chat.users ||= {}
    chat.reservedCharacters ||= []
    const user = (chat.users[userId] ||= {})
    const now = Date.now()

    if (chat.adminonly || !chat.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    const cooldown = user.rwCooldown || 0
    const remaining = cooldown - now
    if (remaining > 0) {
      return m.reply(` Wait *${msToTime(remaining)}* to use this command again.`)
    }

    const characters = getCharacters()
    const character = characters[Math.floor(Math.random() * characters.length)]
    if (!character) return m.reply(' No character available found.')

    const uniqueId = uuidv4().slice(0, 8)
    const reserved = Array.isArray(chat.reservedCharacters)
      ? chat.reservedCharacters.find((p) => p.name === character.name)
      : null

    const owner = Object.entries(chat.users).find(
      ([_, u]) =>
        Array.isArray(u.characters) && u.characters.some((c) => c.name === character.name),
    )

    try {
      let status = 'Free'
      if (owner) {
        const [id] = owner
        status = `Claimed by ${db.users[id]?.name || 'Someone'}`
      } else if (reserved) {
        status = `Reserved by ${db.users[reserved.userId]?.name || 'Someone'}`
      }

      user.rwCooldown = now + 15 * 60000

      const characterValue =
        typeof character.value === 'number' ? character.value.toLocaleString() : '0'
      const message = `➩ Name › *${character.name || 'Unknown'}*

⚥ Gender › *${character.gender || 'Unknown'}*
⛁ Value › *${characterValue}*
♡ Status › *${status}*
❖ Source › *${character.source || 'Unknown'}*

${dev}`

      const imageUrl = await getGelbooruImage(character.keyword)

      await client.sendMessage(
        chatId,
        {
          image: { url: imageUrl },
          caption: message,
          mimetype: 'image/jpeg',
        },
        { quoted: m },
      )

      if (!owner) {
        reserveCharacter(
          chatId,
          userId,
          {
            ...character,
            id: uniqueId,
            reservedBy: userId,
            reservedUntil: now + 20000,
            expiresAt: now + 60000,
          },
          db,
        )
      }
    } catch (e) {
      user.rwCooldown = 0
      return m.reply(msgglobal)
    }
  },
};
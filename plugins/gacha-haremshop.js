import fs from 'fs';

function getCharacterValue(name) {
  const characterDataPath = './lib/characters.json'
  if (!fs.existsSync(characterDataPath)) return 'Value not available'
  const characterData = JSON.parse(fs.readFileSync(characterDataPath, 'utf-8'))
  const character = characterData.find((char) => char.name === name)
  return character ? character.value?.toLocaleString() : 'Value not available'
}

function getRemainingTime(expires) {
  const now = Date.now()
  const difference = expires - now
  if (difference <= 0) return 'Expired'

  const seconds = Math.floor((difference / 1000) % 60)
  const minutes = Math.floor((difference / (1000 * 60)) % 60)
  const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
  const days = Math.floor(difference / (1000 * 60 * 60 * 24))

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`)

  return parts.join(' ')
}

export default {
  command: ['haremshop', 'waifushop', 'wshop'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const chatConfig = db.chats[chatId]
    const currency = db.settings?.[botId]?.currency || 'coins'

    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    const charactersForSale = Object.entries(chatConfig.users || {}).flatMap(
      ([uid, user]) =>
        user.charactersForSale?.map((p) => ({
          name: p.name,
          price: p.price,
          expires: p.expires,
          seller: uid,
        })) || [],
    )

    if (charactersForSale.length === 0) return m.reply(' No characters are currently for sale.')

    const page = parseInt(args[0]) || 1
    const perPage = 10
    const totalPages = Math.ceil(charactersForSale.length / perPage)

    if (page < 1 || page > totalPages)
      return m.reply(` Page *${page}* does not exist. There are *${totalPages}* pages.`)

    const start = (page - 1) * perPage
    const end = start + perPage
    const list = charactersForSale.slice(start, end)

    let message = `✰ ໌　۟　𝖧𝖺𝗋𝖾𝗆𝖲𝗁𝗈𝗉　ׅ　팅화　ׄ\n✐ Characters for sale:\n\n`

    list.forEach((p) => {
      const sellerName = db.users?.[p.seller]?.name || p.seller.split('@')[0]
      const estimatedValue = getCharacterValue(p.name)
      const time = getRemainingTime(new Date(p.expires).getTime())
      message += `> 𖣣ֶㅤ֯⌗ ꕥ  ׄ ⬭ *${p.name}* (✭ ${estimatedValue})\n> 𖣣ֶㅤ֯⌗ ⛁  ׄ ⬭ Price › *${p.price.toLocaleString()} ${currency}*\n> 𖣣ֶㅤ֯⌗ ❖  ׄ ⬭ Seller › *${sellerName}*\n> 𖣣ֶㅤ֯⌗ ❀  ׄ ⬭ Expires in › *${time}*\n\n`
    })

    message += `> ⌦ Page *${page}* of *${totalPages}*`

    try {
      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch {
      await m.reply(msgglobal)
    }
  },
};
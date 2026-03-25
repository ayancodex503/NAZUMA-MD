import {promises as fs} from 'fs';

async function loadCharacters() {
  try {
    const data = await fs.readFile('./lib/characters.json', 'utf-8')
    return JSON.parse(data)
  } catch {
    throw new Error('Could not load characters.json file.')
  }
}

export default {
  command: ['serieinfo', 'animeinfo', 'ainfo'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    try {
      const name = args.join(' ')
      if (!name) return m.reply(' Please specify an anime.')

      const characters = await loadCharacters()
      const animeCharacters = characters.filter(
        (character) =>
          character.source && character.source.toLowerCase().trim() === name.toLowerCase().trim(),
      )

      if (animeCharacters.length === 0)
        return m.reply(`Anime with name: "${name}" not found.`)

      const claimedCount = animeCharacters.filter((char) => {
        const ownerUser = Object.entries(chatData.users).find(
          ([_, u]) => Array.isArray(u.characters) && u.characters.some((c) => c.name === char.name),
        )
        return !!ownerUser
      }).length

      const totalCharacters = animeCharacters.length

      const message =
        '☆ *Series Info* (●´ϖ`●)' +
        `\n➭ *Name ›* ${name}\n\n` +
        `☆ *Characters ›* ${totalCharacters}\n` +
        `❀ *Claimed ›* ${claimedCount}/${totalCharacters}\n\n` +
        `✎ *Character list* \n${animeCharacters
          .map((char) => {
            const ownerUser = Object.entries(chatData.users).find(
              ([_, u]) =>
                Array.isArray(u.characters) && u.characters.some((c) => c.name === char.name),
            )
            const userId = ownerUser ? ownerUser[0] : null
            const status = userId
              ? `Claimed by ${db.users[userId]?.name || userId.split('@')[0]}`
              : 'Free'
            return `› *${char.name}* (${char.value}) • ${status}`
          })
          .join('\n')}`

      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch (error) {
      await m.reply(msgglobal)
    }
  },
};
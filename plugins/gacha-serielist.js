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
  command: ['slist', 'serielist', 'animelist'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    try {
      const characters = await loadCharacters()

      const sources = characters.reduce((acc, character) => {
        if (!character.source) return acc
        const source = character.source.trim()
        acc[source] = (acc[source] || 0) + 1
        return acc
      }, {})

      const sortedSources = Object.entries(sources).sort(([, a], [, b]) => b - a)
      const sourcesPerPage = 20
      const page = parseInt(args[0], 10) || 1
      const totalPages = Math.ceil(sortedSources.length / sourcesPerPage)

      if (page < 1 || page > totalPages)
        return m.reply(`Page ${page} does not exist. Try between 1 and ${totalPages}.`)

      const startIndex = (page - 1) * sourcesPerPage
      const paginatedSources = sortedSources.slice(startIndex, startIndex + sourcesPerPage)

      const message =
        `*✩ AnimeList (✿❛◡❛)*\n*❒ Series list (${sortedSources.length}):*\n\n` +
        paginatedSources.map(([source, count]) => `› *${source}* (${count})`).join('\n') +
        `\n\n> ⌦ Page *${page}* of *${totalPages}*`

      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch (error) {
      await client.sendMessage(chatId, { text: msgglobal }, { quoted: m })
    }
  },
};
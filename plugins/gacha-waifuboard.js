export default {
  command: ['waifusboard', 'waifustop', 'topwaifus'],
  category: 'gacha',
  use: '[page]',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    const users = Object.entries(chatData.users || {})
      .filter(([_, u]) => (u.characters?.length || 0) > 5)
      .map(([id, u]) => ({
        ...u,
        userId: id,
        name: db.users[id]?.name || id.split('@')[0]
      }))

    if (users.length === 0)
      return m.reply('No users in the group have more than 5 waifus.')

    const sorted = users.sort((a, b) => (b.characters?.length || 0) - (a.characters?.length || 0))
    const page = parseInt(args[0]) || 1
    const pageSize = 10
    const totalPages = Math.ceil(sorted.length / pageSize)

    if (isNaN(page) || page < 1 || page > totalPages)
      return m.reply(`Page *${page}* does not exist. There are a total of *${totalPages}* pages.`)

    const startIndex = (page - 1) * pageSize
    const list = sorted.slice(startIndex, startIndex + pageSize)

    let message = `Users with most waifus\n\n`
    message += list.map((u, i) =>
      `✩ ${startIndex + i + 1} › *${u.name}*\n     Waifus → *${u.characters.length}*`
    ).join('\n\n')

    message += `\n\n> ⌦ Page *${page}* of *${totalPages}*`
    if (page < totalPages)
      message += `\n> To see the next page › *waifusboard ${page + 1}*`

    await client.sendMessage(chatId, { text: message.trim() }, { quoted: m })
  }
};
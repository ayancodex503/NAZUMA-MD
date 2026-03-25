export default {
  command: ['economyboard', 'eboard', 'baltop'],
  category: 'rpg',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const botSettings = db.settings[botId]
    const currency = botSettings.currency

    const chatData = db.chats[chatId]
    if (chatData.adminonly || !chatData.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    try {
      const users = Object.entries(chatData.users || {})
        .filter(([_, data]) => {
          const total = (data.coins || 0) + (data.bank || 0)
          return total >= 1000
        })
        .map(([key, data]) => {
          const name = db.users[key]?.name || data.name || 'User'
          return {
            ...data,
            jid: key,
            name
          }
        })

      if (users.length === 0)
        return m.reply(`ꕥ No users in the group have more than 1,000 ${currency}.`)

      const sorted = users.sort(
        (a, b) => (b.coins || 0) + (b.bank || 0) - ((a.coins || 0) + (a.bank || 0))
      )

      const page = parseInt(args[0]) || 1
      const pageSize = 10
      const totalPages = Math.ceil(sorted.length / pageSize)

      if (isNaN(page) || page < 1 || page > totalPages)
        return m.reply(`Page *${page}* does not exist. There are *${totalPages}* pages.`)

      const start = (page - 1) * pageSize
      const end = start + pageSize

      let text = `*✩ EconomyBoard (✿◡‿◡)*\n\n`
      text += sorted
        .slice(start, end)
        .map(({ name, coins, bank }, i) => {
          const total = (coins || 0) + (bank || 0)
          return `✩ ${start + i + 1} › *${name}*\n     Total → *¥${total.toLocaleString()} ${currency}*`
        })
        .join('\n')

      text += `\n\n> ⌦ Page *${page}* of *${totalPages}*`
      if (page < totalPages)
        text += `\n> To see the next page › *${prefa || '/'}economyboard ${page + 1}*`

      await client.sendMessage(chatId, { text }, { quoted: m })
    } catch (e) {
      await m.reply(msgglobal)
    }
  }
}
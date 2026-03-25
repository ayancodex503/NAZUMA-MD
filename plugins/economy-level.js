import { resolveLidToRealJid } from "../lib/utils.js"
export default {
  command: ['levelup', 'level', 'lvl'],
  category: 'profile',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, client, m.chat);
    const name = who
    const user = db.users[who]

    if (!user)
      return m.reply(`「✎」 The mentioned user is not registered with the bot.`)

    const users = Object.entries(db.users).map(([key, value]) => ({
      ...value,
      jid: key
    }))

    const sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
    const rank = sortedLevel.findIndex(u => u.jid === who) + 1

    const txt = `*「🖤」User* ◢ ${db.users[who].name} ◤

☆ Experience › *${user.exp?.toLocaleString() || 0}*
❖ Level › *${user.level || 0}*
✐ Rank › *#${rank}*

❒ Total commands › *${user.usedcommands?.toLocaleString() || 0}*`

    await client.sendMessage(chatId, { text: txt, mentions: [name] }, { quoted: m })
  }
};
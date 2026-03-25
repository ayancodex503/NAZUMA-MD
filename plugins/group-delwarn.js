import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['delwarn'],
  category: 'group',
  isAdmin: true,
  run: async (client, m, args) => {
    const chat = global.db.data.chats[m.chat]
    const mentioned = m.mentionedJid || []
    const who2 = mentioned.length > 0 ? mentioned[0] : (m.quoted ? m.quoted.sender : false)

    if (!who2) return m.reply(' You must mention or reply to the user whose warning you want to remove.')

    const targetId = await resolveLidToRealJid(who2, client, m.chat)
    const user = chat.users[targetId]
    if (!user) return m.reply('User not found in database.')

    const total = user?.warnings?.length || 0
    if (total === 0) {
      return client.reply(
        m.chat,
        ` User @${targetId.split('@')[0]} has no warnings registered.`,
        m,
        { mentions: [targetId] }
      )
    }

    const name = global.db.data.users[targetId]?.name || 'User'

    const rawIndex = mentioned.length > 0 ? args[1] : args[0]

    if (rawIndex?.toLowerCase() === 'all') {
      user.warnings = []
      return client.reply(
        m.chat,
        `✐ All warnings for user @${targetId.split('@')[0]} (${name}) have been removed.`,
        m,
        { mentions: [targetId] }
      )
    }

    const index = parseInt(rawIndex)
    if (isNaN(index)) {
      return m.reply('You must specify the warning index to remove or use "all" to delete all.')
    }

    if (index < 1 || index > total) {
      return m.reply(` Index must be a number between 1 and ${total}.`)
    }

    const realIndex = total - index
    user.warnings.splice(realIndex, 1)

    await client.reply(
      m.chat,
      `Warning #${index} for user @${targetId.split('@')[0]} (${name}) has been removed.`,
      m,
      { mentions: [targetId] }
    )
  },
}
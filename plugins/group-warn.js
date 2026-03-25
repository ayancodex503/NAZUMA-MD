import { resolveLidToRealJid } from "../lib/utils.js"

export default {
  command: ['warn'],
  category: 'group',
  isAdmin: true,
  run: async (client, m, args) => {
    const chat = global.db.data.chats[m.chat]
    const mentioned = m.mentionedJid
    const who2 = mentioned.length > 0
      ? mentioned[0]
      : m.quoted
      ? m.quoted.sender
      : false
    const targetId = await resolveLidToRealJid(who2, client, m.chat);

    const reason = mentioned.length > 0
      ? args.slice(1).join(' ') || 'No reason.'
      : args.slice(0).join(' ') || 'No reason.'

    try {
      if (!who2) return m.reply(' You must mention or reply to the user you want to warn.')

      if (!chat.users[targetId]) chat.users[targetId] = {}
      const user = chat.users[targetId]
      if (!user.warnings) user.warnings = []

      const now = new Date()
      const timestamp = now.toLocaleString('en-US', {
        timeZone: 'America/Bogota',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      user.warnings.unshift({
        reason,
        timestamp,
        by: m.sender,
      })

      const total = user.warnings.length
      const name = global.db.data.users[targetId]?.name || 'User'
      const warningList = user.warnings
        .map((w, i) => {
          const index = total - i
          return `\`#${index}\` » ${w.reason}\n> » Date: ${w.timestamp}`
        })
        .join('\n')

      let message = `✐ A warning has been added to @${targetId.split('@')[0]}.\n✿ Total warnings \`(${total})\`:\n\n${warningList}`

      const warnLimit = chat.warnLimit || 3
      const expulsar = chat.expulsar === true

      if (total >= warnLimit && expulsar) {
        try {
          await client.groupParticipantsUpdate(m.chat, [targetId], 'remove')
          delete chat.users[targetId]
          delete global.db.data.users[targetId]
          message += `\n\n> The user has reached the warning limit and was removed from the group.`
        } catch {
          message += `\n\n> The user reached the limit, but could not be automatically removed.`
        }
      } else if (total >= warnLimit && !expulsar) {
        message += `\n\n> The user has reached the warning limit.`
      }

      await client.reply(m.chat, message, m, { mentions: [targetId] })
    } catch (e) {
      m.reply(msgglobal)
    }
  },
};
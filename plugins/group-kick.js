export default {
  command: ['kick'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m, args) => {
    if (!m.mentionedJid[0] && !m.quoted) {
      return m.reply('Tag or reply to the *message* of the *person* you want to remove')
    }

    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender

    const groupInfo = await client.groupMetadata(m.chat)
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

    const participant = groupInfo.participants.find(
      (p) => p.phoneNumber === user || p.jid === user || p.id === user || p.lid === user,
    )
    if (!participant) {
      return client.reply(m.chat, ` *@${user.split('@')[0]}* is no longer in the group.`, m, {
        mentions: [user],
      })
    }

    if (user === client.decodeJid(client.user.id)) {
      return m.reply(' I cannot remove the *bot* from the group')
    }

    if (user === ownerGroup) {
      return m.reply(' I cannot remove the *group owner*')
    }

    if (user === ownerBot) {
      return m.reply(' I cannot remove the *bot owner*')
    }

    try {
      await client.groupParticipantsUpdate(m.chat, [user], 'remove')
      client.reply(m.chat, `✎ @${user.split('@')[0]} *removed* successfully`, m, {
        mentions: [user],
      })
    } catch (e) {
      // console.error(e)
      m.reply(msgglobal)
    }
  },
};
export default {
  command: ['demote'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m) => {
    const mentioned = await m.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : m.quoted ? await m.quoted.sender : false

    if (!who) return m.reply(' Mention the user you want to demote from admin.')

    try {
      const groupMetadata = await client.groupMetadata(m.chat)
      const participant = groupMetadata.participants.find((p) => p.phoneNumber === who || p.id === who || p.lid === who || p.jid === who)

      if (!participant?.admin)
        return client.sendMessage(
          m.chat,
          {
            text: ` *@${who.split('@')[0]}* is not an admin of this group!`,
            mentions: [who],
          },
          { quoted: m },
        )

      if (who === groupMetadata.owner)
        return m.reply(' You cannot demote the group creator from admin.')

      if (who === client.user.jid) return m.reply(' You cannot demote the bot from admin.')

      await client.groupParticipantsUpdate(m.chat, [who], 'demote')
      await client.sendMessage(
        m.chat,
        {
          text: ` *@${who.split('@')[0]}* has been demoted from group admin!`,
          mentions: [who],
        },
        { quoted: m },
      )
    } catch {
      await m.reply(msgglobal)
    }
  },
};
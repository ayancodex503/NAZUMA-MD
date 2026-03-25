export default {
  command: ['promote'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m) => {
    const mentioned = await m.mentionedJid
    const who = mentioned.length > 0 ? mentioned[0] : m.quoted ? await m.quoted.sender : false

    if (!who) return m.reply('Mention the user you want to promote to admin.')

    try {
      const groupMetadata = await client.groupMetadata(m.chat)
      const participant = groupMetadata.participants.find((p) => p.phoneNumber === who || p.id === who || p.lid === who || p.jid === who)

      if (participant?.admin)
        return client.sendMessage(
          m.chat,
          {
            text: `*@${who.split('@')[0]}* is already an admin of this group!`,
            mentions: [who],
          },
          { quoted: m },
        )

      await client.groupParticipantsUpdate(m.chat, [who], 'promote')
      await client.sendMessage(
        m.chat,
        {
          text: ` *@${who.split('@')[0]}* has been promoted to group admin!`,
          mentions: [who],
        },
        { quoted: m },
      )
    } catch {
      await m.reply(msgglobal)
    }
  },
};
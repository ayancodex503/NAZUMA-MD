export default {
  command: ['close'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m) => {
    try {
      const groupMetadata = await client.groupMetadata(m.chat)
      const groupAnnouncement = groupMetadata.announce

      if (groupAnnouncement === true) {
        return client.reply(m.chat, ` The group is already closed.`, m)
      }

      await client.groupSettingUpdate(m.chat, 'announcement')
      return client.reply(m.chat, `The group has been closed successfully.`, m)
    } catch (err) {
      console.error(err)
      return client.reply(m.chat, msgglobal, m)
    }
  },
};
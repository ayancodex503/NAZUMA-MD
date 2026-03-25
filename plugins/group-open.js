export default {
  command: ['open'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m) => {
    try {
      const groupMetadata = await client.groupMetadata(m.chat)
      const groupAnnouncement = groupMetadata.announce

      if (groupAnnouncement === false) {
        return client.reply(m.chat, `The group is already open.`, m)
      }

      await client.groupSettingUpdate(m.chat, 'not_announcement')
      return client.reply(m.chat, `The group has been opened successfully.`, m)
    } catch (err) {
      console.error(err)
      return client.reply(m.chat, msgglobal, m)
    }
  },
};
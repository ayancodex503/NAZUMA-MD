export default {
  command: ['link'],
  category: 'group',
  botAdmin: true,
  run: async (client, m) => {
    try {
      const code = await client.groupInviteCode(m.chat)
      const link = `https://chat.whatsapp.com/${code}`
      await client.reply(m.chat, `${link}`, m)
    } catch (e) {
      await client.reply(m.chat, msgglobal, m)
    }
  },
};
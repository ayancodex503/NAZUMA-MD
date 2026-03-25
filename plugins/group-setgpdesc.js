export default {
  command: ['setgpdesc'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m, args) => {
    const newDesc = args.join(' ').trim()
    if (!newDesc)
      return m.reply(' Please enter the new description you want to give to the group.')

    try {
      await client.groupUpdateDescription(m.chat, newDesc)
      m.reply(' The group description has been successfully changed.')
    } catch {
      m.reply(msgglobal)
    }
  },
};
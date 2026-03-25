export default {
  command: ['setgpname'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m, args) => {
    const newName = args.join(' ').trim()

    if (!newName)
      return m.reply(' Please enter the new name you want to give to the group.')

    try {
      await client.groupUpdateSubject(m.chat, newName)
      m.reply(`The group name has been successfully changed.`)
    } catch {
      m.reply(msgglobal)
    }
  },
};
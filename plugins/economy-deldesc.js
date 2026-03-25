export default {
  command: ['deldescription', 'deldesc'],
  category: 'rpg',
  run: async (client, m) => {
    const user = global.db.data.users[m.sender]
    if (!user.description) return m.reply(`You don't have a description set.`)

    user.description = ''
    return m.reply(`✎ Your description has been removed.`)
  },
};
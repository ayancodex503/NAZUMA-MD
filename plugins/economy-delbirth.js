export default {
  command: ['delbirth'],
  category: 'rpg',
  run: async (client, m) => {
    const user = global.db.data.users[m.sender]
    if (!user.birth) return m.reply(`You don't have a birth date set.`)

    user.birth = ''
    return m.reply(`✎ Your birth date has been removed.`)
  },
};
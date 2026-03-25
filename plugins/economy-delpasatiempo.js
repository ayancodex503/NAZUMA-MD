export default {
  command: ['delpasatiempo', 'removehobby'],
  category: 'rpg',
  run: async (client, m, args) => {
    const user = global.db.data.users[m.sender]

    if (!user.pasatiempo || user.pasatiempo === 'Not defined') {
      return m.reply('You don\'t have any hobby set.')
    }

    const previousHobby = user.pasatiempo
    user.pasatiempo = 'Not defined'
    
    return m.reply(`✎ Your hobby has been removed.`)
  },
};
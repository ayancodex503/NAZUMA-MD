export default {
  command: ['setdescription', 'setdesc'],
  category: 'rpg',
  run: async (client, m, args) => {
    const user = global.db.data.users[m.sender]
    const input = args.join(' ')

    if (user.description)
      return m.reply(
        `You already have a description. Use › *${prefa}deldescription* to remove it.`,
      )

    if (!input)
      return m.reply(
        'You must specify a valid description.',
      )

    user.description = input
    return m.reply(`✎ Your description has been set to:\n> *${user.description}*`)
  },
};
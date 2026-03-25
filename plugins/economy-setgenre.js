export default {
  command: ['setgenre'],
  category: 'rpg',
  run: async (client, m, args) => {
    const user = global.db.data.users[m.sender]
    const input = args.join(' ').toLowerCase()

    if (user.genre)
      return m.reply(`You already have a gender. Use › *${prefa}delgenre* to remove it.`)

    if (!input)
      return m.reply(
        'You must enter a valid gender.',
      )

    const genre = input === 'male' ? 'Male' : input === 'female' ? 'Female' : null
    if (!genre) return m.reply(`Choose a valid gender.`)

    user.genre = genre
    return m.reply(`✎ Your gender has been set to: *${user.genre}*`)
  },
};
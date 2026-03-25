export default {
  command: ['sethobby'],
  category: 'rpg',
  run: async (client, m, args) => {
    const user = global.db.data.users[m.sender]
    const prefa = global.prefa || '!'
    const input = args.join(' ').trim()

    const availableHobbies = [
      '📚 Reading', '✍️ Writing', '🎨 Singing', '💃 Dancing', '🎮 Gaming',
      '🎨 Drawing', '🍳 Cooking', '✈️ Traveling', '🏊 Swimming', '📸 Photography',
      '🎧 Listening to music', '🏀 Sports', '🎬 Watching movies', '🌿 Gardening',
      '🧵 Crafts', '🎲 Board games', '🏋️ Gym', '🚴 Cycling', '🎯 Archery',
      '🍵 Tea ceremony', '🧘 Meditation', '🎪 Juggling', '🛠️ DIY',
      '🎹 Playing instruments', '🐶 Pet care', '🌌 Astronomy', '♟️ Chess',
      '🍷 Wine tasting', '🛍️ Shopping', '🏕️ Camping', '🎣 Fishing',
      '📱 Technology', '🎭 Theater', '🍽️ Gastronomy', '🏺 Collecting',
      '✂️ Sewing', '🧁 Baking', '📝 Blogging', '🚗 Cars', '🧩 Puzzles',
      '🎳 Bowling', '🏄 Surfing', '⛷️ Skiing', '🎿 Snowboarding', '🤿 Diving',
      '🎯 Target shooting', '🧭 Orienteering', '🏇 Horseback riding', '🎨 Painting',
      '📊 Investing', '🌡️ Meteorology', '🔍 Researching', '💄 Makeup', '💇 Hairdressing',
      '🛌 Sleeping', '🍺 Brewing', '🪚 Woodworking', '🧪 Experiments', '📻 Ham radio',
      '🗺️ Geography', '💎 Jewelry making', 'Other 🌟'
    ]

    if (!input) {
      let list = '🎯 *Choose a hobby:*\n\n'
      availableHobbies.forEach((hobby, index) => {
        list += `${index + 1}) ${hobby}\n`
      })
      list += `\n*Examples:*\n${prefa}sethobby 1\n${prefa}sethobby Reading\n${prefa}sethobby "Other 🌟"`
      
      return m.reply(list)
    }

    let selectedHobby = ''

    if (/^\d+$/.test(input)) {
      const index = parseInt(input) - 1
      if (index >= 0 && index < availableHobbies.length) {
        selectedHobby = availableHobbies[index]
      } else {
        return m.reply(`Invalid number. Select a number between 1 and ${availableHobbies.length}`)
      }
    } else {
      const cleanInput = input.replace(/[^\w\s]/g, '').toLowerCase().trim()
      const found = availableHobbies.find(
        p => p.replace(/[^\w\s]/g, '').toLowerCase().includes(cleanInput)
      )

      if (found) {
        selectedHobby = found
      } else {
        return m.reply('Hobby not found...')
      }
    }

    if (user.pasatiempo === selectedHobby) {
      return m.reply(`You already have this hobby set: *${user.pasatiempo}*`)
    }

    user.pasatiempo = selectedHobby
    
    return m.reply(`✅ Your hobby has been set to:\n> *${user.pasatiempo}*`)
  },
};
import {promises as fs} from 'fs';

const charactersFilePath = './lib/characters.json'
const cooldownTime = 60 * 60 * 1000
let characterVotes = new Map()

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    throw new Error(' Could not load characters.json file')
  }
}

async function saveCharacters(characters) {
  try {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2))
  } catch {
    throw new Error(' Could not save characters.json file')
  }
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  if (hours === 0 && minutes === 0) return `${seconds} second${seconds !== 1 ? 's' : ''}`

  if (hours === 0)
    return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`

  return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`
}

export default {
  command: ['vote'],
  category: 'gacha',
  run: async (client, m, args, command) => {
    const db = global.db.data
    const chatId = m.chat
    const userId = m.sender

    const chatConfig = db.chats[chatId]
    const user = db.users[userId]

    if (chatConfig.adminonly || !chatConfig.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!user.voteCooldown) user.voteCooldown = 0
    const remainingTime = user.voteCooldown - Date.now()
    if (remainingTime > 0)
      return m.reply(`✎ You must wait *${msToTime(remainingTime)}* to use *vote* again`)

    if (args.length === 0)
      return m.reply(
        `✎ Please specify the character name.`
      )

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      const character = characters.find((c) => c.name.toLowerCase() === characterName)

      if (!character)
        return m.reply(
          ` Character *${characterName}* not found. Make sure you spell it correctly`,
        )

if ((character.votes || 0) >= 10) {
  return m.reply(` Character *${character.name}* already has the maximum value.`)
}

      if (characterVotes.has(characterName)) {
        const expires = characterVotes.get(characterName)
        const cooldownLeft = expires - Date.now()
        if (cooldownLeft > 0)
          return m.reply(
            ` *${character.name}* was recently voted\nWait *${msToTime(cooldownLeft)}* before voting again`,
          )
      }

      const incrementValue = Math.floor(Math.random() * 100) + 1
      character.value = (Number(character.value) || 0) + incrementValue
      character.votes = (character.votes || 0) + 1
      character.lastVoteTime = Date.now()

      await saveCharacters(characters)

      user.voteCooldown = Date.now() + 90 * 60000
      characterVotes.set(characterName, Date.now() + cooldownTime)

      const message = `✎ You voted for *${character.name}*\n\n> ⛁ *New value ›* ${character.value.toLocaleString()}\n> *Total votes ›* ${character.votes}`
      await client.sendMessage(chatId, { text: message }, { quoted: m })
    } catch (error) {
      await client.sendMessage(chatId, { text: msgglobal }, { quoted: m })
    }
  },
};
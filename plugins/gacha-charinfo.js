import {promises as fs} from 'fs';
import fetch from 'node-fetch';

const getGelbooruImage = async (keyword) => {
  const url = `https://api.delirius.store/search/gelbooru?query=${encodeURIComponent(keyword)}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    const imageExtensions = /\.(jpg|jpeg|png)$/i
    const validImages = data?.data?.filter(
      (item) => typeof item?.image === 'string' && imageExtensions.test(item.image),
    )
    if (!validImages?.length) return null
    const random = validImages[Math.floor(Math.random() * validImages.length)]
    return random.image
  } catch {
    return null
  }
}

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading characters.json:', error)
    throw new Error('Could not load characters.json file')
  }
}

function findSimilarCharacter(name, characters) {
  name = name.toLowerCase().trim()
  return (
    characters.find((c) => c.name.toLowerCase() === name) ||
    characters.find((c) => c.name.toLowerCase().includes(name)) ||
    characters.find((c) => name.includes(c.name.toLowerCase()))
  )
}

export default {
  command: ['charimage', 'wimage', 'cimage'],
  category: 'gacha',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (args.length === 0)
      return m.reply(
        `✎ Please provide a character name.`
      )

    try {
      const characterName = args.join(' ').toLowerCase().trim()
      const characters = await loadCharacters()
      const character = findSimilarCharacter(characterName, characters)

      if (!character)
        return m.reply(`✎ Character *${characterName}* not found, nor a similar one.`)

      const message = `➭ Name › *${character.name}*\n\n✎ Gender › *${character.gender}*\n⛁ Value › *${character.value.toLocaleString()}*\n❖ Source › *${character.source}*\n\n${dev}`

      const imageUrl = await getGelbooruImage(character.keyword)
      await client.sendMessage(
        chatId,
        {
          image: { url: imageUrl },
          caption: message,
          mimetype: 'image/jpeg',
        },
        { quoted: m },
      )
    } catch (error) {
      await client.sendMessage(chatId, { text: msgglobal }, { quoted: m })
    }
  },
};
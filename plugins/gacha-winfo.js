import {promises as fs} from 'fs';

const charactersFilePath = './lib/characters.json'

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))

  let result = ''
  if (days > 0) result += `${days} d `
  if (hours > 0) result += `${hours} h `
  if (minutes > 0) result += `${minutes} m `
  if (seconds > 0 || result === '') result += `${seconds} s`
  return result.trim()
}

function findSimilarCharacter(name, characters) {
  name = name.toLowerCase().trim()
  return (
    characters.find(c => c.name.toLowerCase() === name) ||
    characters.find(c => c.name.toLowerCase().includes(name)) ||
    characters.find(c => name.includes(c.name.toLowerCase()))
  )
}

function formatDate(timestamp) {
  const date = new Date(timestamp)
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  return `${daysOfWeek[date.getDay()]}, ${date.getDate()} of ${months[date.getMonth()]} ${date.getFullYear()}`
}

export default {
  command: ['winfo', 'charinfo', 'cinfo'],
  category: 'gacha',
  use: '<character name>',
  run: async (client, m, args) => {
    const db = global.db.data
    const chatId = m.chat
    const chatData = db.chats[chatId]

    if (chatData.adminonly || !chatData.gacha)
      return m.reply(`✎ These commands are disabled in this group.`)

    const characterName = args.join(' ').toLowerCase().trim()
    if (!characterName)
      return m.reply(`「✎」 Please provide a character name.\n\n> › *Example:* winfo Senko`)

    const characters = await loadCharacters()
    const character = findSimilarCharacter(characterName, characters)
    if (!character)
      return m.reply(` Character *${characterName}* not found, nor a similar one.`)

    const sortedByValue = [...characters].sort((a, b) => (b.value || 0) - (a.value || 0))
    const rank = sortedByValue.findIndex(c => c.name.toLowerCase() === character.name.toLowerCase()) + 1
    const lastVoteTime = character.lastVoteTime || null
    const timeAgo = lastVoteTime ? msToTime(Date.now() - lastVoteTime) + ' ago' : 'Has not been voted yet.'

    const reserved = chatData.reservedCharacters?.find(p => p.name === character.name)
    const ownerUser = Object.entries(chatData.users || {}).find(([_, user]) =>
      user.characters?.some(c => c.name === character.name)
    )

    const ownerId = ownerUser?.[0] || m.sender
    const ownerData = chatData.users?.[ownerId]
    const characterInstance = ownerData?.characters?.find(c => c.name.toLowerCase() === character.name.toLowerCase())
    const claimStatus = characterInstance?.claim || 'Unknown'

    let status = '*Free*'
    if (ownerUser)
      status = `*Claimed by ${db.users[ownerId]?.name || ownerId.split('@')[0]}*\n☆ Claim date › *${claimStatus}*`
    else if (reserved)
      status = `*Reserved by ${db.users[reserved.userId]?.name || reserved.userId.split('@')[0]}*`

    const message = `➭ Name › *${character.name}*\n\n⚥ Gender › *${character.gender || 'Unknown'}*\n✰ Value › *${character.value.toLocaleString()}*\n♡ Status › ${status}\n✧ Votes › *${character.votes || 0}*\n❀ Source › *${character.source || 'Unknown'}*\n✩ Rank › *#${rank}*\nⴵ Last vote › *${timeAgo}*`

    await client.sendMessage(chatId, { text: message }, { quoted: m })
  }
};
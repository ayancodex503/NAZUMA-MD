import fetch from 'node-fetch'

const commandAliases = {
  hug: 'hug',
  kiss: 'kiss',
  pat: 'pat',
  slap: 'slap',
  wave: 'wave',
  laugh: 'laugh',

  cuddle: 'cuddle',
  wink: 'wink',
  smile: 'smile',
  cry: 'cry',
  smug: 'smug',
  dance: 'dance',
  blush: 'blush',
  bonk: 'bonk',
  bite: 'bite',
  bully: 'bully',
  highfive: 'highfive',
  handhold: 'handhold'
}

const captions = {
  hug: (a, b, g) => `hugs`,
  kiss: (a, b, g) => `kisses`,
  pat: (a, b, g) => `pats`,
  slap: (a, b, g) => `slaps`,
  wave: (a, b, g) => `waves at`,
  laugh: (a, b, g) => `laughs with`,

  cuddle: (a,b,g)=>`cuddles`,
  wink: (a,b,g)=>`winks at`,
  smile: (a,b,g)=>`smiles at`,
  cry: (a,b,g)=>`cries with`,
  smug: (a,b,g)=>`smirks at`,
  dance: (a,b,g)=>`dances with`,
  blush: (a,b,g)=>`blushes at`,
  bonk: (a,b,g)=>`bonks`,
  bite: (a,b,g)=>`bites`,
  bully: (a,b,g)=>`bullies`,
  highfive: (a,b,g)=>`high-fives`,
  handhold: (a,b,g)=>`holds hands with`
}


const symbols = ['🕷️','🕸️','🕷','🕸']

function getRandomSymbol () {
  return symbols[Math.floor(Math.random() * symbols.length)]
}


async function getGif(action) {

  const queries = {
    hug: 'anime hug',
    kiss: 'anime kiss',
    pat: 'anime head pat',
    slap: 'anime slap',
    wave: 'anime wave',
    laugh: 'anime laugh',
    cuddle: 'anime cuddle',
    wink: 'anime wink',
    smile: 'anime smile',
    cry: 'anime cry',
    smug: 'anime smug',
    dance: 'anime dance',
    blush: 'anime blush',
    bonk: 'anime bonk',
    bite: 'anime bite',
    bully: 'anime bully',
    highfive: 'anime high five',
    handhold: 'anime hand holding'
  }

  const q = queries[action] || action

  const params = new URLSearchParams({
    key: 'AIzaSyC-P6_qz3FzCoXGLk6tgitZo4jEJ5mLzD8',
    client_key: 'tenor_web',
    locale: 'en_US',
    q,
    limit: '25',
    contentfilter: 'low',
    media_filter: 'gif,originalgif,mp4,webm,tinymp4'
  })

  const url = `https://tenor.googleapis.com/v2/search?${params}`

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Android 13)'
    }
  })

  const json = await res.json()

  const list = (json.results || [])
    .map(r =>
      r.media_formats?.tinymp4?.url ||
      r.media_formats?.mp4?.url ||
      r.media_formats?.gif?.url ||
      r.media_formats?.originalgif?.url ||
      r.media_formats?.webm?.url
    )
    .filter(Boolean)

  if (!list.length) return null

  return list[Math.floor(Math.random() * list.length)]
}


export default {
  command: Object.keys(commandAliases),
  category: 'anime',

  run: async (client, m, args, command) => {

    const currentCommand = commandAliases[command] || command

    if (!captions[currentCommand]) return

    let who
    const texto = m.mentionedJid || []

    if (m.isGroup) {
      who = texto.length
        ? texto[0]
        : m.quoted
          ? m.quoted.sender
          : m.sender
    } else {
      who = m.quoted ? m.quoted.sender : m.sender
    }

    const fromName = global.db.data.users[m.sender]?.name || 'Someone'
    const toName = global.db.data.users[who]?.name || 'someone'
    const genero = global.db.data.users[m.sender]?.genre || 'Hidden'

    const captionText = captions[currentCommand](fromName, toName, genero)

    const caption =
      who !== m.sender
        ? `@${m.sender.split('@')[0]} ${captionText} @${who.split('@')[0]} ${getRandomSymbol()}.`
        : `${fromName} ${captionText} ${getRandomSymbol()}.`

    try {

      const result = await getGif(currentCommand)

      if (!result) {
        return client.reply(m.chat, '✐ Could not get a GIF', m)
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: result },
          gifPlayback: true,
          caption,
          mentions: [m.sender, who]
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  }
}
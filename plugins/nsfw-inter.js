import fetch from 'node-fetch'


const captions = {      
  anal: (from, to) => from === to ? 'put it in the ass.' : 'put it in the ass of',
  cum: (from, to) => from === to ? 'came inside... We\'ll omit that.' : 'came inside',
  undress: (from, to) => from === to ? 'is taking off their clothes' : 'is taking off the clothes of',
  fuck: (from, to) => from === to ? 'surrenders to desire' : 'is fucking',
  spank: (from, to) => from === to ? 'is giving a spank' : 'is giving a spank to',
  lickpussy: (from, to) => from === to ? 'is licking a pussy' : 'is licking the pussy of',
  fap: (from, to) => from === to ? 'is masturbating' : 'is masturbating thinking about',
  grope: (from, to) => from === to ? 'is groping themselves' : 'is groping',
  sixnine: (from, to) => from === to ? 'is doing a 69' : 'is doing a 69 with',
  suckboobs: (from, to) => from === to ? 'is sucking some nice boobs' : 'is sucking the boobs of',
  grabboobs: (from, to) => from === to ? 'is grabbing some boobs' : 'is grabbing the boobs of',
  blowjob: (from, to) => from === to ? 'is giving a nice blowjob' : 'gave a blowjob to',
  boobjob: (from, to) => from === to ? 'is doing a boobjob' : 'is doing a boobjob for',
  footjob: (from, to) => from === to ? 'is giving a footjob' : 'is giving a footjob to'
}

const symbols = ['(⁠◠⁠‿⁠◕⁠)','˃͈◡˂͈','૮(˶ᵔᵕᔶ)ა','(づ｡◕‿‿◕｡)づ','(✿◡‿◡)','(꒪⌓꒪)','(✿✪‿✪｡)','(*≧ω≦)','(✧ω◕)','˃ 𖥦 ˂','(⌒‿⌒)','(¬‿¬)','(✧ω✧)','✿(◕ ‿◕)✿','ʕ•́ᴥ•̀ʔっ','(ㅇㅅㅇ❀)','(∩︵∩)','(✪ω✪)','(✯◕‿◕✯)','(•̀ᴗ•́)و ̑̑']
function getRandomSymbol () { return symbols[Math.floor(Math.random() * symbols.length)] }

const commandAliases = {
  undress: 'undress',
  fuck: 'fuck',
  spank: 'spank',
  fap: 'fap',
  '69': 'sixnine',
  bj: 'blowjob'
}

async function getNsfwGif(type) {
    
  const apis = [
    async () => { 
      try {
        const res = await fetch(`https://api.waifu.pics/nsfw/${type}`)
        const json = await res.json()
        if (json?.url && (json.url.endsWith('.gif') || json.url.endsWith('.mp4') || json.url.endsWith('.webm'))) {
          return json.url
        }
      } catch {}
      return null
    },
    async () => { 
      try {
        const res = await fetch(`https://nekos.best/api/v2/${type}`)
        const json = await res.json()
        if (json?.results?.[0]?.url) return json.results[0].url
      } catch {}
      return null
    },
    async () => { 
      try {
        const nekoMap = {
          anal:'anal', cum:'cum', undress:'hentai', fuck:'hentai', spank:'spank',
          lickpussy:'pussy', fap:'hentai', grope:'hentai', sixnine:'hentai',
          suckboobs:'boobs', grabboobs:'boobs', blowjob:'blowjob', boobjob:'hentai', footjob:'feet'
        }
        const t = nekoMap[type] || 'hentai'
        const res = await fetch(`https://nekobot.xyz/api/image?type=${t}`)
        const j = await res.json()
        if (j?.message) return j.message
      } catch {}
      return null
    }
  ]

  for (const api of apis) {
    const url = await api()
    if (url) return url
  }

  return null
}

export default {
  command: [
    'anal','cum','undress','fuck','spank',
    'lickpussy','fap','grope','sixnine','69','suckboobs',
    'grabboobs','blowjob','bj','boobjob','footjob'
  ],
  category: 'nsfw',

  run: async (client, m, args, command) => {
    if (!global.db.data.chats[m.chat]?.nsfw)
      return m.reply('✐ *NSFW* commands are disabled in this Group.')

    const used = (command || '').toLowerCase()
    const currentCommand = commandAliases[used] || used
    if (!captions[currentCommand]) return

    let who
    const texto = m.mentionedJid || []

    if (m.isGroup) {
      who = texto.length ? texto[0] : m.quoted ? m.quoted.sender : m.sender
    } else {
      who = m.quoted ? m.quoted.sender : m.sender
    }

    const fromName = global.db.data.users[m.sender]?.name || 'Someone'
    const toName = global.db.data.users[who]?.name || 'someone'

    const captionText = captions[currentCommand](fromName, toName)
    const caption =
      who !== m.sender
        ? `@${m.sender.split('@')[0]} ${captionText} @${who.split('@')[0]} ${getRandomSymbol()}.`
        : `${fromName} ${captionText} ${getRandomSymbol()}.`

    try {
      const gif = await getNsfwGif(currentCommand)
      if (!gif) return m.reply('✐ Could not get a GIF.')

      await client.sendMessage(
        m.chat,
        {
          video: { url: gif },
          gifPlayback: true,
          caption,
          mentions: [who, m.sender]
        },
        { quoted: m }
      )

    } catch (e) {
      console.error(e)
      await m.reply(msgglobal)
    }
  }
}
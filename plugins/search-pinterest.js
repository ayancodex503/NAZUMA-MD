import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, args, from) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)

    if (!text) {
      return m.reply(
        `Enter a *search term* or a *Pinterest link*.`,
      )
    }

    try {
      if (isPinterestUrl) {
        const pinterestUrl = `${api.url}/dl/pinterest?url=${text}&key=${api.key}`
        const ress = await fetch(pinterestUrl)
        const { data: result } = await ress.json()
        const mediaType = ['image', 'video'].includes(result.type) ? result.type : 'document'

        const message2 =
          `> ➩ Results for › *${result.title}*\n` +
          `✐ Author › *${result.author}*\n` +
          `✐ Type › *${result.type}*\n\n${dev}`

        await client.sendMessage(
          m.chat,
          { [mediaType]: { url: result.dl }, caption: message2 },
          { quoted: m },
        )
      } else {
        const pinterestAPI = `${api.url}/search/pinterest?q=${text}`
        const res = await fetch(pinterestAPI)
        const jsons = await res.json()

        if (!jsons.status || !jsons.result || jsons.result.length === 0) {
          return m.reply(`✐ No results found for *${text}*`)
        }

        const index = Math.floor(Math.random() * jsons.result.length)
        const result = jsons.result[index]

        const message =
          `➩ Results for › *${text}*\n\n` +
          `ꕥ Title › *${result.titulo}*\n\n${dev}`

        await client.sendMessage(
          m.chat,
          { image: { url: result.image_large_url || result.image_medium_url || result.image_small_url }, caption: message },
          { quoted: m },
        )
      }
    } catch (e) {
      await client.reply(
        m.chat,
       msgglobal,
        m
      )
    }
  },
}
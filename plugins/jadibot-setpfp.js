import * as Jimp from 'jimp';

async function resizeImage(media) {
  const jimp = await Jimp.read(media)
  const min = jimp.getWidth()
  const max = jimp.getHeight()
  const cropped = jimp.crop(0, 0, min, max)
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.normalize().getBufferAsync(Jimp.MIME_JPEG),
  }
}

export default {
  command: ['setimage', 'setpfp'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const config = global.db.data.settings[idBot]
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender)
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket)
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/image/g.test(mime)) return m.reply('✐ You must send or quote an image to change the bot profile picture.')

    const media = await q.download()
    if (!media) return m.reply('✎ Could not download the image.')

    const jid = client.user.id.split(':')[0] + '@s.whatsapp.net'

    if (args[1] === 'full') {
      const { img } = await resizeImage(media)
      await client.query({
        tag: 'iq',
        attrs: {
          to: jid,
          type: 'set',
          xmlns: 'w:profile:picture',
        },
        content: [
          {
            tag: 'picture',
            attrs: { type: 'image' },
            content: img,
          },
        ],
      })
    } else {
      await client.updateProfilePicture(jid, media)
    }

    return m.reply(` The profile picture of *${config.namebot}* has been updated!`)
  },
};
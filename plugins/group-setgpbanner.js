export default {
  command: ['setgpbanner'],
  category: 'group',
  isAdmin: true,
  botAdmin: true,
  run: async (client, m) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image/.test(mime))
      return m.reply('You need to send an image to change the group profile picture.')

    const img = await q.download()
    if (!img) return m.reply('Could not download the image.')

    try {
      await client.updateProfilePicture(m.chat, img)
      m.reply(' The group profile picture has been successfully updated.')
    } catch {
      m.reply(msgglobal)
    }
  },
};
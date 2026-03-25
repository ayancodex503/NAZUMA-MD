import fetch from 'node-fetch';
import FormData from 'form-data';

async function uploadToCatbox(buffer, mime) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', buffer, {
    filename: `${Date.now()}.${mime.split('/')[1]}`,
    contentType: mime
  });

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  });

  const url = await res.text();
  if (!url.startsWith('http')) {
    throw new Error('Failed to upload to Catbox: ' + url);
  }

  return url;
}

export default {
  command: ['seticon'],
  category: 'socket',
  run: async (client, m, args) => {
    const idBot = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const config = global.db.data.settings[idBot];
    const isOwner2 = [idBot, ...global.owner.map((number) => number + '@s.whatsapp.net')].includes(m.sender);
    if (!isOwner2 && m.sender !== owner) return m.reply(mess.socket);

    const value = args.join(' ').trim();

    if (!value && !m.quoted && !m.message.imageMessage)
      return m.reply('✎ You must send or quote an image to change the bot icon.');

    if (value.startsWith('http')) {
      config.icon = value;
      return m.reply(` The icon for *${config.namebot2}* has been updated!`);
    }

    const q = m.quoted ? m.quoted : m.message.imageMessage ? m : m;
    const mime = (q.msg || q).mimetype || q.mediaType || '';
    if (!/image\/(png|jpe?g|gif)/.test(mime))
      return m.reply('✎ Reply to a valid image.');

    const media = await q.download();
    if (!media) return m.reply('✎ Could not download the image.');

    const link = await uploadToCatbox(media, mime);
    config.icon = link;

    return m.reply(` The icon for *${config.namebot2}* has been updated!`);
  },
};
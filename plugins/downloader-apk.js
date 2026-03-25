import fetch from "node-fetch"
import { getBuffer } from '../lib/message.js'

export default {
  command: ["apk"],
  category: "downloader",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Usage:* .apk [app name]")

    try {
      await m.reply(`> 📥 *Searching for app...*`)

      const searchRes = await fetch(`https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(text)}&limit=1`)
      const searchData = await searchRes.json()

      if (!searchData.datalist || !searchData.datalist.list.length) {
        return m.reply("❌ App not found.")
      }

      const app = searchData.datalist.list[0]
      const name = app.name
      const packageName = app.package
      const size = (app.file.size / (1024 * 1024)).toFixed(2) 
      const icon = app.icon
      const downloadLink = app.file.path

      let details = `📦 *APK DETAILS*\n\n`
      details += `• *Name:* ${name}\n`
      details += `• *Package:* ${packageName}\n`
      details += `• *Size:* ${size} MB\n\n`
      details += `> ⏳ *Sending file, please wait...*`

      await client.sendMessage(m.chat, { 
        image: { url: icon }, 
        caption: details 
      }, { quoted: m })

      const apkBuffer = await getBuffer(downloadLink)

      await client.sendMessage(m.chat, {
        document: apkBuffer,
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        jpegThumbnail: await getBuffer(icon)
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply("❌ An error occurred while processing the download.")
    }
  }
}
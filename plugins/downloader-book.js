import fetch from "node-fetch"
import { getBuffer } from '../lib/message.js'

export default {
  command: ["ebook"],
  category: "downloader",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Usage:* .book [book name]")

    try {
      await m.reply(`> 📚 *Searching for book in library...*`)

      const res = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(text)}`)
      const json = await res.json()

      if (!json.results || json.results.length === 0) return m.reply("❌ Book not found.")

      const book = json.results[0]
      const title = book.title
      const author = book.authors.map(a => a.name).join(", ")
      const subjects = book.subjects.slice(0, 2).join(", ")
      const image = book.formats["image/jpeg"]
     
      const downloadUrl = book.formats["application/pdf"] || book.formats["application/epub+zip"] || book.formats["text/plain; charset=utf-8"]

      let details = `📖 *BOOK DETAILS*\n\n`
      details += `• *Title:* ${title}\n`
      details += `• *Author:* ${author}\n`
      details += `• *Subjects:* ${subjects}\n\n`
      details += `> ⏳ *Sending file, please wait...*`

      await client.sendMessage(m.chat, { 
        image: { url: image }, 
        caption: details 
      }, { quoted: m })

      const fileBuffer = await getBuffer(downloadUrl)
      const extension = downloadUrl.includes('.epub') ? 'epub' : 'pdf'

      await client.sendMessage(m.chat, {
        document: fileBuffer,
        mimetype: extension === 'epub' ? 'application/epub+zip' : 'application/pdf',
        fileName: `${title}.${extension}`
      }, { quoted: m })

    } catch (err) {
      m.reply("❌ The book does not have a direct download version available.")
    }
  }
}
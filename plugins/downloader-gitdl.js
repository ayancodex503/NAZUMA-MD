import fetch from "node-fetch"

export default {
  command: ["gitclone"],
  category: "downloader",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Usage:* .githubdl https://github.com/username/repo")
    
    if (!text.includes('github.com')) return m.reply("❌ Enter a valid GitHub link.")

    try {
      await m.reply(`> 📦 *Downloading repository...*`)

      const parts = text.replace(/\/$/, "").split('/')
      const repo = parts.pop().replace('.git', '')
      const user = parts.pop()
      
      const zipUrl = `https://api.github.com/repos/${user}/${repo}/zipball/main`

      await client.sendMessage(m.chat, {
        document: { url: zipUrl },
        mimetype: 'application/zip',
        fileName: `${repo}.zip`
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      m.reply("❌ Error downloading repository. Make sure it's public.")
    }
  }
}
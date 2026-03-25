import fetch from "node-fetch"

export default {
  command: ["dalle", "createimage", "genimg"],
  category: "ai",
  run: async (client, m, args) => {
    const text = args.join(" ")
    if (!text) return m.reply("✨ *Usage:* .dalle image description")

    try {
      await m.reply("> 🖼️ Generating image...")

      const apiUrl = `${api.url}/ai/flux?prompt=${encodeURIComponent(text)}`
      const res = await fetch(apiUrl)

      if (!res.ok) {
        return m.reply("❌ Error: API failed (Status " + res.status + ")")
      }

      const buffer = await res.buffer()

      await client.sendMessage(m.chat, {
        image: buffer,
        caption: `🎨 *IMAGE GENERATED*\n• Prompt: ${text}`
      }, { quoted: m })

    } catch (err) {
      console.error(err)
      m.reply("❌ Error generating image. The server probably exploded.")
    }
  }
}
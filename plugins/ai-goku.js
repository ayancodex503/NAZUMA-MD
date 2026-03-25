import axios from "axios"

const VOICE_ID = "67aed50c-5d4b-11ee-a861-00163e2ac61b"

async function gokuAI(text) {
  const messages = [
    {
      role: "system",
      content: `You are a comedian Goku. You are not the original Goku. You speak simply. You say silly or absurd things. Sometimes you talk about food or training. You always try to make people laugh. Don't use emojis or weird symbols. Super short answers.`
    },
    {
      role: "user",
      content: text
    }
  ]

  const params = {
    query: JSON.stringify(messages),
    link: "writecream.com"
  }

  const url = "https://8pe3nv3qha.execute-api.us-east-1.amazonaws.com/default/llm_chat?" + new URLSearchParams(params)
  const { data } = await axios.get(url)

  return String(data?.response_content || "").trim().slice(0, 150)
}

async function tts(text) {
  const payload = {
    raw_text: text,
    url: "https://filme.imyfone.com/text-to-speech/anime-text-to-speech/",
    product_id: "200054",
    convert_data: [{
      voice_id: VOICE_ID,
      speed: "1",
      volume: "50",
      text,
      pos: 0
    }]
  }

  const { data } = await axios.post(
    "https://voxbox-tts-api.imyfone.com/pc/v1/voice/tts",
    JSON.stringify(payload),
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0"
      }
    }
  )

  return data.data.convert_result[0].oss_url
}

export default {
  command: ["goku"],
  category: "ai",

  run: async (client, m, args) => {
    let text = args.join(" ")

    if (!text && m.quoted) {
      text = m.quoted.text || m.quoted.caption || m.quoted.body || ""
    }

    if (!text) return m.reply("Ask comedian Goku something.")

    try {
      await client.sendMessage(m.chat, { text: "Goku is thinking..." }, { quoted: m })

      const reply = await gokuAI(text)

      if (!reply) return m.reply("Goku got distracted thinking about food.")

      const audio = await tts(reply)

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audio },
          mimetype: "audio/mp4",
          ptt: false
        },
        { quoted: m }
      )

    } catch (e) {
      console.log(e)
      m.reply("Goku tried to think but ended up eating.")
    }
  }
}
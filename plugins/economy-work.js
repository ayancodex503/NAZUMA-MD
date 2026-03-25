export default {
  command: ['w', 'work'],
  category: 'rpg',

  run: async (client, m) => {
    const chat = global.db.data.chats[m.chat];
    const user = chat.users[m.sender];
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net';
    const currency = global.db.data.settings[botId].currency;

    if (chat.adminonly || !chat.rpg)
      return m.reply(`✎ These commands are disabled in this group.`)

    if (!user.workCooldown) user.workCooldown = 0;
    const remainingTime = user.workCooldown - Date.now();

    if (remainingTime > 0) {
      return m.reply(`You must wait *${msToTime(remainingTime)}* to work again.`);
    }

    const reward = Math.floor(Math.random() * 5000);
    user.workCooldown = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.coins += reward;

    await client.sendMessage(m.chat, {
      text: `❀ ${pickRandom(work)} *¥${reward.toLocaleString()} ${currency}*.`,
    }, { quoted: m });
  }
};

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);

  const min = minutes < 10 ? '0' + minutes : minutes;
  const sec = seconds < 10 ? '0' + seconds : seconds;

  return min === '00'
    ? `${sec} second${sec > 1 ? 's' : ''}`
    : `${min} minute${min > 1 ? 's' : ''}, ${sec} second${sec > 1 ? 's' : ''}`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const work = [
  "You work as a strawberry picker and earn",
  "You are an assistant in a pottery workshop and earn",
  "You design websites and earn",
  "You are a wedding photographer and receive",
  "You work in a pet store and earn",
  "You are an audiobook narrator and earn",
  "You help out in the art department and earn",
  "You work as a gardener in a park and receive",
  "You are a DJ at parties and earn",
  "You painted a mural in a café and they gave you",
  "You work as an interior designer and earn",
  "You are a tourist bus driver and earn",
  "You prepare sushi in a restaurant and earn",
  "You work as a research assistant and receive",
  "You are a content marketing specialist and earn",
  "You work on an organic farm and earn",
  "You are a dancer in a show and earn",
  "You organize art fairs and receive",
  "You are a freelance writer and earn",
  "You did graphic design for a campaign and got paid",
  "You work as an auto mechanic and earn",
  "You are a surf instructor and receive",
  "You clean houses as a cleaning service and earn",
  "You are a sound technician at concerts and earn",
  "You work as an app developer and earn",
  "You are a croupier in a casino and receive",
  "You work as a hair stylist and earn",
  "You are an art restorer and earn",
  "You work in a bookstore and earn",
  "You are a mountain guide and receive",
  "You run a travel blog and earn",
  "You did a crowdfunding campaign and earned",
  "You work as a social worker and earn",
  "You are a truck driver and receive",
  "You work on a rescue team and earn",
  "You are a business consultant and earn",
  "You do wine tastings and earn",
  "You work as a barista in a café and receive",
  "You are a pet trainer and earn",
  "You made a documentary for an NGO and received",
  "You are a drone operator and earn",
  "You work in a film production company and earn",
  "You are a market researcher and earn",
  "You work as a food delivery driver and receive",
  "You are an acupuncturist and earn",
  "You did jewelry design and earned",
  "You work as a customer service specialist and earn",
  "You are a museum curator and receive",
  "You work in a rehabilitation center and earn",
  "You are a helicopter pilot and earn",
  "You did an awareness campaign and they gave you",
  "You work in an auto repair shop and earn",
  "You are a sports event organizer and receive",
  "You develop an educational app and earn",
  "You are a network technician and earn",
  "You work as a production assistant in theater and earn",
  "You are a children's book illustrator and receive",
  "You work in a yoga center and earn",
  "You are a personal chef and earn",
  "You made a photo calendar and received",
  "You are a health and wellness promoter and earn",
  "You work as an interior decorator and receive",
  "You are a floral arranger and earn",
  "You organize a music festival and earn",
  "You are an investigative journalist and earn",
  "You work as a technical assistant in a recording studio and receive",
  "You are a bicycle mechanic and earn",
  "You made a viral video and earned",
  "You work as a social science researcher and earn",
  "You are a conference organizer and receive",
  "You draw caricatures at events and earn",
  "You are a public relations officer and earn",
  "You work as a life coach and earn",
  "You are an educator in a cultural center and receive",
  "You are a director of photography and earn",
  "You work in an animal shelter and earn",
  "You are a guide for themed lunches and dinners and earn",
  "You did a community art project and received",
  "You are a document translator and earn",
  "You work as a personal assistant to an executive and earn",
  "You are a sustainability specialist and receive",
  "You do a radio program and earn",
  "You work as an art appraiser and earn",
  "You are a social media content creator and earn",
  "You did a crafts workshop and received"
];
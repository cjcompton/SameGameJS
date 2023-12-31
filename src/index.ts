// import the necessary discord.js classes
import { Partials, Client, Events, GatewayIntentBits, GuildMember, Message } from 'discord.js'
import { registerCommands } from './register-commands';
import { commands } from './commands';
import { config } from './config';
// import { fetchText } from './requests/fetchText';

const mode = JSON.parse(config.DEV_MODE) ? 'dev' : 'prod'
// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.ThreadMember],
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  mode === 'dev' ? console.log('Running in dev mode.') : console.log('Running in prod mode.')
});

registerCommands({ guildId: config.GUILD_ID })

client.on("guildCreate", async (guild) => {
  await registerCommands({ guildId: guild.id });
  // TODO: send setup instructions
});

async function isValidThreadMessage(message: Message) { // self create thread and send "random" message
  if (!client.user) return
  if (message.channel.isThread()) {
    const isThreadStarterMe = message.channel.ownerId === client.user?.id
    if (!isThreadStarterMe) return
    const messages = await message.channel.messages.fetch()
    const secondToLast = messages.last(2)[0]
    const secondToLastContent = secondToLast.content
    if (!secondToLast) return
    if (message.content.toLowerCase() !== 'random') return
    const isSenderMsgMe = secondToLast.author.id === client.user?.id
    if (!isSenderMsgMe) return
    return secondToLastContent
  }
  // if (!client.user) return
  // if (!message.mentions.has(client.user)) return
  // if (message.content.toLowerCase() !== 'random') return
  // if (!message.reference) return
  // const repliedMsgId = message.reference.messageId
  // if (!repliedMsgId) return
  // const repliedMsg = await message.channel.messages.fetch(repliedMsgId)
  // const attachment = repliedMsg.attachments.first()?.url
  // console.log("🚀 ~ file: index.ts:44 ~ validMessage ~ attachment:", attachment)
  // if (!attachment) return
  // const isSenderMsgMe = repliedMsg.author.id === client.user?.id
  // if (!isSenderMsgMe) return
  // return attachment
}

const replies = [
  { reply: "Y'all should play", punctuation: '.' },
  { reply: "I recommend", punctuation: '.' },
  { reply: "The clear answer is", punctuation: '!' },
  { reply: "Simon says play", punctuation: '.' },
  { reply: "Who's down for some", punctuation: '?' },
  { reply: "Play", punctuation: '!' },
  { reply: "Oh yeah. It's", punctuation: 'time!' },
  { reply: "I'm thinking", punctuation: '.' },
  { reply: "", punctuation: ' would hit the spot right now.' },
]

client.on('messageCreate', async message => { // TODO: it might be too slow to check every single message
  const validResponse = await isValidThreadMessage(message)
  if (!validResponse) return
  const gamesList = validResponse.split('\n')
  const randomGame = gamesList[Math.floor(Math.random() * gamesList.length)]
  const randomReply = replies[Math.floor(Math.random() * replies.length)]
  message.reply({ content: `${randomReply.reply} ${randomGame.slice(2).trim()}${randomReply.punctuation}` })
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  // DEV
  if (JSON.parse(config.DEV_MODE)) {
    if (interaction.user.id != '175852481488617472') {
      await interaction.reply({ content: "This bot is currently in dev mode. Only Noah can execute commands.", ephemeral: true })
      return
    }
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

// Log in to Discord with your client's token
client.login(config.DISCORD_TOKEN);
// console.log(client.users.fetch)
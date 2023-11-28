// import the necessary discord.js classes
import { Client, Events, GatewayIntentBits, GuildMember } from 'discord.js'
import { registerCommands } from './register-commands';
import { commands } from './commands';
import { config } from './config';

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, 'GuildMembers'] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

registerCommands({ guildId: config.GUILD_ID })

client.on("guildCreate", async (guild) => {
  await registerCommands({ guildId: guild.id });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  // DEV
  if (config.DEV_MODE) {
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
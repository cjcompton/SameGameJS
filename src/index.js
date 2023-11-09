require("dotenv").config();

const {Client, GatewayIntentBits} = require ('discord.js');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.on('ready', (c) => {
	console.log(`✅ ${c.user.tag} is online.`);
});

client.on('messageCreate', (message) => {
	const contents = message.content.toLowerCase();
	
	if(message.author.bot) {
		return;
	}

	if(contents === 'hello') {
		message.reply('Hi there!');
	}
});

// these interactions are good because you can pull user information from it when they enter a / command
client.on('interactionCreate', (interaction) => {
	if(!interaction.isChatInputCommand()) return;
	console.log(interaction);
	console.log(interaction.commandName);

	if(interaction.commandName === 'hey') {
		interaction.reply('Hey!')
	}

	if(interaction.commandName === 'ping') {
		interaction.reply('Pong!')
	}
});

client.login(process.env.API_KEY);
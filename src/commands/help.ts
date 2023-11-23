import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("How to use this bot.");

export async function execute(interaction: CommandInteraction) {
  const reply = "# How To Use:\n1. Link Steam to Discord ([Guide](https://support.discord.com/hc/en-us/articles/8063233404823-Connections-Linked-Roles-Community-Members#h_01GK285ENTCX37J9PYCM1ADXCH)).\n2. Use the `/auth` command.\n3. Use the `/samegame` command."
  return interaction.reply({ content: reply, ephemeral: true });
}

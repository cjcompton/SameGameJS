import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("How to use this bot.");

export async function execute(interaction: CommandInteraction) {
  const reply = "# [Guide](https://sharedsteamgames.com?guide=true)"
  return interaction.reply({ content: reply, ephemeral: true });
}

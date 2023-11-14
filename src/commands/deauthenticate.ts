import axios from "axios";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "src/config";

export const data = new SlashCommandBuilder()
  .setName("deauth")
  .setDescription("Stop SameGame from being able to see your connected accounts")



export async function execute(interaction: CommandInteraction) {
  const userid = interaction.user.id
  console.log('deauthorizing' + interaction.user.id)
  const link = await axios.get(`${config.SERVER_IP}/deauth?userId=${userid}`)
  console.log(link)
  return interaction.reply({ content: link.data, ephemeral: true });
  // return interaction.reply("link/to/auth/server");
}

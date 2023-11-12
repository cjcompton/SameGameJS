import axios from "axios";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("deauth")
  .setDescription("Stop SameGame from being able to see your connected accounts")



export async function execute(interaction: CommandInteraction) {
  const userid = interaction.user.id
  console.log('deauthorizing' + interaction.user.id)
  const isUserAlreadyAuth = await axios.get(`http://localhost:3000/checkauth?userId=${userid}`)
  if (!isUserAlreadyAuth.data) {
    return interaction.reply("You haven't authenticated!")
  }
  const link = await axios.get(`http://localhost:3000/deauth?userId=${userid}`)
  console.log(link)
  return interaction.reply({ content: link.data, ephemeral: true });
  // return interaction.reply("link/to/auth/server");
}

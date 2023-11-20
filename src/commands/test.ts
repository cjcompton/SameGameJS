import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("interact")
  .setDescription("logs interaction object")
  .addUserOption(option =>
    option
      .setName('1')
      .setDescription('User 1')
      .setRequired(true)
  )
  .addUserOption(option =>
    option
      .setName('2')
      .setDescription('User 2')
      .setRequired(true)
  )
  .addUserOption(option =>
    option
      .setName('3')
      .setDescription('User 3')
      .setRequired(false)
  )

export async function execute(interaction: CommandInteraction) {
  const options = (interaction.options)
  console.log(options)
  // console.log(options.client) // bot info
  // console.log(options.data) // raw user data
  // console.log(options.resolved) // more raw user data?
  const user1 = interaction.options.getUser('1')
  const user2 = interaction.options.getUser('2')
  const user3 = interaction.options.getUser('3') // optional users will return null
  console.log(user3)
  const reply = `
${user1}'s Discord id: ${user1?.id}
${user2}'s Discord id: ${user2?.id}
${user3}'s Discord id: ${user3?.id}
`
  return interaction.reply(reply)

}
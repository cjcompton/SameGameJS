import { ActionRowBuilder, CommandInteraction, ComponentType, MessageComponentType, ModalActionRowComponentBuilder, SlashCommandBuilder, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";
import { checkAuth } from "../requests/checkAuth";

export const data = new SlashCommandBuilder()
  .setName("samegame")
  .setDescription("Searches authorized mentioned users' Steam libraries for shared multiplayer games.")

export async function execute(interaction: CommandInteraction) {
  // get users
  // check auth
  // check games public
  const userSelect = new UserSelectMenuBuilder()
    .setCustomId('users')
    .setPlaceholder('Select multiple users.')
    .setMinValues(2)
    .setMaxValues(5);

  const row1 = new ActionRowBuilder<UserSelectMenuBuilder>()
    .addComponents(userSelect)

  const response = await interaction.reply({
    content: 'Select users:',
    components: [row1],
  });
  const collectorFilter = (i: any) => i.user.id === interaction.user.id;

  try {
    const confirmation: UserSelectMenuInteraction = await response.awaitMessageComponent<ComponentType.UserSelect>({ filter: collectorFilter, time: 60000 });
    const userIds = Array.from(confirmation.users.keys())

    // check auth
    try {
      const authResponse = await checkAuth(userIds)
      const unauthNames = authResponse.unauthenticatedUsers.map(user => '<@' + confirmation.users.get(user)?.id + '>')
      const authNames = authResponse.authenticatedUsers.map(user => '<@' + confirmation.users.get(user)?.id + '>')
      const unauthReply = `Unable to search unauthenticated account(s): ${unauthNames.toString()}\nType "/auth" to authenticate.`
      if (authResponse.authenticatedUsers.length < 2) {
        await confirmation.update({ content: "Not enough authenticated users." + '\n' + unauthReply, components: [] })
      } else {
        // check steam games

        // const reply = `Multiplayer games ${authNames.toString()} all have:\n`

      }

      // const reply = 'Authenticated users: ' + JSON.stringify(authResponse.authenticatedUsers) + '\n' + 'Unauthenticated users: ' + JSON.stringify(authResponse.unauthenticatedUsers)
      // await confirmation.update({ content: reply, components: [] })
    } catch (e) {
      await confirmation.update({ content: 'Internal server error. Please try again later.', components: [] })
    }

  } catch (e) {
    console.error(e)
    await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
  }
}

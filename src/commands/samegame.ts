import { ActionRowBuilder, CommandInteraction, ComponentType, MessageComponentType, ModalActionRowComponentBuilder, SlashCommandBuilder, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";
import { checkAuth } from "../requests/checkAuth";
import { getSharedGames } from "../requests/getSharedGames";

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

    try {
      // if checkAuth fails you have big problems to worry about
      const authResponse = await checkAuth(userIds)
      const unauthNames = authResponse.unauthenticatedUserIds.map(user => '<@' + confirmation.users.get(user)?.id + '>')
      const authNames = authResponse.authenticatedUserIds.map(user => '<@' + confirmation.users.get(user)?.id + '>')
      let unauthReply = `Unable to search unauthenticated account(s): ${unauthNames.join(', ')}\nType "/auth" to authenticate.`
      let authReply = `Multiplayer games ${authNames.join(', ')} share:`

      if (authResponse.authenticatedUserIds.length < 2) {
        await confirmation.update({ content: "Not enough authenticated users." + '\n' + unauthReply, components: [] })
        return
      }

      try {
        // compare games
        const sharedGames: SharedGamesResponse = await getSharedGames(authResponse.authenticatedUserIds)
        const readableSharedGames = '* ' + sharedGames.games.map(obj => obj.name).join('\n* ')
        const unlinkedNames = sharedGames.unlinkedIds.map(id => '<@' + id + '>')

        if (unlinkedNames.length > 0) {
          const reply = `\nUsers that still need to link Steam to Discord: ${unlinkedNames.join(', ')}`
          unauthReply += reply
        }

        if (unauthNames.length > 0) {
          await confirmation.update({ content: unauthReply + '\n' + authReply + '\n' + readableSharedGames + '\n', components: [] })
        } else {
          await confirmation.update({ content: authReply + '\n' + readableSharedGames, components: [] })
        }

      } catch (e) { // getSharedGames catch
        console.error(e)
        await confirmation.update({ content: 'Internal server error. Please try again later.', components: [] })
      }
    } catch (e) { // checkAuth catch
      console.error('database down', e)
      await confirmation.update({ content: 'Internal server error. Please try again later.', components: [] })
    }

  } catch (e) { // awaitMessageComponent catch
    console.error(e)
    await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling', components: [] });
  }
}

interface GameObj {
  appid: number
  name: string
  ct: number
  multiplayer?: boolean
}
type UnlinkedIds = string[]

interface SharedGamesResponse {
  games: GameObj[]
  unlinkedIds: UnlinkedIds
}
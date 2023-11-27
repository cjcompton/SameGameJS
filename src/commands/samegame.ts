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
      if (!authResponse) {
        await confirmation.update({ content: 'Internal server error: DB1. Please report this error and try again later.', components: [] })
        return
      }
      const unauthNames = authResponse.unauthenticatedUserIds.map(userId => '<@' + confirmation.users.get(userId)?.id + '>')
      const authNames = authResponse.authenticatedUserIds.map(userId => '<@' + confirmation.users.get(userId)?.id + '>')
      const unlinkedSteamNames = authResponse.unlinkedSteamUserIds.map(userId => '<@' + confirmation.users.get(userId)?.id + '>')

      let authReply = `Multiplayer games ${authNames.join(', ')} share:`
      let unauthReply = ''
      if (unauthNames.length > 0) {
        unauthReply = `\nUnable to search user(s): ${unauthNames.join(', ')}\nType "/auth" to authenticate.`
      }

      if (unlinkedSteamNames.length > 0) {
        unauthReply += `\nUnable to search user(s): ${unlinkedSteamNames.join(', ')} because their Steam and Discord accounts are unlinked ([Guide](https://sharedsteamgames.com?guide=true)).`
      }

      if (authNames.length < 2) {
        await confirmation.update({ content: "Not enough authenticated users." + unauthReply, components: [] })
        return
      }

      try {
        // compare games
        const sharedGames: SharedGamesResponse = await getSharedGames(authResponse.authenticatedUserIds)
        const readableSharedGames = '* ' + sharedGames.games.map(obj => obj.name).join('\n* ')

        if (sharedGames.privateSteamGamesDiscordIds.length > 0) {
          const unlinkedSteamDiscordNames = sharedGames.privateSteamGamesDiscordIds.map(userId => '<@' + userId + '>')
          unauthReply += `\nUnable to search users ${unlinkedSteamDiscordNames.join(', ')} because their Steam games are private ([Guide](https://sharedsteamgames.com?guide=true)).`
        }

        if (sharedGames.games.length < 1) {
          await confirmation.update({ content: unauthReply + '\n' + 'No matching multiplayer games.', components: [] })
        } else if (unauthNames.length > 0) {
          await confirmation.update({ content: unauthReply + '\n' + authReply + '\n' + readableSharedGames + '\n', components: [] })
        } else {
          await confirmation.update({ content: authReply + '\n' + readableSharedGames, components: [] })
        }

      } catch (e) { // getSharedGames catch
        console.error(e)
        await confirmation.update({ content: 'Internal server error: SG. Please report this error and try again later.', components: [] })
      }
    } catch (e) { // checkAuth catch
      console.error('database down', e)
      await confirmation.update({ content: 'Internal server error: DB2. Please try again later.', components: [] })
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
  attemptedLinkedDiscordIds: UnlinkedIds
  privateSteamGamesDiscordIds: UnlinkedIds
  unauthenticatedDiscordIds: UnlinkedIds
}
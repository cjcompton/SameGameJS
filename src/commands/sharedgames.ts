import { ActionRowBuilder, AttachmentBuilder, CommandInteraction, ComponentType, Message, MessageComponentType, ModalActionRowComponentBuilder, SlashCommandBuilder, Snowflake, TextChannel, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";
import { checkAuth } from "../requests/checkAuth";
import { getSharedGames } from "../requests/getSharedGames";
import { gamesResponse } from "../tests/gamesResponse";

export const data = new SlashCommandBuilder()
  .setName("sharedgames")
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

    // const testObj = gamesResponse.join(',\n')
    // const sharedGamesAttachment = new AttachmentBuilder(Buffer.from(testObj), { name: 'shared_games.txt' })
    // await confirmation.update({
    //   content: 'games @Users share',
    //   components: [],
    //   files: [sharedGamesAttachment]
    // })
    // return

    try {
      // // if checkAuth fails you have big problems to worry about
      const authResponse = await checkAuth(userIds)
      if (!authResponse) {
        await confirmation.update({ content: 'Internal server error: DB1. Please report this error and try again later.', components: [] })
        return
      }
      const pingableUnauthNames = authResponse.unauthenticatedUserIds.map(userId => '<@' + confirmation.users.get(userId)?.id + '>')
      const pingableAuthNames = authResponse.authenticatedUserIds.map(userId => '<@' + confirmation.users.get(userId)?.id + '>')
      const readableAuthNames = authResponse.authenticatedUserIds.map(userId => confirmation.users.get(userId)?.displayName)
      const pingableUnlinkedSteamNames = authResponse.unlinkedSteamUserIds.map(userId => '<@' + confirmation.users.get(userId)?.id + '>')

      let authReply = `Multiplayer games ${pingableAuthNames.join(', ')} share:`
      let unauthReply = ''
      if (pingableUnauthNames.length > 0) {
        unauthReply = `\nUnable to search user(s): ${pingableUnauthNames.join(', ')}\nType "/auth" to authenticate.`
      }

      if (pingableUnlinkedSteamNames.length > 0) {
        unauthReply += `\nUnable to search user(s): ${pingableUnlinkedSteamNames.join(', ')} because their Steam and Discord accounts are unlinked ([Guide](https://sharedsteamgames.com?guide=true)).`
      }

      if (pingableAuthNames.length < 2) {
        await confirmation.update({ content: "Not enough authenticated users." + unauthReply, components: [] })
        return
      }

      try {
        // compare games
        const sharedGames: SharedGamesResponse = await getSharedGames(authResponse.authenticatedUserIds)
        const readableSharedGames = '* ' + sharedGames.games.map(obj => obj).join('\n* ')

        if (sharedGames.privateSteamGamesDiscordIds.length > 0) {
          const unlinkedSteamDiscordNames = sharedGames.privateSteamGamesDiscordIds.map(userId => '<@' + userId + '>')
          unauthReply += `\nUnable to search users ${unlinkedSteamDiscordNames.join(', ')} because their Steam games are private ([Guide](https://sharedsteamgames.com?guide=true)).`
        }

        if (sharedGames.games.length < 1) {
          await confirmation.update({ content: unauthReply + '\n' + 'No matching multiplayer games.', components: [] })
          return
        } else if (pingableUnauthNames.length > 0) {
          const message = await confirmation.update({
            content: authReply + unauthReply,
            components: [],
            fetchReply: true,
          })
          const thread = await message.startThread({
            name: `Shared Steam Games for ${readableAuthNames.join(', ')}`,
            autoArchiveDuration: 1440,
            reason: 'Shared Steam games request',
          });
          await thread.send(readableSharedGames)
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
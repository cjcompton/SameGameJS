import { UserSelectMenuInteraction } from "discord.js";
import { checkAuth } from "../requests/checkAuth";
import { getSharedGames } from "../requests/getSharedGames";
import { ActionFunctionProps, HeartBeat } from "./ActionClass";

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

export async function sameGameAction({ confirmation }: ActionFunctionProps<UserSelectMenuInteraction>): Promise<HeartBeat> {
  try {
    const userIds = Array.from(confirmation.users.keys())

    try {
      // if checkAuth fails you have big problems to worry about
      const authResponse = await checkAuth(userIds)
      if (!authResponse) {
        // await confirmation.update({ content: 'Internal server error: DB1. Please report this error and try again later.', components: [] })
        return { content: 'Internal server error: DB1. Please report this error and try again later.', components: [], alive: false }
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
        // await confirmation.update({ content: "Not enough authenticated users." + unauthReply, components: [] })
        return { content: "Not enough authenticated users.", components: [], alive: true }
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
          // await confirmation.update({ content: unauthReply + '\n' + 'No matching multiplayer games.', components: [] })
          return { content: unauthReply + '\n' + 'No matching multiplayer games.', components: [], alive: true }
        } else if (unauthNames.length > 0) {
          // await confirmation.update({ content: unauthReply + '\n' + authReply + '\n' + readableSharedGames + '\n', components: [] })
          return { content: unauthReply + '\n' + authReply + '\n' + readableSharedGames + '\n', components: [], alive: true }
        } else {
          // await confirmation.update({ content: authReply + '\n' + readableSharedGames, components: [] })
          return { content: authReply + '\n' + readableSharedGames, components: [], alive: true }
        }

      } catch (e) { // getSharedGames catch
        console.error("🚀 ~ file: sameGameAction.ts:70 ~ sameGameAction ~ e:", e)
        // await confirmation.update({ content: 'Internal server error: SG. Please report this error and try again later.', components: [] })
        return { content: 'Internal server error: SG. Please report this error and try again later.', components: [], alive: false }
      }
    } catch (e) { // checkAuth catch
      console.error("🚀 ~ file: sameGameAction.ts:74 ~ sameGameAction ~ e:", e)
      // await confirmation.update({ content: 'Internal server error: DB2. Please try again later.', components: [] })
      return { content: 'Internal server error: DB2. Please try again later.', components: [], alive: true }
    }

  } catch (e) { // awaitMessageComponent catch
    console.error("🚀 ~ file: sameGameAction.ts:79 ~ sameGameAction ~ e:", e)
    // await interaction.editReply({ content: 'Interaction not received for 1 minute, cancelling', components: [] });
    return { content: 'Interaction not received for 1 minute, cancelling', components: [], alive: false }
  }
  return { content: 'Interaction not received for 1 minute, cancelling', components: [], alive: false }
}

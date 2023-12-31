import axios from "axios";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { config } from "../config";
import { AuthResponse } from "src/requests/checkAuth";

export const data = new SlashCommandBuilder()
  .setName("auth")
  .setDescription("Allow SameGame to read connected accounts")



export async function execute(interaction: CommandInteraction) {
  // user types /auth
  // get user's id, guild id, and current channel id
  // post that info to auth server, auth server saves to db for 1? day
  // samegame bot returns link to auth page with ?id=userid
  // id is saved in localStorage
  // state is generated and appended to discord oauth2 link
  // user is immediately redirected to discord oauth2 link
  // user authenticates app
  // user is redirected to auth redirect page with state & access code
  // auth server validates state
  // access code is exchanged with discord for access token
  // access token & refresh token are stored in db for later use
  // auth server checks if id in localStorage exists & exists in db & matches access token
  // if yes, auth server creates button with deeplink to server+channel via:
  // discord://discordapp.com/channels/SERVERID/CHANNELID
  // discord://discord.com/channels/1171574485116264488/1172318329306873926 (dev channel)
  // if no, auth server just displays a "done! close this window." page
  // user is now authenticated
  const userid = interaction.user.id
  const channelId = interaction.channelId
  const guildId = interaction.guildId
  const isUserAlreadyAuth = await axios.post<AuthResponse>(`${config.SERVER_IP}/checkauth`, {
    userIds: [userid]
  })

  // if user exists but is unauthenticated
  if (isUserAlreadyAuth.data?.unauthenticatedUserIds.length > 0) {
    const link = await axios.get(`${process.env.SERVER_IP}/bot?userId=${userid}&guildId=${guildId}&channelId=${channelId}`)
    return interaction.reply({ content: link.data, ephemeral: true });
  }

  // if user exists but steam is unlinked
  if (isUserAlreadyAuth.data?.unlinkedSteamUserIds.length > 0) {
    let reply = "You still need to link your Steam account to Discord ([Guide](https://sharedsteamgames.com/?guide=true))."
    reply += `\n Then use this link: ${process.env.SERVER_IP}/bot?userId=${userid}&guildId=${guildId}&channelId=${channelId}`
    return interaction.reply({ content: reply, ephemeral: true })
  }

  // if user is already auth'd and linked
  if (isUserAlreadyAuth.data?.authenticatedUserIds.length > 0) {
    return interaction.reply({ content: "You're already authenticated!", ephemeral: true })
  }

  // if user doesn't exist yet
  const link = await axios.get(`${process.env.SERVER_IP}/bot?userId=${userid}&guildId=${guildId}&channelId=${channelId}`)
  return interaction.reply({ content: link.data, ephemeral: true });
}

import { CommandInteraction, SlashCommandBuilder } from "discord.js";

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
  // if no, auth server just displays a "done! close this window." page
  // user is now authenticated
  return interaction.reply("link/to/auth/server");
}

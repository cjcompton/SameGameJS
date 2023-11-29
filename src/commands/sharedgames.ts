import { ActionRowBuilder, CacheType, CommandInteraction, ComponentType, InteractionResponse, MessageComponentType, MessageEditOptions, ModalActionRowComponentBuilder, SlashCommandBuilder, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";
import ActionClass from "../actions/ActionClass";
// import { stuff } from "src/actions";
import { sharedGamesAction } from "../actions/sharedGamesAction";

export const data = new SlashCommandBuilder()
  .setName("sharedgames")
  .setDescription("Searches authorized mentioned users' Steam libraries for shared multiplayer games.")

// get users
// check auth
// check games public
export async function execute(interaction: CommandInteraction) {
  // build row menu
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


  const sharedGamesActionClass = new ActionClass<ComponentType.UserSelect, UserSelectMenuInteraction, UserSelectMenuBuilder>(
    sharedGamesAction,
    interaction,
    response,
    10000,
    [row1]
  )

  let lastContent: string | null | undefined = ''
  try {
    let heartBeat = await sharedGamesActionClass.keepAlive()
    lastContent = heartBeat.content
    while (heartBeat.alive) {
      lastContent = heartBeat.content
      console.log('content', heartBeat.content)
      heartBeat = await sharedGamesActionClass.keepAlive()
    }

    await interaction.editReply({
      content: 'Input inactive 🚫\n' + heartBeat.content,
      components: []
    });

  } catch (error) {
    console.error(error);
    await interaction.editReply({
      content: 'Input inactive 🚫\n (Input timed out)' + lastContent,
      components: []
    });
  }
}
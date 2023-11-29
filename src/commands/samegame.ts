import { ActionRowBuilder, CacheType, CommandInteraction, ComponentType, InteractionResponse, MessageComponentType, MessageEditOptions, ModalActionRowComponentBuilder, SlashCommandBuilder, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";
import ActionClass from "../actions/ActionClass";
// import { stuff } from "src/actions";
import { sameGameAction } from "../actions/sameGameAction";

export const data = new SlashCommandBuilder()
  .setName("samegame")
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


  const sameGameActionClass = new ActionClass<
    ComponentType.UserSelect,
    UserSelectMenuInteraction,
    UserSelectMenuBuilder
  >(
    sameGameAction,
    interaction,
    response,
    10000,
    row1
  )

  let lastContent: string | null | undefined = ''
  try {
    let heartBeat = await sameGameActionClass.keepAlive()
    lastContent = heartBeat.content
    while (heartBeat.alive) {
      lastContent = heartBeat.content
      console.log('content', heartBeat.content)
      heartBeat = await sameGameActionClass.keepAlive()
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
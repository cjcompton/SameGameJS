import { ActionRowBuilder, CommandInteraction, ComponentType, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuInteraction, StringSelectMenuOptionBuilder, UserSelectMenuBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("suggestgames")
  .setDescription("Suggests a game.");

export async function execute(interaction: CommandInteraction) {
  const select = new StringSelectMenuBuilder()
    .setCustomId('starter')
    .setPlaceholder('Make a selection!')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Bulbasaur')
        .setEmoji('🌱')
        .setDescription('The dual-type Grass/Poison Seed Pokémon.')
        .setValue('bulbasaur'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Charmander')
        .setEmoji('🔥')
        .setDescription('The Fire-type Lizard Pokémon.')
        .setValue('charmander'),
      new StringSelectMenuOptionBuilder()
        .setLabel('Squirtle')
        .setEmoji('💧')
        .setDescription('The Water-type Tiny Turtle Pokémon.')
        .setValue('squirtle'),
    );

  const userSelect = new UserSelectMenuBuilder()
    .setCustomId('users')
    .setPlaceholder('Select multiple users.')
    .setMinValues(2)
    .setMaxValues(5);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(select)
  const row2 = new ActionRowBuilder<UserSelectMenuBuilder>()
    .addComponents(userSelect)

  const responseToClient = await interaction.reply({ // TODO: what kind of response from client is this with >1 components?
    content: 'Choose your starter!',
    components: [row, row2]
  });

  try {
    const responseFromClient: StringSelectMenuInteraction = await responseToClient.awaitMessageComponent<ComponentType.StringSelect>({
      filter: (i: any) => i.user.id === interaction.user.id,
      time: 10000
    });

    await responseFromClient.update({ content: `You chose ${responseFromClient.values[0]}!`, components: [] });
  } catch (error) {
    console.error(error);
    await interaction.editReply({ content: 'There was an error while executing this command!', components: [] });
  }

}



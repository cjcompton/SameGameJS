import { ActionRowBuilder, CommandInteraction, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuOptionBuilder, UserSelectMenuBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("suggest")
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

  const row = new ActionRowBuilder<StringSelectMenuBuilder | UserSelectMenuBuilder>()
    .addComponents(select)
  const row2 = new ActionRowBuilder<UserSelectMenuBuilder>()
    .addComponents(userSelect)

  const response = await interaction.reply({
    content: 'Choose your starter!',
    components: [row, row2]
  });

  try {

  } catch (error) {
    console.error(error);
    await interaction.editReply({ content: 'There was an error while executing this command!', components: [] });
  }

}



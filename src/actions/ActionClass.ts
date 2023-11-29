import { ComponentType, ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, CacheType, CommandInteraction, ComponentBuilder, InteractionResponse, MappedComponentBuilderTypes, MessageEditOptions, StringSelectMenuBuilder, UserSelectMenuBuilder, UserSelectMenuInteraction, MessageComponentType, InteractionResponseType, AnySelectMenuInteraction, MappedInteractionTypes, CollectedInteraction, CommandInteractionOption, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder } from "discord.js"

export interface HeartBeat {
  content: MessageEditOptions["content"]
  components: MessageEditOptions["components"]
  alive: boolean
}

// confirmation type
type AllInteractionTypes<ComponentType extends MessageComponentType> = MappedInteractionTypes<boolean>[ComponentType]//CollectedInteraction | AnySelectMenuInteraction

export interface ActionFunctionProps<ActionFunctionInteractionType> {
  // confirmation: CollectedInteraction | AnySelectMenuInteraction
  confirmation: ActionFunctionInteractionType
}

// row builder type
type ActionFunctionType<ActionFunctionInteractionType> = {
  ({ confirmation }: ActionFunctionProps<ActionFunctionInteractionType>): Promise<HeartBeat>
}

export default class ActionClass<
  ComponentType extends MessageComponentType, // confirmation component type
  ActionFunctionInteractionType extends AllInteractionTypes<ComponentType>, // confirmation type
  ActionFunctionBuilderType extends MessageActionRowComponentBuilder //| ModalActionRowComponentBuilder // row builder type
> {
  actionFunction: ActionFunctionType<ActionFunctionInteractionType>
  interaction: CommandInteraction<CacheType>
  response: InteractionResponse
  timeOut: number
  rows: ActionRowBuilder<ActionFunctionBuilderType>[]

  constructor(
    actionFunction: ActionFunctionType<ActionFunctionInteractionType>,
    interaction: CommandInteraction<CacheType>,
    response: InteractionResponse,
    timeOut: number,
    rows: ActionRowBuilder<ActionFunctionBuilderType>[]
  ) {
    this.actionFunction = actionFunction
    this.interaction = interaction
    this.response = response
    this.timeOut = timeOut
    this.rows = rows
  }

  collectorFilter = (i: any) => i.user.id === this.interaction.user.id; // TODO: make this toggleable

  async keepAlive() {
    try {
      //@ts-ignore
      // trust me bro
      // make the first reply
      let confirmation: ActionFunctionInteractionType = await this.response.awaitMessageComponent<ComponentType>({
        filter: this.collectorFilter,
        time: this.timeOut
      });
      let heartBeat = await this.actionFunction({ confirmation })

      if (heartBeat.alive) {
        const { content, components } = heartBeat
        await confirmation.update({ content: 'Input active 🟢\n' + content, components: this.rows })
        heartBeat = await this.actionFunction({ confirmation })
      }
      return heartBeat
    } catch (e) {
      throw e
    }
  }
}

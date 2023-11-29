import { ComponentType, ActionRowBuilder, AnyComponentBuilder, ButtonBuilder, CacheType, CommandInteraction, ComponentBuilder, InteractionResponse, MappedComponentBuilderTypes, MessageEditOptions, StringSelectMenuBuilder, UserSelectMenuBuilder, UserSelectMenuInteraction, MessageComponentType, InteractionResponseType, AnySelectMenuInteraction, MappedInteractionTypes, CollectedInteraction, CommandInteractionOption, MessageActionRowComponentBuilder, ModalActionRowComponentBuilder } from "discord.js"

export interface HeartBeat {
  content: MessageEditOptions["content"]
  components: MessageEditOptions["components"]
  alive: boolean
}

type AllInteractionTypes = CollectedInteraction | AnySelectMenuInteraction

export interface ActionFunctionProps<ActionFunctionInteractionType> {
  // confirmation: CollectedInteraction | AnySelectMenuInteraction
  confirmation: ActionFunctionInteractionType
}

type ActionFunctionType<ActionFunctionInteractionType> = {
  ({ confirmation }: ActionFunctionProps<ActionFunctionInteractionType>): Promise<HeartBeat>
}

export default class ActionClass<
  ComponentType extends MessageComponentType,
  ActionFunctionInteractionType extends AllInteractionTypes,
  ActionFunctionBuilderType extends MessageActionRowComponentBuilder //| ModalActionRowComponentBuilder
> {
  response: InteractionResponse
  actionFunction: ActionFunctionType<ActionFunctionInteractionType>
  interaction: CommandInteraction<CacheType>
  timeOut: number
  row

  constructor(
    actionFunction: ActionFunctionType<ActionFunctionInteractionType>,
    interaction: CommandInteraction<CacheType>,
    response: InteractionResponse,
    timeOut: number,
    row: ActionRowBuilder<ActionFunctionBuilderType>
  ) {
    this.actionFunction = actionFunction
    this.interaction = interaction
    this.response = response
    this.timeOut = timeOut
    this.row = row
  }

  collectorFilter = (i: any) => i.user.id === this.interaction.user.id;

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
        await confirmation.update({ content: 'Input active 🟢\n' + content, components: [this.row] })
        heartBeat = await this.actionFunction({ confirmation })
      }
      return heartBeat
    } catch (e) {
      throw e
    }
  }
}

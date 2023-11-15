import axios from "axios"
import { config } from "../config"

export async function getSharedGames(userIds: string[]) {
  try {
    const sharedGames = await axios.post(`${config.SERVER_IP}/sharedgames`, {
      users: userIds
    })
    return sharedGames.data
  } catch (e) {
    throw e
  }
}
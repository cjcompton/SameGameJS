import axios from "axios"
import { config } from "../config"
// check auth
export async function checkAuth(userIds: string[]) { // TODO: refactor to POST userids
  interface Response {
    unauthenticatedUserIds: string[],
    authenticatedUserIds: string[]
    unlinkedSteamUserIds: string[]
  }
  try {
    const authUserResponse: Response = await axios.post(`${config.SERVER_IP}/checkauth`, {
      userIds: userIds
    })
    return authUserResponse
  } catch (e) {
    console.error(e)
    return false
  }
}
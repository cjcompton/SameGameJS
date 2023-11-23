import axios from "axios"
import { config } from "../config"
// check auth
export async function checkAuth(userIds: string[]) { // TODO: refactor to POST userids
  try {
    const authUserResponse: AuthResponse = await axios.post(`${config.SERVER_IP}/checkauth`, {
      userIds: userIds
    })
    return authUserResponse
  } catch (e) {
    console.error(e)
    return false
  }
}
export interface AuthResponse {
  unauthenticatedUserIds: string[],
  authenticatedUserIds: string[]
  unlinkedSteamUserIds: string[]
}
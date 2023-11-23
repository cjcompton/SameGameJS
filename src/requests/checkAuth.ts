import axios from "axios"
import { config } from "../config"
// check auth
export async function checkAuth(userIds: string[]) { // TODO: refactor to POST userids
  try {
    const authUserResponse = await axios.post<AuthResponse>(`${config.SERVER_IP}/checkauth`, {
      userIds: userIds
    })
    return authUserResponse.data
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
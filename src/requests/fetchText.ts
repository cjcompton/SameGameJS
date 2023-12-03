// import fetch from "node-fetch"
import axios from "axios";

export async function fetchText(fileUrl: string) {
  try {
    const response = await axios.get(fileUrl);

    // if there was an error send a message with the status
    if (!(response.status == 200)) {
      return `There was an error with fetching the file:\n${response.statusText}`
    }
    const text: string = await response.data;
    console.log("🚀 ~ file: fetchText.ts:12 ~ fetchText ~ text:", text)
    return text
  } catch (e) {
    throw e
  }
}

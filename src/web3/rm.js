import {utf8ToHex} from 'web3-utils'

export default async function rm(kernel, path) {
  await kernel.unlink(utf8ToHex(path))
}

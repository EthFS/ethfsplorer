import {basename} from 'path'
import {utf8ToHex} from 'web3-utils'

export default async function rm(kernel, path, setProgress, setProgressText) {
  setProgressText(`Deleting ${basename(path)}`)
  await kernel.unlink(utf8ToHex(path))
}

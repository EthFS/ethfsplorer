import * as Path from 'path'
import {utf8ToHex, hexToUtf8} from 'web3-utils'

export default async function rm(kernel, path, setProgress, setProgressText) {
  const {fileType, entries} = await kernel.stat(utf8ToHex(path))
  if (fileType != 2) {
    setProgressText(`Deleting file ${path}`)
    return await kernel.unlink(utf8ToHex(path))
  }
  for (let i = entries-1; i > 1; i--) {
    const name = hexToUtf8(await kernel.readkeyPath(utf8ToHex(path), i))
    await rm(kernel, Path.join(path, name), setProgress, setProgressText)
  }
  setProgressText(`Deleting folder ${path}`)
  await kernel.rmdir(utf8ToHex(path))
}

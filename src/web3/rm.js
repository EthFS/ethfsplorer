import * as Path from 'path'
import {toUtf8Bytes, toUtf8String} from '@ethersproject/strings'

export default async function rm(kernel, path, setProgress, setProgressText) {
  const {fileType, nEntries} = await kernel.lstat(toUtf8Bytes(path))
  if (fileType != 2) {
    setProgressText(`Deleting file ${path}`)
    const tx = await kernel.unlink(toUtf8Bytes(path))
    return await tx.wait()
  }
  for (let i = nEntries-1; i > 1; i--) {
    const name = toUtf8String(await kernel.readkeyPath(toUtf8Bytes(path), i))
    await rm(kernel, Path.join(path, name), setProgress, setProgressText)
  }
  setProgressText(`Deleting folder ${path}`)
  const tx = await kernel.rmdir(toUtf8Bytes(path))
  await tx.wait()
}

import {arrayify} from '@ethersproject/bytes'
import {toUtf8Bytes} from '@ethersproject/strings'

export default async function read(kernel, path) {
  path = toUtf8Bytes(path)
  const {fileType, size} = await kernel.stat(path)
  if (fileType == 2) throw 'EISDIR'
  const buf = new Uint8Array(Number(size))
  for (let i = 0; i < size;) {
    const len = Math.min(32768, size - i)
    const data = arrayify(await kernel.readPath(path, '0x', i, len))
    buf.set(data, i)
    i += data.length
    if (data.length < len) break
  }
  return buf
}

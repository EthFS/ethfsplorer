import {utf8ToHex, hexToUtf8} from 'web3-utils'

export default async function read(kernel, path) {
  path = utf8ToHex(path)
  const {fileType, size} = await kernel.stat(path)
  if (fileType == 2) throw 'EISDIR'
  const buf = Buffer.alloc(Number(size))
  for (let i = 0; i < size;) {
    const len = Math.min(65536, size - i)
    const data = await kernel.readPath(path, '0x', i, len)
    buf.fill(data.slice(2), i, len, 'hex')
    i += len
  }
  return buf
}

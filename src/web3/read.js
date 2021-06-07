import {toUtf8Bytes} from '@ethersproject/strings'

export default async function read(kernel, path) {
  path = toUtf8Bytes(path)
  const {fileType, size} = await kernel.stat(path)
  if (fileType == 2) throw 'EISDIR'
  const buf = Buffer.alloc(Number(size))
  for (let i = 0; i < size;) {
    const len = Math.min(65536, size - i)
    const data = await kernel.readPath(path, '0x', i, len)
    i += Buffer.from(data.slice(2), 'hex').copy(buf, i)
  }
  return buf
}

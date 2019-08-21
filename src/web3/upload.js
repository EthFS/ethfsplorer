import * as Path from 'path'
import errno from 'errno'
import {utf8ToHex} from 'web3-utils'
import constants from './constants'
import write from './write'
import {emit} from '../utils/events'

export default async function upload(
  kernel, path, files, setProgress, setProgressText,
) {
  for (let i = 0; i < files.length; i++) {
    const {name} = files[i]
    const path2 = Path.join(path, name)
    setProgress(100*(i+1) / files.length)
    setProgressText(`Reading ${name}`)
    const reader = new FileReader()
    reader.readAsArrayBuffer(files[i])
    await new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const buf = Buffer.from(reader.result)
          setProgressText(`Opening ${name}`)
          await kernel.open(utf8ToHex(path2), constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL)
          const fd = Number(await kernel.result())
          const [,e] = await write(kernel, fd, '0x', buf, buf.length, x => {
            setProgress(100 * x/buf.length)
            setProgressText(`Writing ${x} / ${buf.length} bytes`)
          })
          if (e) throw e
          setProgressText(`Closing ${name}`)
          await kernel.close(fd)
          resolve()
        } catch (e) {
          e = errno.code[e.reason]
          if (e) setError(e.description)
          reject(e)
        }
      }
    })
  }
  setProgress()
  emit('refresh-path', path)
}

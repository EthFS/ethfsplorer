import {basename, dirname} from 'path'
import errno from 'errno'
import {utf8ToHex} from 'web3-utils'
import constants from '../../web3/constants'
import write from '../../web3/write'
import {emit} from '../../utils/events'

export default async function(
  kernel, path, flags, text, setProgress, setProgressText, setError, onOk,
) {
  try {
    const buf = Buffer.from(text)
    setProgress(30)
    setProgressText(`Opening ${basename(path)}`)
    await kernel.open(utf8ToHex(path), constants.O_WRONLY | flags)
    const fd = Number(await kernel.result())
    const [,e] = await write(kernel, fd, '0x', buf, buf.length, x => {
      setProgress(30 + 40 * x/buf.length)
      setProgressText(`Writing ${x} / ${buf.length} bytes`)
    })
    if (e) throw e
    setProgress(100)
    setProgressText(`Closing ${basename(path)}`)
    await kernel.close(fd)
    onOk()
    emit('refresh-path', dirname(path))
  } catch (e) {
    e = errno.code[e.reason]
    if (e) setError(e.description)
  }
  setProgress()
}

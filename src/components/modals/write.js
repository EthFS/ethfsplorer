import {basename, dirname} from 'path'
import errno from 'errno'
import {utf8ToHex} from 'web3-utils'
import constants from '../../web3/constants'
import write from '../../web3/write'
import {emit} from '../../utils/events'

export default async function(
  kernel, path, flags, text, truncate,
  setProgress, setProgressText, setError, onOk,
) {
  try {
    const buf = Buffer.from(text)
    setProgress(100)
    setProgressText(`Opening ${basename(path)}`)
    await kernel.open(utf8ToHex(path), constants.O_WRONLY | flags)
    const fd = Number(await kernel.result())
    if (truncate >= 0) {
      setProgressText(`Truncating to ${truncate} bytes`)
      await kernel.truncate(fd, '0x', truncate)
    }
    const [,e] = await write(kernel, fd, '0x', buf, buf.length, x => {
      setProgress(100 * x/buf.length)
      setProgressText(`Writing ${x} / ${buf.length} bytes`)
    })
    if (e) throw e
    setProgressText(`Closing ${basename(path)}`)
    await kernel.close(fd)
    onOk()
    emit('refresh-path', dirname(path))
  } catch (e) {
    const err = errno.code[e.reason]
    setError(err ? err.description : e.message)
  }
  setProgress()
}

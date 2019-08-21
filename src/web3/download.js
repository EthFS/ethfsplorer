import * as Path from 'path'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import {saveAs} from 'file-saver'
import JSZip from 'jszip'

export default async function download(kernel, path, files, zip) {
  if (!files.length) return
  if (!zip && files.length === 1) {
    const {fileType, name} = files[0]
    if (fileType == 1) {
      let data = await kernel.readPath(utf8ToHex(Path.join(path, name)), '0x')
      data = Buffer.from(data.slice(2), 'hex')
      return saveAs(new Blob([data], {type: 'application/octet-stream'}), name)
    }
  }
  let topLevel
  if (!zip) {
    zip = new JSZip()
    topLevel = true
  }
  for (let i = 0; i < files.length; i++) {
    const {fileType, entries, name} = files[i]
    const path2 = Path.join(path, name)
    switch (Number(fileType)) {
      case 1:
        let data = await kernel.readPath(utf8ToHex(path2), '0x')
        data = Buffer.from(data.slice(2), 'hex')
        zip.file(name, data)
        break
      case 2:
        const files2 = []
        for (let i = 2; i < entries; i++) {
          const name = hexToUtf8(await kernel.readkeyPath(utf8ToHex(path2), i))
          const stat = await kernel.stat(utf8ToHex(Path.join(path2, name)))
          files2.push({name, ...stat})
        }
        await download(kernel, path2, files2, zip.folder(name))
        break
    }
  }
  if (topLevel) {
    let file = Path.basename(path)
    if (file === '') file = 'files'
    saveAs(await zip.generateAsync({type: 'blob'}), `${file}.zip`)
  }
}

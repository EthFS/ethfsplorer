import * as Path from 'path'
import {toUtf8Bytes, toUtf8String} from '@ethersproject/strings'
import {saveAs} from 'file-saver'
import JSZip from 'jszip'
import read from './read'

export default async function download(kernel, path, files, zip) {
  if (!files.length) return
  if (!zip && files.length === 1) {
    const {fileType, size, name} = files[0]
    if (fileType == 1) {
      let data = ''
      if (size > 0) {
        data = await read(kernel, Path.join(path, name))
      }
      return saveAs(new Blob([data], {type: 'application/octet-stream'}), name)
    }
  }
  let topLevel
  if (!zip) {
    zip = new JSZip()
    topLevel = true
  }
  for (let i = 0; i < files.length; i++) {
    const {fileType, nEntries, size, name} = files[i]
    const path2 = Path.join(path, name)
    switch (Number(fileType)) {
      case 1:
        let data = ''
        if (size > 0) {
          data = await read(kernel, path2)
        }
        zip.file(name, data)
        break
      case 2:
        const files2 = []
        for (let i = 2; i < nEntries; i++) {
          const name = toUtf8String(await kernel.readkeyPath(toUtf8Bytes(path2), i))
          const stat = await kernel.lstat(toUtf8Bytes(Path.join(path2, name)))
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

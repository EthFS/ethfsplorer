import {join as pathjoin} from 'path'
import React, {useState} from 'react'
import {useAsync} from 'react-async-hook'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import Table from './Table'
import {useKernel} from '../web3/kernel'
import {fileMode, fileSize} from '../utils/files'

export default function FileList({address, path, onClickItem}) {
  const kernel = useKernel(address)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState()
  useAsync(async () => {
    if (!kernel) return
    setFiles([])
    setBusy(true)
    setError()
    try {
      const {fileType, entries} = await kernel.stat(utf8ToHex(path))
      if (fileType != 2) throw 'ENOTDIR'
      const dirs = [], dotdirs = []
      const files = [], dotfiles = []
      for (let i = 0; i < entries; i++) {
        const name = hexToUtf8(await kernel.readkeyPath(utf8ToHex(path), i))
        const stat = await kernel.stat(utf8ToHex(pathjoin(path, name)))
        const size = stat.fileType == 2 ? undefined : Number(stat.size)
        const lastModified = moment(stat.lastModified * 1e3).format('DD MMM YYYY HH:mm')
        let arr
        if (stat.fileType == 2) {
          arr = name[0] === '.' ? dotdirs : dirs
        } else {
          arr = name[0] === '.' ? dotfiles : files
        }
        arr.push({name, ...stat, size, lastModified})
      }
      setFiles(
        dotdirs.sort()
          .concat(dirs.sort())
          .concat(dotfiles.sort())
          .concat(files.sort())
      )
    } catch (e) {
      setError(e)
    }
    setBusy(false)
  }, [kernel, path])
  const columns = React.useMemo(() => [
    {Header: 'Name', accessor: 'name'},
    {Header: 'Owner', accessor: x => `${x.owner.slice(0, 12)}…`},
    {Header: 'Group', accessor: x => `${x.group.slice(0, 12)}…`},
    {Header: 'Permissions', accessor: x => fileMode(x.mode)},
    {Header: 'Size', accessor: x => fileSize(x.size)},
    {Header: 'Last modified', accessor: 'lastModified'},
  ], [])
  return (
    <div>
      <Table columns={columns} data={files} />
      <div className="text-center">
        {busy && <FontAwesomeIcon icon={faSpinner} spin />}
        {error && <span>No such directory</span>}
      </div>
    </div>
  )
}

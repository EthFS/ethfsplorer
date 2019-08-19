import {join as joinPath} from 'path'
import React, {useState} from 'react'
import {useAsync} from 'react-async-hook'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import {sortBy} from 'lodash'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import FileIcon from './FileIcon'
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
        const stat = await kernel.stat(utf8ToHex(joinPath(path, name)))
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
        sortBy(dotdirs, 'name')
          .concat(sortBy(dirs, 'name'))
          .concat(sortBy(dotfiles, 'name'))
          .concat(sortBy(files, 'name'))
      )
    } catch (e) {
      setError(e)
    }
    setBusy(false)
  }, [kernel, path])
  function handleClick(name) {
    const {fileType} = files.find(x => x.name === name)
    if (fileType == 2) onClickItem(joinPath(path, name))
  }
  const columns = React.useMemo(() => [
    {
      id: 'selection',
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <div>
          <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
        </div>
      ),
      Cell: ({ row }) => (
        <div>
          <input type="checkbox" {...row.getToggleRowSelectedProps()} />
        </div>
      ),
    },
    {id: 'fileType', accessor: x => Number(x.fileType), Cell: ({cell: {value}}) => <FileIcon fileType={value} />},
    {Header: 'Name', accessor: 'name', Cell: ({cell: {value}}) => <span style={{cursor: 'pointer'}} onClick={() => handleClick(value)}>{value}</span>},
    {Header: 'Owner', accessor: x => `${x.owner.slice(0, 12)}…`},
    {Header: 'Group', accessor: x => `${x.group.slice(0, 12)}…`},
    {Header: 'Mode', accessor: x => fileMode(x.mode), Cell: ({cell: {value}}) => <span style={{fontFamily: 'monospace'}}>{value}</span>},
    {Header: 'Size', accessor: x => fileSize(x.size)},
    {Header: 'Last modified', accessor: 'lastModified'},
  ], [path, files])
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

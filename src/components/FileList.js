import * as Path from 'path'
import React, {useState} from 'react'
import {useAsync} from 'react-async-hook'
import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import {sortBy} from 'lodash'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import FileIcon from './FileIcon'
import Table from './Table'
import FileView from './modals/FileView'
import ProgressBar from './modals/ProgressBar'
import Rename from './modals/Rename'
import {useKernel} from '../web3/kernel'
import {fileMode, fileSize} from '../utils/files'
import {emit, useEvent} from '../utils/events'
import download from '../web3/download'
import rm from '../web3/rm'

export default function FileList({address, path, onClickItem}) {
  const kernel = useKernel(address)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState()
  const getFiles = useAsync(async () => {
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
        const stat = await kernel.stat(utf8ToHex(Path.join(path, name)))
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

  useEvent('refresh-path', refreshPath => {
    if (refreshPath === path) getFiles.execute()
  }, [path, getFiles])
  useEvent('refresh-all', () => getFiles.execute(), [getFiles])

  const [selectedRows, setSelectedRows] = useState([])
  const [progressTitle, setProgressTitle] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')

  useEvent('delete', async () => {
    const selectedFiles = selectedRows
      .filter(i => i > 1)
      .map(i => files[i])
      .filter(x => x)
    if (!selectedFiles.length) return
    setProgressTitle('Delete')
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        setProgress(100*(i+1) / selectedFiles.length)
        const {name} = selectedFiles[i]
        await rm(kernel, Path.join(path, name), setProgress, setProgressText)
      }
    } catch (e) {}
    setProgress()
    emit('refresh-path', path)
  }, [kernel, path, files, selectedRows])

  useEvent('download', async () => {
    const selectedFiles = selectedRows
      .filter(i => i > 1)
      .map(i => files[i])
      .filter(x => x)
    try {
      await download(kernel, path, selectedFiles)
    } catch (e) {}
  }, [kernel, path, files, selectedRows])

  const [showFileView, setShowFileView] = useState(false)
  const [fileViewPath, setFileViewPath] = useState()
  function handleClick(name) {
    const path2 = Path.join(path, name)
    const {fileType} = files.find(x => x.name === name)
    switch (Number(fileType)) {
      case 1:
        setFileViewPath(path2)
        setShowFileView(true)
        break
      case 2:
        onClickItem(path2)
        break
    }
  }

  const [renamePath, setRenamePath] = useState('')
  function handleRename(name) {
    setRenamePath(Path.join(path, name))
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
    {Header: 'Name', accessor: 'name', Cell: ({cell: {value}}) =>
      <ContextMenuTrigger id="fileContextMenu" name={value} collect={({name}) => ({name})}>
        <span
          style={{cursor: 'pointer', userSelect: 'none'}}
          onClick={() => handleClick(value)}
          >
          {value}
        </span>
      </ContextMenuTrigger>
    },
    {Header: 'Owner', accessor: x => `${x.owner.slice(0, 12)}…`},
    {Header: 'Group', accessor: x => `${x.group.slice(0, 12)}…`},
    {Header: 'Mode', accessor: x => fileMode(x.mode), Cell: ({cell: {value}}) => <span style={{fontFamily: 'monospace'}}>{value}</span>},
    {Header: 'Size', accessor: x => fileSize(x.size)},
    {Header: 'Last modified', accessor: 'lastModified'},
  ], [path, files])
  return (
    <div>
      <Table columns={columns} data={files} setSelectedRows={setSelectedRows} />
      <div className="text-center">
        {busy && <FontAwesomeIcon icon={faSpinner} spin />}
        {error && <span>No such directory</span>}
      </div>
      <FileView
        address={address}
        path={fileViewPath}
        isOpen={showFileView}
        toggle={() => setShowFileView(!showFileView)}
      />
      <ProgressBar
        title={progressTitle}
        progress={progress}
        progressText={progressText}
      />
      <ContextMenu id="fileContextMenu">
        <MenuItem onClick={(e, {name}) => handleRename(name)}>Rename</MenuItem>
      </ContextMenu>
      <Rename
        address={address}
        path={renamePath}
        isOpen={!!renamePath}
        toggle={() => setRenamePath('')}
      />
    </div>
  )
}

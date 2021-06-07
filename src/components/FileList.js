import * as Path from 'path'
import React, {useState} from 'react'
import {Alert, Spinner} from 'reactstrap'
import {useAsync} from 'react-async-hook'
import {ContextMenu, MenuItem, ContextMenuTrigger} from 'react-contextmenu'
import errno from 'errno'
import {format} from 'date-fns'
import {keys, sortedIndexBy} from 'lodash'
import {toUtf8Bytes, toUtf8String} from '@ethersproject/strings'
import FileIcon from './FileIcon'
import Table from './Table'
import FileView from './modals/FileView'
import ProgressBar from './modals/ProgressBar'
import Properties from './modals/Properties'
import Rename from './modals/Rename'
import {fileMode, fileSize} from '../utils/files'
import {emit, useEvent} from '../utils/events'
import download from '../web3/download'
import rm from '../web3/rm'

import '../styles/react-contextmenu.css'

export default function FileList({kernel, path, onClickItem}) {
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState()
  const getFiles = useAsync(async () => {
    if (!kernel) return
    setFiles([])
    setBusy(true)
    setError()
    try {
      const {fileType, nEntries} = await kernel.stat(toUtf8Bytes(path))
      if (fileType != 2) throw 'ENOTDIR'
      const dirs = [], dotdirs = []
      const files = [], dotfiles = []
      for (let i = 0; i < nEntries; i++) {
        const name = toUtf8String(await kernel.readkeyPath(toUtf8Bytes(path), i))
        const stat = await kernel.lstat(toUtf8Bytes(Path.join(path, name)))
        const size = stat.fileType == 2 ? undefined : Number(stat.size)
        const lastModified = format(stat.lastModified * 1e3, 'dd MMM yyyy HH:mm')
        let arr
        if (stat.fileType == 2) {
          arr = name[0] === '.' ? dotdirs : dirs
        } else {
          arr = name[0] === '.' ? dotfiles : files
        }
        const file = {name, ...stat, size, lastModified}
        arr.splice(sortedIndexBy(arr, file, 'name'), 0, file)
        setFiles(dotdirs.concat(dirs).concat(dotfiles).concat(files))
      }
    } catch (e) {
      setError('No such folder or permission denied')
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
  const [progressError, setProgressError] = useState()

  useEvent('delete', async () => {
    const selectedFiles = keys(selectedRows)
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
    const selectedFiles = keys(selectedRows)
      .filter(i => i > 1)
      .map(i => files[i])
      .filter(x => x)
    try {
      await download(kernel, path, selectedFiles)
    } catch (e) {}
  }, [kernel, path, files, selectedRows])

  const [cutFiles, setCutFiles] = useState([])
  const [copyFiles, setCopyFiles] = useState([])
  useEvent('cut', () => {
    setCutFiles(keys(selectedRows)
      .filter(i => i > 1)
      .map(i => files[i])
      .filter(x => x)
      .map(x => Path.join(path, x.name)))
    setCopyFiles([])
  }, [path, files, selectedRows])
  useEvent('copy', () => {
    setCutFiles([])
    setCopyFiles(keys(selectedRows)
      .filter(i => i > 1)
      .map(i => files[i])
      .filter(x => x)
      .map(x => Path.join(path, x.name)))
  }, [path, files, selectedRows])
  useEvent('paste', async () => {
    try {
      setProgressError()
      if (cutFiles.length) {
        setProgressTitle('Moving files')
        for (let i = 0; i < cutFiles.length; i++) {
          setProgress(100*(i+1) / cutFiles.length)
          setProgressText(`Moving ${cutFiles[i]}`)
          const tx = await kernel.move(toUtf8Bytes(cutFiles[i]), toUtf8Bytes(path))
          await tx.wait()
        }
      }
      if (copyFiles.length) {
        setProgressTitle('Copying files')
        for (let i = 0; i < copyFiles.length; i++) {
          setProgress(100*(i+1) / copyFiles.length)
          setProgressText(`Copying ${copyFiles[i]}`)
          const tx = await kernel.copy(toUtf8Bytes(copyFiles[i]), toUtf8Bytes(path))
          await tx.wait()
        }
      }
      setProgress()
    } catch (e) {
      const err = errno.code[e.reason]
      setProgressError(err ? err.description : e.message)
      setTimeout(setProgress, 3e3)
    }
    if (cutFiles.length || copyFiles.length) {
      setCutFiles([])
      setCopyFiles([])
      emit('refresh-path', path)
    }
  }, [kernel, path, cutFiles, copyFiles])

  const [showFileView, setShowFileView] = useState(false)
  const [fileViewPath, setFileViewPath] = useState()

  async function handleOpen(name) {
    const path2 = Path.join(path, name)
    let stat = files.find(x => x.name === name)
    while (true) {
      switch (Number(stat.fileType)) {
        case 1:
          setFileViewPath(path2)
          return setShowFileView(true)
        case 2:
          return onClickItem(path2)
        case 3:
          try {
            stat = await kernel.stat(toUtf8Bytes(path2))
          } catch (e) {
            return setError('Target not found or too many levels of symbolic links')
          }
          break
      }
    }
  }

  async function handleDownload(name) {
    const file = files.find(x => x.name === name)
    await download(kernel, path, [file])
  }

  async function handleDelete(name) {
    const path2 = Path.join(path, name)
    setProgressTitle('Delete')
    try {
      setProgress(100)
      setProgressError()
      await rm(kernel, path2, setProgress, setProgressText)
      setProgress()
    } catch (e) {
      const err = errno.code[e.reason]
      setProgressError(err ? err.description : e.message)
      setTimeout(setProgress, 3e3)
    }
    emit('refresh-path', path)
  }

  const [renamePath, setRenamePath] = useState('')
  function handleRename(name) {
    setRenamePath(Path.join(path, name))
  }
  const [propertiesPath, setPropertiesPath] = useState('')
  function handleProperties(name) {
    setPropertiesPath(Path.join(path, name))
  }

  function handleCut(name) {
    setCutFiles([Path.join(path, name)])
    setCopyFiles([])
  }
  function handleCopy(name) {
    setCutFiles([])
    setCopyFiles([Path.join(path, name)])
  }

  const columns = React.useMemo(() => [
    {
      id: 'selection',
      Header: ({getToggleAllRowsSelectedProps}) => (
        <div>
          <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
        </div>
      ),
      Cell: ({row}) => (
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
          onClick={() => handleOpen(value)}
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
    <>
      <Alert color="danger" isOpen={!!error} toggle={() => setError()}>
        {error}
      </Alert>
      <Table columns={columns} data={files} setSelectedRows={setSelectedRows} />
      <div className="text-center">
        {busy && <Spinner color="secondary" />}
      </div>
      <FileView
        kernel={kernel}
        path={fileViewPath}
        isOpen={showFileView}
        toggle={() => setShowFileView(!showFileView)}
      />
      <ProgressBar
        title={progressTitle}
        progress={progress}
        progressText={progressText}
        error={progressError}
      />
      <ContextMenu id="fileContextMenu">
        <MenuItem onClick={(e, {name}) => handleOpen(name)}>Open</MenuItem>
        <MenuItem onClick={(e, {name}) => handleDownload(name)}>Download</MenuItem>
        <MenuItem divider />
        <MenuItem onClick={(e, {name}) => handleDelete(name)}>Delete</MenuItem>
        <MenuItem divider />
        <MenuItem onClick={(e, {name}) => handleRename(name)}>Rename</MenuItem>
        <MenuItem divider />
        <MenuItem onClick={(e, {name}) => handleCut(name)}>Cut</MenuItem>
        <MenuItem onClick={(e, {name}) => handleCopy(name)}>Copy</MenuItem>
        <MenuItem divider />
        <MenuItem onClick={(e, {name}) => handleProperties(name)}>Properties</MenuItem>
      </ContextMenu>
      <Rename
        kernel={kernel}
        path={renamePath}
        isOpen={!!renamePath}
        toggle={() => setRenamePath('')}
      />
      <Properties
        kernel={kernel}
        path={propertiesPath}
        isOpen={!!propertiesPath}
        toggle={() => setPropertiesPath('')}
      />
    </>
  )
}

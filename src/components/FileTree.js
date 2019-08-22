import * as Path from 'path'
import React, {useState} from 'react'
import {useAsync} from 'react-async-hook'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import FileIcon from './FileIcon'
import {useKernel} from '../web3/kernel'
import {useEvent} from '../utils/events'

export default function FileTree({
  address,
  path,
  showPath: _showPath,
  selectPath,
  onClickItem,
}) {
  const kernel = useKernel(address)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [showPath, setShowPath] = useState(_showPath)
  const [expanded, setExpanded] = useState(Path.relative(path, showPath)[0] !== '.')
  const getFiles = useAsync(async () => {
    if (!kernel || !expanded) return
    setBusy(true)
    const {fileType, entries} = await kernel.stat(utf8ToHex(path))
    if (fileType != 2) return
    const files = []
    for (let i = 2; i < entries; i++) {
      const name = hexToUtf8(await kernel.readkeyPath(utf8ToHex(path), i))
      const {fileType} = await kernel.stat(utf8ToHex(Path.join(path, name)))
      if (fileType == 2) files.push(name)
    }
    setFiles(files.sort())
    setBusy(false)
  }, [kernel, path, expanded])
  useEvent('show-path', showPath => {
    const path2 = Path.relative(path, showPath)
    if (path2[0] !== '.') {
      setExpanded(true)
      setShowPath(showPath)
      const name = path2.split(Path.sep)[0]
      if (name !== '' && files.indexOf(name) < 0) {
        getFiles.execute()
      }
    }
  }, [path, files, getFiles])
  useEvent('refresh-path', refreshPath => {
    if (refreshPath === path) getFiles.execute()
  }, [path, getFiles])
  useEvent('refresh-all', () => getFiles.execute(), [getFiles])
  function handleClick() {
    onClickItem(path)
    setExpanded(true)
    getFiles.execute()
  }
  return (
    <>
      <div className="d-flex align-items-center">
        <span style={{userSelect: 'none'}} onClick={() => setExpanded(!expanded)}>
          <FileIcon fileType={2} expanded={expanded} />
        </span>
        <span style={{marginLeft: 2}} />
        <div style={{
          backgroundColor: path === selectPath ? 'lightgray' : 'unset',
          borderRadius: 2,
          padding: '0 5px',
        }}>
          <span
            style={{cursor: 'pointer', userSelect: 'none'}}
            onClick={handleClick}
            onDoubleClick={() => setExpanded(!expanded)}
            >
            {Path.basename(path) || path}
          </span>
        </div>
        <span style={{marginLeft: 2}} />
        {busy && <FontAwesomeIcon icon={faSpinner} spin />}
        <span className="flex-grow-1" />
      </div>
      {expanded &&
        <div style={{marginLeft: 20}}>
          {files.map(name =>
            <FileTree
              key={name}
              address={address}
              path={Path.join(path, name)}
              showPath={showPath}
              selectPath={selectPath}
              onClickItem={onClickItem}
            />
          )}
        </div>
      }
    </>
  )
}

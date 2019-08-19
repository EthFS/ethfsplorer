import {
  basename,
  join as joinPath,
  relative as relativePath,
} from 'path'
import React, {useState} from 'react'
import {useAsync} from 'react-async-hook'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner, faPlusSquare, faMinusSquare} from '@fortawesome/free-solid-svg-icons'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import {useKernel} from '../web3/kernel'
import {useEvent} from '../utils/events'

export default function FileTree({
  address,
  path,
  showPath: _showPath,
  onClickItem,
}) {
  const kernel = useKernel(address)
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [showPath, setShowPath] = useState(_showPath)
  const [expanded, setExpanded] = useState(relativePath(path, showPath)[0] !== '.')
  useAsync(async () => {
    if (!kernel || !expanded) return
    setBusy(true)
    const {fileType, entries} = await kernel.stat(utf8ToHex(path))
    if (fileType != 2) return
    const files = []
    for (let i = 2; i < entries; i++) {
      const name = hexToUtf8(await kernel.readkeyPath(utf8ToHex(path), i))
      const {fileType} = await kernel.stat(utf8ToHex(joinPath(path, name)))
      if (fileType == 2) files.push(name)
    }
    setFiles(files)
    setBusy(false)
  }, [kernel, path, expanded])
  useEvent('show-path', showPath => {
    if (relativePath(path, showPath)[0] !== '.' && !expanded) {
      setExpanded(true)
      setShowPath(showPath)
    }
  }, [path, expanded])
  return (
    <div>
      <div>
        <span style={{userSelect: 'none'}} onClick={() => setExpanded(!expanded)}>
          <FontAwesomeIcon icon={expanded ? faMinusSquare : faPlusSquare} />
        </span>
        <span style={{marginLeft: 5}} />
        <span style={{cursor: 'pointer', userSelect: 'none'}} onClick={() => onClickItem(path)}>
          {basename(path) || path}
        </span>
        <span style={{marginLeft: 5}} />
        {busy && <FontAwesomeIcon icon={faSpinner} spin />}
      </div>
      {expanded &&
        <div style={{marginLeft: 20}}>
          {files.map(name =>
            <FileTree
              key={name}
              address={address}
              path={joinPath(path, name)}
              showPath={showPath}
              onClickItem={onClickItem}
            />
          )}
        </div>
      }
    </div>
  )
}

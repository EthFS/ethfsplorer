import {basename} from 'path'
import React, {useState, useEffect} from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faPlusSquare, faMinusSquare} from '@fortawesome/free-solid-svg-icons'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import {useKernel} from '../web3/kernel'

export default function FileTree({
  address,
  path,
  expanded: _expanded,
  onClickItem,
}) {
  const kernel = useKernel(address)
  const [files, setFiles] = useState([])
  const [expanded, setExpanded] = useState(_expanded)
  useEffect(() => {
    if (!kernel || !expanded) return
    (async () => {
      const {fileType, entries} = await kernel.stat(utf8ToHex(path))
      if (fileType != 2) return
      const files = []
      for (let i = 2; i < entries; i++) {
        const name = hexToUtf8(await kernel.readkeyPath(utf8ToHex(path), i))
        const {fileType} = await kernel.stat(utf8ToHex(`${path}/${name}`))
        if (fileType == 2) files.push(name)
      }
      setFiles(files)
    })()
  }, [kernel, path, expanded])
  return (
    <div>
      <div>
        <span onClick={() => setExpanded(!expanded)}>
          <FontAwesomeIcon icon={expanded ? faMinusSquare : faPlusSquare} />
        </span>
        <span style={{marginLeft: 5}} />
        <span style={{cursor: 'pointer'}} onClick={() => onClickItem(path)}>
          {basename(path) || path}
        </span>
      </div>
      {expanded &&
        <div style={{marginLeft: 20}}>
          {files.map(name => {
            return (
              <FileTree
                key={name}
                address={address}
                path={`${path}/${name}`}
                onClickItem={onClickItem}
              />
            )
          })}
        </div>
      }
    </div>
  )
}

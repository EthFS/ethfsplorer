import {isAbsolute, join, normalize} from 'path'
import {trimEnd} from 'lodash'
import React, {useState} from 'react'
import {Button, Input} from 'reactstrap'
import {emit} from '../utils/events'

export default function AddressBar({path: _path, onChange}) {
  const [path, setPath] = useState(_path)
  const [prevPath, setPrevPath] = useState(_path)
  if (_path !== prevPath) {
    setPath(_path)
    setPrevPath(_path)
  }
  function gotoPath() {
    if (!path) return
    let path2 = normalize(path)
    if (!isAbsolute(path2)) path2 = join(_path, path2)
    path2 = trimEnd(path2, '/')
    if (path2 === '') path2 = '/'
    setPath(path2)
    onChange(path2)
    emit('show-path', path2)
  }
  return (
    <div style={{display: 'flex'}}>
      <Input
        placeholder="Enter a path..."
        value={path}
        onChange={e => setPath(e.target.value)}
        onKeyUp={e => e.key === 'Enter' && gotoPath()}
        spellCheck="false"
      />
      <span style={{marginLeft: 5}} />
      <Button onClick={gotoPath} disabled={!path}>
        Go
      </Button>
    </div>
  )
}

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
  function goToPath() {
    if (!path) return
    onChange(path)
    emit('show-path', path)
  }
  return (
    <div style={{display: 'flex'}}>
      <Input
        placeholder="Enter a path..."
        value={path}
        onChange={e => setPath(e.target.value)}
        onKeyUp={e => e.key === 'Enter' && goToPath()}
        spellCheck="false"
      />
      <span style={{marginLeft: 5}} />
      <Button onClick={goToPath} disabled={!path}>
        Go
      </Button>
    </div>
  )
}

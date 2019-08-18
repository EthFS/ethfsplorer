import React, {useState} from 'react'
import {Button, Input} from 'reactstrap'

export default function AddressBar({path: _path, onChange}) {
  const [path, setPath] = useState(_path)
  const [prevPath, setPrevPath] = useState(_path)
  if (_path !== prevPath) {
    setPath(_path)
    setPrevPath(_path)
  }
  return (
    <div style={{display: 'flex'}}>
      <Input
        placeholder="Enter a path..."
        value={path}
        onChange={e => setPath(e.target.value)}
        onKeyUp={e => e.key === 'Enter' && path && onChange(path)}
        spellCheck="false"
      />
      <span style={{marginLeft: 5}} />
      <Button onClick={() => onChange(path)} disabled={!path}>
        Go
      </Button>
    </div>
  )
}

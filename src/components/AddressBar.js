import React, {useState} from 'react'
import {Button, Input} from 'reactstrap'

export default function AddressBar({path: _path, onChange}) {
  const [path, setPath] = useState(_path)
  return (
    <div style={{display: 'flex', flexDirection: 'row'}}>
      <Input
        value={path}
        onChange={e => setPath(e.target.value)}
        onKeyUp={e => e.key === 'Enter' && onChange(path)}
      />
      <span style={{marginLeft: 5}} />
      <Button onClick={() => onChange(path)}>Go</Button>
    </div>
  )
}

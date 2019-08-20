import React, {useState} from 'react'
import {Input} from 'reactstrap'
import Modal from './Modal'
import {useAsync} from 'react-async-hook'
import constants from '../../web3/constants'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import errno from 'errno'

export default function FileView({address, path, isOpen, toggle}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const kernel = useKernel(address)
  useAsync(async () => {
    if (!kernel) return
    setText('')
    setBusy(true)
    setError()
    try {
      const {fileType} = await kernel.stat(utf8ToHex(path))
      if (fileType == 2) throw 'EISDIR'
      setText(hexToUtf8(await kernel.readPath(utf8ToHex(path), '0x')))
    } catch (e) {
      setError(e)
    }
    setBusy(false)
  }, [kernel, path])
  function handleOk() {
  }
  return (
    <Modal
      isOpen={isOpen}
      title={`Viewing ${path}`}
      toggle={toggle}
      onOk={handleOk}
      allowOk={true}
      size="lg"
      >
      <Input
        style={{height: 400}}
        type="textarea"
        value={text}
        placeholder="This file is empty"
        onChange={e => setText(e.target.value)}
      />
    </Modal>
  )
}

import React, {useState} from 'react'
import {Form, FormText, Input} from 'reactstrap'
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
  const [originalText, setOriginalText] = useState('')
  const kernel = useKernel(address)
  useAsync(async () => {
    if (!kernel) return
    setText('')
    setBusy(true)
    setError()
    try {
      const {fileType} = await kernel.stat(utf8ToHex(path))
      if (fileType == 2) throw 'EISDIR'
      const data = hexToUtf8(await kernel.readPath(utf8ToHex(path), '0x'))
      setText(data)
      setOriginalText(data)
    } catch (e) {
      setError(e)
    }
    setBusy(false)
  }, [kernel, path])
  function handleChange(e) {
    const {value} = e.target
    if (originalText !== value.slice(0, originalText.length)) {
      return e.preventDefault()
    }
    setText(value)
  }
  async function handleOk(e) {
    e.preventDefault()
  }
  return (
    <Modal
      isOpen={isOpen}
      title={`Viewing ${path}`}
      toggle={toggle}
      labelOk="Save"
      onOk={handleOk}
      allowOk={text.length > originalText.length}
      size="lg"
      >
      <Form>
        <Input
          style={{height: 400}}
          type="textarea"
          value={text}
          placeholder="This file is empty"
          onChange={handleChange}
        />
        <FormText color="muted">
          Text may only be appended.
        </FormText>
      </Form>
    </Modal>
  )
}

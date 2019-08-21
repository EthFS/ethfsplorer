import React, {useState} from 'react'
import {Form, FormGroup, FormText, FormFeedback, Input, Progress} from 'reactstrap'
import Modal from './Modal'
import {useAsync} from 'react-async-hook'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import errno from 'errno'
import write from './write'

export default function FileView({address, path, isOpen, toggle}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const [originalText, setOriginalText] = useState('')
  const kernel = useKernel(address)
  useAsync(async () => {
    if (!kernel || path === undefined) return
    setText('')
    setOriginalText('')
    setBusy(true)
    setError()
    try {
      const {fileType} = await kernel.stat(utf8ToHex(path))
      if (fileType == 2) throw 'EISDIR'
      const data = hexToUtf8(await kernel.readPath(utf8ToHex(path), '0x'))
      setText(data)
      setOriginalText(data)
    } catch (e) {
      e = errno.code[e.reason]
      if (e) setError(e.description)
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
    await write(kernel, path, 0, text.slice(originalText.length), setProgress, setProgressText, setError, () => {
      setOriginalText(text)
      toggle()
    })
  }
  return (
    <Modal
      isOpen={isOpen}
      title={`Viewing ${path}`}
      toggle={toggle}
      labelOk="Save"
      onOk={handleOk}
      allowOk={text.length > originalText.length && progress === undefined}
      size="lg"
      >
      <Form>
        <FormGroup>
          <Input
            style={{height: 400}}
            type="textarea"
            value={text}
            placeholder="This file is empty"
            onChange={handleChange}
            invalid={!!error}
          />
          <FormFeedback>{error}</FormFeedback>
        </FormGroup>
        <FormText color="muted">
          Text may only be appended.
        </FormText>
      </Form>
      {progress >= 0 &&
        <>
          <div style={{marginTop: 5}} />
          <Progress animated value={progress}>{progressText}</Progress>
        </>
      }
    </Modal>
  )
}

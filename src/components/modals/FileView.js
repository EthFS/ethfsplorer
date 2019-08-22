import React, {useState} from 'react'
import {Form, FormGroup, FormText, FormFeedback, Input, Progress} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import Modal from './Modal'
import {useAsync} from 'react-async-hook'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import common from 'common-prefix'
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
    if (!kernel || path === undefined || !isOpen) return
    setText('')
    setOriginalText('')
    setBusy(true)
    setError()
    try {
      const {fileType, size} = await kernel.stat(utf8ToHex(path))
      if (fileType == 2) throw 'EISDIR'
      if (size > 0) {
        const data = hexToUtf8(await kernel.readPath(utf8ToHex(path), '0x'))
        setText(data)
        setOriginalText(data)
      }
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
    }
    setBusy(false)
  }, [kernel, path, isOpen])
  const prefix = common([text, originalText])
  async function handleOk(e) {
    e.preventDefault()
    await write(kernel, path, 0, text.slice(prefix.length), prefix.length < originalText.length ? prefix.length : -1, setProgress, setProgressText, setError, () => {
      setOriginalText(text)
      toggle()
    })
  }
  return (
    <Modal
      isOpen={isOpen}
      title={
        <span>
          {`Viewing ${path}`}
          {busy && <FontAwesomeIcon style={{marginLeft: 5}} icon={faSpinner} spin />}
        </span>
      }
      toggle={toggle}
      labelOk="Save"
      onOk={handleOk}
      allowOk={text !== originalText && progress === undefined}
      size="lg"
      >
      <Form>
        <FormGroup>
          <Input
            style={{height: 400}}
            type="textarea"
            value={text}
            placeholder="This file is empty"
            onChange={e => setText(e.target.value)}
            invalid={!!error}
          />
          <FormFeedback>{error}</FormFeedback>
        </FormGroup>
        {text !== originalText &&
          <FormText color="muted">
            Operations: {prefix.length < originalText.length ? `Truncate to ${prefix.length} bytes. ` : ''}{text.length > prefix.length ? `Append ${text.length - prefix.length} bytes.` : ''}
          </FormText>
        }
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

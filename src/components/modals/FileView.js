import React, {useState} from 'react'
import {
  Form, FormGroup, FormText, FormFeedback,
  Input, Progress, Spinner,
} from 'reactstrap'
import Modal from './Modal'
import {useAsync} from 'react-async-hook'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import common from 'common-prefix'
import errno from 'errno'
import write from './write'

export default function FileView({kernel, path, isOpen, toggle}) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const [originalText, setOriginalText] = useState('')
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
        <div className="d-flex align-items-center">
          Viewing {path}
          {busy && <Spinner style={{marginLeft: 5}} size="sm" color="secondary" />}
        </div>
      }
      toggle={toggle}
      labelOk="Save"
      onOk={handleOk}
      allowOk={text !== originalText && progress === undefined}
      centered
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
        {text !== originalText ?
          <FormText>
            Operations: {prefix.length < originalText.length ? `Truncate to ${prefix.length} bytes. ` : ''}{text.length > prefix.length ? `Append ${text.length - prefix.length} bytes.` : ''}
          </FormText>
          :
          <FormText>{text.length} bytes</FormText>
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

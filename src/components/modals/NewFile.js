import * as Path from 'path'
import React, {useState} from 'react'
import {Form, FormGroup, FormFeedback, Input, Progress} from 'reactstrap'
import Modal from './Modal'
import constants from '../../web3/constants'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex} from 'web3-utils'
import errno from 'errno'
import {emit} from '../../utils/events'
import write from '../../web3/write'

export default function NewFile({address, path, isOpen, toggle}) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const kernel = useKernel(address)
  async function handleOk(e) {
    e.preventDefault()
    if (name === '') return
    try {
      const buf = Buffer.from(text)
      setProgress(30)
      setProgressText(`Opening ${name}`)
      await kernel.open(utf8ToHex(Path.join(path, name)), constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL)
      const fd = Number(await kernel.result())
      const [,e] = await write(kernel, fd, '0x', buf, buf.length, x => {
        setProgress(30 + 40 * x/buf.length)
        setProgressText(`Writing ${x} / ${buf.length} bytes`)
      })
      if (e) throw e
      setProgress(100)
      setProgressText(`Closing ${name}`)
      await kernel.close(fd)
      setName('')
      setText('')
      toggle()
      emit('refresh-path', path)
    } catch (e) {
      if (e.reason) setError(errno.code[e.reason].description)
    }
    setProgress()
  }
  return (
    <Modal
      isOpen={isOpen}
      title="New File"
      toggle={toggle}
      onOk={handleOk}
      allowOk={name !== '' && progress === undefined}
      >
      <Form onSubmit={handleOk}>
        <FormGroup>
          <Input
            type="text"
            value={name}
            placeholder="Enter name"
            onChange={e => {
              setName(e.target.value)
              setError('')
            }}
            spellCheck="false"
            invalid={!!error}
          />
          <FormFeedback>{error}</FormFeedback>
        </FormGroup>
        <FormGroup>
          <Input
            type="textarea"
            value={text}
            placeholder="Enter file contents"
            onChange={e => setText(e.target.value)}
          />
        </FormGroup>
      </Form>
      {progress >= 0 &&
        <Progress animated value={progress}>{progressText}</Progress>
      }
    </Modal>
  )
}

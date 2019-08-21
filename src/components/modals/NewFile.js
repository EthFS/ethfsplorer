import * as Path from 'path'
import React, {useState} from 'react'
import {Form, FormGroup, FormFeedback, Input, Progress} from 'reactstrap'
import Modal from './Modal'
import constants from '../../web3/constants'
import {useKernel} from '../../web3/kernel'
import write from './write'

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
    await write(kernel, Path.join(path, name), constants.O_CREAT | constants.O_EXCL, text, -1, setProgress, setProgressText, setError, () => {
      setName('')
      setText('')
      toggle()
    })
  }
  return (
    <Modal
      isOpen={isOpen}
      title="New File"
      toggle={toggle}
      onOk={handleOk}
      allowOk={name !== '' && progress === undefined}
      size="lg"
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
            style={{height: 350}}
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

import * as Path from 'path'
import React, {useState, useEffect, useRef} from 'react'
import {Form, FormGroup, Input, Progress} from 'reactstrap'
import Modal from './Modal'
import {toUtf8Bytes} from '@ethersproject/strings'
import errno from 'errno'
import {emit} from '../../utils/events'
import useTrigger from '../../utils/trigger'

export default function NewFolder({kernel, path, isOpen, toggle}) {
  const [name, setName] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState()
  const input = useRef()
  useEffect(setProgress, [isOpen])
  useTrigger(isOpen, () => input.current.focus())
  async function handleOk(e) {
    e.preventDefault()
    if (name === '') return
    try {
      const path2 = Path.join(path, name)
      setError()
      setProgress(100)
      setProgressText(`Creating folder ${path2}`)
      const tx = await kernel.mkdir(toUtf8Bytes(path2))
      await tx.wait()
      setName('')
      toggle()
      emit('refresh-path', path)
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      title="New Folder"
      toggle={toggle}
      onOk={handleOk}
      allowOk={name !== '' && progress === undefined}
      >
      <Form onSubmit={handleOk}>
        <FormGroup>
          <Input
            innerRef={input}
            type="text"
            value={name}
            placeholder="Enter name"
            onChange={e => {
              setName(e.target.value)
              setProgress()
            }}
            spellCheck="false"
          />
        </FormGroup>
      </Form>
      {progress >= 0 && (error ?
        <Progress animated color="danger" value={progress}>{error}</Progress>
        :
        <Progress animated value={progress}>{progressText}</Progress>
      )}
    </Modal>
  )
}

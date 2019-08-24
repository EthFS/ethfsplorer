import * as Path from 'path'
import React, {useState, useEffect, useRef} from 'react'
import {Form, FormGroup, Input, Progress} from 'reactstrap'
import Modal from './Modal'
import {utf8ToHex} from 'web3-utils'
import errno from 'errno'
import {emit} from '../../utils/events'
import useTrigger from '../../utils/trigger'

export default function NewLink({kernel, path, isOpen, toggle}) {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState()
  const input = useRef()
  useEffect(setProgress, [isOpen])
  useTrigger(isOpen, () => input.current.focus())
  async function handleOk(e) {
    e.preventDefault()
    if (name === '' || target === '') return
    try {
      const path2 = Path.join(path, name)
      setError()
      setProgress(100)
      setProgressText(`Creating link from ${path2} to ${target}`)
      await kernel.symlink(utf8ToHex(target), utf8ToHex(path2))
      setName('')
      setTarget('')
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
      title="New Symbolic Link"
      toggle={toggle}
      onOk={handleOk}
      allowOk={name !== '' && target !== '' && progress === undefined}
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
              setError('')
            }}
            spellCheck="false"
          />
        </FormGroup>
        <FormGroup>
          <Input
            type="text"
            value={target}
            placeholder="Enter target"
            onChange={e => {
              setTarget(e.target.value)
              setError('')
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

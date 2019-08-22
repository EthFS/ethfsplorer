import * as Path from 'path'
import React, {useState, useEffect} from 'react'
import {Form, FormGroup, FormFeedback, Input} from 'reactstrap'
import Modal from './Modal'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex} from 'web3-utils'
import errno from 'errno'
import {emit} from '../../utils/events'

export default function Rename({address, path, isOpen, toggle}) {
  const [newPath, setNewPath] = useState('')
  const [error, setError] = useState('')
  const kernel = useKernel(address)
  useEffect(() => setNewPath(path), [isOpen])
  async function handleOk(e) {
    e.preventDefault()
    if (newPath === '' || newPath === path) return
    try {
      await kernel.move(utf8ToHex(path), utf8ToHex(newPath))
      toggle()
      emit('refresh-path', Path.dirname(path))
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      title="Rename"
      toggle={toggle}
      onOk={handleOk}
      allowOk={newPath !== '' && newPath !== path}
      >
      <Form onSubmit={handleOk}>
        <FormGroup>
          <Input
            type="text"
            value={newPath}
            placeholder="Enter new name"
            onChange={e => {
              setNewPath(e.target.value)
              setError('')
            }}
            spellCheck="false"
            invalid={!!error}
          />
          <FormFeedback>{error}</FormFeedback>
        </FormGroup>
      </Form>
    </Modal>
  )
}

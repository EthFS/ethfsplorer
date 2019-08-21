import * as Path from 'path'
import React, {useState} from 'react'
import {Form, FormGroup, FormFeedback, Input} from 'reactstrap'
import Modal from './Modal'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex} from 'web3-utils'
import errno from 'errno'
import {emit} from '../../utils/events'

export default function NewFolder({address, path, isOpen, toggle}) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const kernel = useKernel(address)
  async function handleOk(e) {
    e.preventDefault()
    if (name === '') return
    try {
      await kernel.mkdir(utf8ToHex(Path.join(path, name)))
      setName('')
      toggle()
      emit('refresh-path', path)
    } catch (e) {
      e = errno.code[e.reason]
      if (e) setError(e.description)
    }
  }
  return (
    <Modal isOpen={isOpen} title="New Folder" toggle={toggle} onOk={handleOk} allowOk={name !== ''}>
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
      </Form>
    </Modal>
  )
}

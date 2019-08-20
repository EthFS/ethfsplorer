import * as Path from 'path'
import React, {useState} from 'react'
import {Form, FormGroup, Label, Input} from 'reactstrap'
import Modal from './Modal'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex} from 'web3-utils'

export default function NewFolder({address, path, isOpen, toggle}) {
  const [name, setName] = useState('')
  const kernel = useKernel(address)
  async function handleOk(e) {
    e.preventDefault()
    if (name === '') return
    await kernel.mkdir(utf8ToHex(Path.join(path, name)))
    setName('')
    toggle()
  }
  return (
    <Modal isOpen={isOpen} title="New Folder" toggle={toggle} onOk={handleOk} allowOk={name !== ''}>
      <Form onSubmit={handleOk}>
        <FormGroup>
          <Input
            type="text"
            value={name}
            placeholder="Enter name"
            onChange={e => setName(e.target.value)}
            spellCheck="false"
          />
        </FormGroup>
      </Form>
    </Modal>
  )
}

import React from 'react'
import Modal from './Modal'

export default function NewFile({isOpen, toggle}) {
  return (
    <Modal isOpen={isOpen} title="New File" toggle={toggle}>
      Hello
    </Modal>
  )
}

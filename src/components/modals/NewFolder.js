import React from 'react'
import Modal from './Modal'

export default function NewFolder({isOpen, toggle}) {
  return (
    <Modal isOpen={isOpen} title="New Folder" toggle={toggle}>
      Hello
    </Modal>
  )
}

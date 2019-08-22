import React from 'react'
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'

export default function({
  isOpen, title, children, labelOk,
  onOk, allowOk, toggle, centered, size,
}) {
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered={centered} size={size}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>{children}</ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={onOk} disabled={!allowOk}>
          {labelOk || 'OK'}
        </Button>{' '}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  )
}

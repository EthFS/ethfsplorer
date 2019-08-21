import React from 'react'
import {Modal, ModalHeader, ModalBody, Progress} from 'reactstrap'

export default function ProgressBar({title, progress, progressText}) {
  return (
    <Modal isOpen={progress >= 0} centered>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <Progress animated value={progress}>{progressText}</Progress>
      </ModalBody>
    </Modal>
  )
}

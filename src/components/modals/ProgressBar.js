import React from 'react'
import {Modal, ModalHeader, ModalBody, Progress} from 'reactstrap'

export default function ProgressBar({title, progress, progressText, error}) {
  return (
    <Modal isOpen={progress >= 0} centered>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        {error ?
          <Progress animated color="danger" value={progress}>{error}</Progress>
          :
          <Progress animated value={progress}>{progressText}</Progress>
        }
      </ModalBody>
    </Modal>
  )
}

import React, {useState} from 'react'
import {Button, ButtonGroup, Tooltip} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFile, faFolder} from '@fortawesome/free-solid-svg-icons'
import {uniqueId} from 'lodash'
import Modal from './Modal'

export default function Toolbar() {
  const [showNewFile, setShowNewFile] = useState(false)
  return (
    <ButtonGroup>
      <ToolbarButton
        icon={faFile}
        label="New File"
        onClick={() => setShowNewFile(true)}
      />
      <Modal isOpen={showNewFile} title="New File" toggle={() => setShowNewFile(!showNewFile)}>
        Hello
      </Modal>
      <ToolbarButton icon={faFolder} label="New Folder" />
    </ButtonGroup>
  )
}

function ToolbarButton({icon, label, onClick}) {
  const [id] = useState(() => uniqueId('toolbar_'))
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <Button id={id} onClick={onClick}>
        <FontAwesomeIcon icon={icon} />
      </Button>
      <Tooltip
        placement="bottom"
        isOpen={isOpen}
        target={id}
        toggle={() => setOpen(!isOpen)}
        >
        {label}
      </Tooltip>
    </>
  )
}

import React, {useState} from 'react'
import {Button, ButtonGroup, Tooltip} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFile, faFolder} from '@fortawesome/free-solid-svg-icons'
import {uniqueId} from 'lodash'
import NewFile from './modals/NewFile'
import NewFolder from './modals/NewFolder'

export default function Toolbar() {
  return (
    <ButtonGroup>
      <ToolbarModal icon={faFile} label="New File" modal={NewFile} />
      <ToolbarModal icon={faFolder} label="New Folder" modal={NewFolder} />
    </ButtonGroup>
  )
}

function ToolbarModal({icon, label, modal: Modal}) {
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <ToolbarButton icon={icon} label={label} onClick={() => setOpen(true)} />
      <Modal isOpen={isOpen} toggle={() => setOpen(!isOpen)} />
    </>
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

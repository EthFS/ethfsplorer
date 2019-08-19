import React, {useState} from 'react'
import {Button, ButtonGroup, Tooltip} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFile, faFolder} from '@fortawesome/free-solid-svg-icons'
import {uniqueId} from 'lodash'

export default function Toolbar() {
  return (
    <ButtonGroup>
      <ToolbarButton icon={faFile} label="New file" />
      <ToolbarButton icon={faFolder} label="New folder" />
    </ButtonGroup>
  )
}

function ToolbarButton({icon, label}) {
  const [id] = useState(() => uniqueId('toolbar_'))
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <Button id={id}>
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

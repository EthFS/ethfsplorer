import React, {useState} from 'react'
import {Button, ButtonGroup, Tooltip} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faRedo} from '@fortawesome/free-solid-svg-icons'
import {uniqueId} from 'lodash'
import NewFile from './modals/NewFile'
import NewFolder from './modals/NewFolder'
import {emit} from '../utils/events'

export default function Toolbar({address, path}) {
  return (
    <>
      <ButtonGroup>
        <ToolbarModal
          address={address}
          path={path}
          icon={faFile}
          label="New File"
          modal={NewFile}
        />
        <ToolbarModal
          address={address}
          path={path}
          icon={faFolder}
          label="New Folder"
          modal={NewFolder}
        />
      </ButtonGroup>
      <span style={{marginLeft: 5}} />
      <ButtonGroup>
        <ToolbarButton
          icon={faRedo}
          label="Refresh"
          onClick={() => emit('refresh-all')}
        />
      </ButtonGroup>
    </>
  )
}

function ToolbarModal({address, path, icon, label, modal: Modal}) {
  const [isOpen, setOpen] = useState(false)
  return (
    <>
      <ToolbarButton
        icon={icon}
        label={label}
        onClick={() => setOpen(true)}
      />
      <Modal
        address={address}
        path={path}
        isOpen={isOpen}
        toggle={() => setOpen(!isOpen)}
      />
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

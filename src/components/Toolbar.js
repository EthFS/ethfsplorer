import React, {useState, useRef} from 'react'
import {Button, ButtonGroup, Tooltip} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faFile, faFolder, faRedo, faTrash, faDownload, faUpload,
} from '@fortawesome/free-solid-svg-icons'
import {uniqueId} from 'lodash'
import NewFile from './modals/NewFile'
import NewFolder from './modals/NewFolder'
import ProgressBar from './modals/ProgressBar'
import {emit} from '../utils/events'
import {useKernel} from '../web3/kernel'
import upload from '../web3/upload'

export default function Toolbar({address, path}) {
  const kernel = useKernel(address)
  const [progressTitle, setProgressTitle] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const filePicker = useRef()
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
      <ButtonGroup style={{marginLeft: 5}}>
        <ToolbarButton
          icon={faRedo}
          label="Refresh"
          onClick={() => emit('refresh-all')}
        />
      </ButtonGroup>
      <ButtonGroup style={{marginLeft: 5}}>
        <ToolbarButton
          icon={faTrash}
          label="Delete"
          onClick={() => emit('delete')}
        />
      </ButtonGroup>
      <ButtonGroup style={{marginLeft: 5}}>
        <ToolbarButton
          icon={faDownload}
          label="Download"
          onClick={() => emit('download')}
        />
        <ToolbarButton
          icon={faUpload}
          label="Upload"
          onClick={() => filePicker.current.click()}
        />
      </ButtonGroup>
      <input
        ref={filePicker}
        style={{display: 'none'}}
        type="file"
        multiple
        onChange={() => {
          setProgressTitle('Uploading')
          upload(kernel, path, filePicker.current.files, setProgress, setProgressText)
        }}
      />
      <ProgressBar
        title={progressTitle}
        progress={progress}
        progressText={progressText}
      />
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
        trigger="hover"
        >
        {label}
      </Tooltip>
    </>
  )
}

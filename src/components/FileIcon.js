import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faFolderOpen, faLink} from '@fortawesome/free-solid-svg-icons'

export default function FileIcon({fileType, expanded}) {
  switch (Number(fileType)) {
    case 1: default:
      return <FontAwesomeIcon icon={faFile} fixedWidth />
    case 2:
      return <FontAwesomeIcon icon={expanded ? faFolderOpen : faFolder} fixedWidth />
    case 3:
      return <FontAwesomeIcon icon={faLink} fixedWidth />
  }
}

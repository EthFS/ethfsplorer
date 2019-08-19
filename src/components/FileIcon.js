import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFile, faFolder, faFolderOpen} from '@fortawesome/free-solid-svg-icons'

export default function FileIcon({fileType, expanded}) {
  switch (Number(fileType)) {
    case 1: default:
      return <FontAwesomeIcon icon={faFile} />
    case 2:
      return <FontAwesomeIcon icon={expanded ? faFolderOpen : faFolder} />
  }
}

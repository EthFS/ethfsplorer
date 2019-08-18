import React, {useState} from 'react'
import {Container, Row, Col} from 'reactstrap'
import AddressBar from './AddressBar'
import FileList from './FileList'
import FileTree from './FileTree'

export default function Browser({address, path}) {
  if (!path) path = '/'
  const [fileListPath, setFileListPath] = useState(path)
  return (
    <Container>
      <Row>
        <Col lg="3">
          <FileTree
            address={address}
            path={path}
            expanded
            onClickItem={setFileListPath}
          />
        </Col>
        <Col lg="9">
          <AddressBar path={fileListPath} onChange={setFileListPath} />
          <FileList address={address} path={fileListPath} />
        </Col>
      </Row>
    </Container>
  )
}

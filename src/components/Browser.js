import React, {useState} from 'react'
import {Container, Row, Col} from 'reactstrap'
import FileList from './FileList'
import FileTree from './FileTree'

export default function Browser({address, path}) {
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
          <FileList address={address} path={fileListPath} />
        </Col>
      </Row>
    </Container>
  )
}

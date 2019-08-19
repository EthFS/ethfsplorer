import React, {useState} from 'react'
import {Container, Row, Col, Card, CardHeader} from 'reactstrap'
import AddressBar from './AddressBar'
import FileList from './FileList'
import FileTree from './FileTree'
import {emit} from '../utils/events'

export default function Browser({address, path}) {
  if (!path) path = '/'
  const [fileListPath, setFileListPath] = useState(path)
  function handleChangePath(path) {
    setFileListPath(path)
    emit('show-path', path)
  }
  return (
    <Container className="h-100">
      <Row className="h-100">
        <Col lg="3">
          <Card className="h-100">
            <CardHeader>Directory Tree</CardHeader>
            <div style={{padding: 5}}>
              <FileTree
                address={address}
                path={path}
                showPath={path}
                onClickItem={setFileListPath}
              />
            </div>
          </Card>
        </Col>
        <Col lg="9">
          <AddressBar path={fileListPath} onChange={handleChangePath} />
          <div style={{marginTop: 5}} />
          <FileList
            address={address}
            path={fileListPath}
            onClickItem={handleChangePath}
          />
        </Col>
      </Row>
    </Container>
  )
}

import React, {useState} from 'react'
import {Container, Row, Col, Card, CardHeader} from 'reactstrap'
import AddressBar from './AddressBar'
import FileList from './FileList'
import FileTree from './FileTree'
import Toolbar from './Toolbar'
import {emit} from '../utils/events'
import useKernel from '../web3/kernel'

export default function Explorer({address, path}) {
  if (!path) path = '/'
  const kernel = useKernel(address)
  const [fileListPath, setFileListPath] = useState(path)
  function handleChangePath(path) {
    setFileListPath(path)
    emit('show-path', path)
  }
  return (
    <Container fluid className="d-flex flex-column h-100">
      <Row>
        <Col>
          <Toolbar kernel={kernel} path={fileListPath} />
          <div style={{marginTop: 5}} />
        </Col>
      </Row>
      <Row className="flex-grow-1">
        <Col lg="3">
          <Card className="h-100">
            <CardHeader>Folder Tree</CardHeader>
            <div
              className="flex-grow-1"
              style={{height: 0, padding: 5, overflowY: 'auto'}}
              >
              <FileTree
                kernel={kernel}
                path={path}
                showPath={path}
                selectPath={fileListPath}
                onClickItem={setFileListPath}
              />
            </div>
          </Card>
        </Col>
        <Col lg="9" className="d-flex flex-column">
          <AddressBar path={fileListPath} onChange={handleChangePath} />
          <div
            className="flex-grow-1"
            style={{height: 0, marginTop: 5, overflowY: 'auto'}}
            >
            <FileList
              kernel={kernel}
              path={fileListPath}
              onClickItem={handleChangePath}
            />
          </div>
        </Col>
      </Row>
    </Container>
  )
}

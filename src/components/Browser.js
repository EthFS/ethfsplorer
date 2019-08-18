import React, {useState} from 'react'
import {Container, Row, Col, Card, CardHeader} from 'reactstrap'
import AddressBar from './AddressBar'
import FileList from './FileList'
import FileTree from './FileTree'

export default function Browser({address, path}) {
  if (!path) path = '/'
  const [fileListPath, setFileListPath] = useState(path)
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
                showPath={fileListPath}
                expanded
                onClickItem={setFileListPath}
              />
            </div>
          </Card>
        </Col>
        <Col lg="9">
          <AddressBar path={fileListPath} onChange={setFileListPath} />
          <div style={{marginTop: 5}} />
          <FileList address={address} path={fileListPath} />
        </Col>
      </Row>
    </Container>
  )
}

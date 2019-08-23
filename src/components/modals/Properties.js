import * as Path from 'path'
import errno from 'errno'
import moment from 'moment'
import React, {useState} from 'react'
import {Row, Col, Form, FormGroup, Input, Label} from 'reactstrap'
import {useAsync} from 'react-async-hook'
import {utf8ToHex} from 'web3-utils'
import Modal from './Modal'
import {fileSize} from '../../utils/files'
import {useKernel} from '../../web3/kernel'

export default function Properties({address, path, isOpen, toggle}) {
  const kernel = useKernel(address)
  const [stat, setStat] = useState({})
  const [mode, setMode] = useState(0)
  const [error, setError] = useState()
  useAsync(async () => {
    if (!kernel) return
    try {
      const stat = await kernel.stat(utf8ToHex(path))
      setStat(stat)
      setMode(stat.mode)
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
    }
  }, [kernel, path])
  let type
  switch (Number(stat.fileType)) {
    case 1:
      type = 'Regular file'
      break
    case 2:
      type = 'Directory'
      break
    case 3:
      type = 'Symbolic link'
      break
  }
  return (
    <Modal
      isOpen={isOpen}
      title={`Properties for ${Path.basename(path) || path}`}
      toggle={toggle}
      size="lg"
      >
      <Form>
        <FormGroup>
          <Row>
            <Label sm={4}>Type of file:</Label>
            <Label sm={8}>{type}</Label>
          </Row>
          <Row>
            <Label sm={4}>Location:</Label>
            <Label sm={8}>{Path.dirname(path)}</Label>
          </Row>
          {stat.fileType == 2 ?
            <Row>
              <Label sm={4}>Contains:</Label>
              <Label sm={8}>{Number(stat.entries)} file(s)</Label>
            </Row>
            :
            <Row>
              <Label sm={4}>Size:</Label>
              <Label sm={8}>{fileSize(Number(stat.size))}</Label>
            </Row>
          }
          <Row>
            <Label sm={4}>Last modified:</Label>
            <Label sm={8}>{moment(stat.lastModified * 1e3).format('DD MMMM YYYY HH:mm:ss')}</Label>
          </Row>
        </FormGroup>
        <FormGroup>
          <Row>
            <Label sm={4}>Owner address:</Label>
            <Label sm={8}>{stat.owner}</Label>
          </Row>
          <Row>
            <Label sm={4}>Group address:</Label>
            <Label sm={8}>{stat.group}</Label>
          </Row>
        </FormGroup>
        <FormGroup>
          <Permissions
            label="Owner permissions:"
            mode={mode >> 6 & 7}
            onChange={x => setMode(x<<6 | mode&63)}
          />
          <Permissions
            label="Group permissions:"
            mode={mode >> 3 & 7}
            onChange={x => setMode(x<<3 | mode&455)}
          />
          <Permissions
            label="Other permissions:"
            mode={mode >> 0 & 7}
            onChange={x => setMode(x | mode&504)}
          />
        </FormGroup>
      </Form>
    </Modal>
  )
}

function Permissions({label, mode, onChange}) {
  return (
    <Row style={{padding: '2px 0'}}>
      <Col sm={4}>{label}</Col>
      <Col sm={8}>
        <FormGroup check inline>
          <Label check style={{userSelect: 'none'}}>
            <Input
              type="checkbox"
              checked={(mode & 4) > 0}
              onChange={() => onChange(mode ^ 4)}
            /> Read
          </Label>
        </FormGroup>
        <FormGroup check inline>
          <Label check style={{userSelect: 'none'}}>
            <Input
              type="checkbox"
              checked={(mode & 2) > 0}
              onChange={() => onChange(mode ^ 2)}
            /> Write
          </Label>
        </FormGroup>
        <FormGroup check inline>
          <Label check style={{userSelect: 'none'}}>
            <Input
              type="checkbox"
              checked={(mode & 1) > 0}
              onChange={() => onChange(mode ^ 1)}
            /> Execute
          </Label>
        </FormGroup>
      </Col>
    </Row>
  )
}

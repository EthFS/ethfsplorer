import * as Path from 'path'
import errno from 'errno'
import moment from 'moment'
import React, {useState, useEffect} from 'react'
import {Row, Col, Form, FormGroup, Input, Label, Progress} from 'reactstrap'
import {useAsync} from 'react-async-hook'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import Modal from './Modal'
import {emit} from '../../utils/events'
import {fileSize} from '../../utils/files'
import {useKernel} from '../../web3/kernel'

export default function Properties({address, path, isOpen, toggle}) {
  const kernel = useKernel(address)
  const [stat, setStat] = useState({})
  const [mode, setMode] = useState(0)
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState()
  useEffect(setProgress, [isOpen])
  useAsync(async () => {
    if (!kernel || path === '' || !isOpen) return
    try {
      const stat = await kernel.stat(utf8ToHex(path))
      if (stat.fileType == 3) {
        stat.target = hexToUtf8(await kernel.readlink(utf8ToHex(path)))
      }
      setStat(stat)
      setMode(stat.mode & 511)
    } catch (e) {
      const err = errno.code[e.reason]
      setProgress(100)
      setError(err ? err.description : e.message)
    }
  }, [kernel, path, isOpen])
  let type
  switch (Number(stat.fileType)) {
    case 1:
      type = 'Regular file'
      break
    case 2:
      type = 'Folder'
      break
    case 3:
      type = 'Symbolic link'
      break
  }
  async function handleOk(e) {
    e.preventDefault()
    try {
      setError()
      setProgress(100)
      setProgressText(`Changing mode for ${path}`)
      await kernel.chmod(utf8ToHex(path), mode)
      toggle()
      emit('refresh-path', Path.dirname(path))
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      title={`Properties for ${Path.basename(path) || path}`}
      toggle={toggle}
      onOk={handleOk}
      allowOk={mode !== (stat.mode & 511) && progress === undefined}
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
          {stat.fileType == 3 &&
            <Row>
              <Label sm={4}>Target of symlink:</Label>
              <Label sm={8}>{stat.target}</Label>
            </Row>
          }
          {stat.fileType == 2 ?
            <Row>
              <Label sm={4}>Contains:</Label>
              <Label sm={8}>{stat.entries - 2} file(s)</Label>
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
            disabled={stat.fileType == 3}
          />
          <Permissions
            label="Group permissions:"
            mode={mode >> 3 & 7}
            onChange={x => setMode(x<<3 | mode&455)}
            disabled={stat.fileType == 3}
          />
          <Permissions
            label="Other permissions:"
            mode={mode >> 0 & 7}
            onChange={x => setMode(x | mode&504)}
            disabled={stat.fileType == 3}
          />
        </FormGroup>
      </Form>
      {progress >= 0 && (error ?
        <Progress animated color="danger" value={progress}>{error}</Progress>
        :
        <Progress animated value={progress}>{progressText}</Progress>
      )}
    </Modal>
  )
}

function Permissions({label, mode, onChange, disabled}) {
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
              disabled={disabled}
            /> Read
          </Label>
        </FormGroup>
        <FormGroup check inline>
          <Label check style={{userSelect: 'none'}}>
            <Input
              type="checkbox"
              checked={(mode & 2) > 0}
              onChange={() => onChange(mode ^ 2)}
              disabled={disabled}
            /> Write
          </Label>
        </FormGroup>
        <FormGroup check inline>
          <Label check style={{userSelect: 'none'}}>
            <Input
              type="checkbox"
              checked={(mode & 1) > 0}
              onChange={() => onChange(mode ^ 1)}
              disabled={disabled}
            /> Execute
          </Label>
        </FormGroup>
      </Col>
    </Row>
  )
}

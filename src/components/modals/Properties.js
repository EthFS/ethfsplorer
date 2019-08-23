import * as Path from 'path'
import errno from 'errno'
import moment from 'moment'
import React, {useState} from 'react'
import {Row, Form, FormGroup, Label} from 'reactstrap'
import {useAsync} from 'react-async-hook'
import {utf8ToHex} from 'web3-utils'
import Modal from './Modal'
import {fileSize} from '../../utils/files'
import {useKernel} from '../../web3/kernel'

export default function Properties({address, path, isOpen, toggle}) {
  const kernel = useKernel(address)
  const [stat, setStat] = useState({})
  const [error, setError] = useState()
  useAsync(async () => {
    if (!kernel) return
    try {
      setStat(await kernel.stat(utf8ToHex(path)))
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
      </Form>
    </Modal>
  )
}

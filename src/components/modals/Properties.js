import * as Path from 'path'
import errno from 'errno'
import moment from 'moment'
import React, {useState, useEffect} from 'react'
import {Row, Col, Form, FormGroup, Input, Label, Progress} from 'reactstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEdit} from '@fortawesome/free-solid-svg-icons'
import {useAsync} from 'react-async-hook'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import Modal from './Modal'
import {emit} from '../../utils/events'
import {fileSize} from '../../utils/files'
import useAccounts from '../../web3/accounts'

export default function Properties({kernel, path, isOpen, toggle}) {
  const accounts = useAccounts()
  const [stat, setStat] = useState({})
  const [mode, setMode] = useState(0)
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState()
  const [editOwner, setEditOwner] = useState(false)
  const [editGroup, setEditGroup] = useState(false)
  const [newOwner, setNewOwner] = useState('')
  const [newGroup, setNewGroup] = useState('')

  useEffect(() => {
    setProgress()
    setEditOwner(false)
    setEditGroup(false)
  }, [isOpen])
  const getStat = useAsync(async () => {
    if (!kernel || path === '' || !isOpen) return
    try {
      const stat = await kernel.lstat(utf8ToHex(path))
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
  const isOwner = (accounts[0] || '').toLowerCase() === (stat.owner || '').toLowerCase()
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
  const nullAddress = '0x0000000000000000000000000000000000000000'
  async function handleChangeOwner(e) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        try {
          setError()
          setProgress(100)
          setProgressText(`Changing owner for ${path}`)
          await kernel.chown(utf8ToHex(path), newOwner, nullAddress)
          setEditOwner(false)
          setProgress()
          getStat.execute()
          emit('refresh-path', Path.dirname(path))
        } catch (e) {
          const err = errno.code[e.reason]
          setError(err ? err.description : e.message)
        }
        break
      case 'Escape':
        e.preventDefault()
        setEditOwner(false)
        setProgress()
        break
    }
  }
  async function handleChangeGroup(e) {
    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        try {
          setError()
          setProgress(100)
          setProgressText(`Changing group for ${path}`)
          await kernel.chown(utf8ToHex(path), nullAddress, newGroup)
          setEditGroup(false)
          setProgress()
          getStat.execute()
          emit('refresh-path', Path.dirname(path))
        } catch (e) {
          const err = errno.code[e.reason]
          setError(err ? err.description : e.message)
        }
        break
      case 'Escape':
        e.preventDefault()
        setEditGroup(false)
        setProgress()
        break
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
              <Label sm={4}>Target of symbolic link:</Label>
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
            <Label sm={8}>
              {editOwner ?
                <Input
                  type="text"
                  value={newOwner}
                  placeholder="Enter address"
                  onChange={e => setNewOwner(e.target.value)}
                  onKeyDown={handleChangeOwner}
                  spellCheck="false"
                />
                :
                <>
                  {stat.owner}
                  {isOwner && stat.fileType != 3 &&
                    <FontAwesomeIcon
                      style={{cursor: 'pointer', marginLeft: 10}}
                      icon={faEdit}
                      onClick={() => {
                        setNewOwner(stat.owner)
                        setEditOwner(true)
                      }}
                    />
                  }
                </>
              }
            </Label>
          </Row>
          <Row>
            <Label sm={4}>Group address:</Label>
            <Label sm={8}>
              {editGroup ?
                <Input
                  type="text"
                  value={newGroup}
                  placeholder="Enter address"
                  onChange={e => setNewGroup(e.target.value)}
                  onKeyDown={handleChangeGroup}
                  spellCheck="false"
                />
                :
                <>
                  {stat.group}
                  {isOwner && stat.fileType != 3 &&
                    <FontAwesomeIcon
                      style={{cursor: 'pointer', marginLeft: 10}}
                      icon={faEdit}
                      onClick={() => {
                        setNewGroup(stat.group)
                        setEditGroup(true)
                      }}
                    />
                  }
                </>
              }
            </Label>
          </Row>
        </FormGroup>
        <FormGroup>
          <Permissions
            label="Owner permissions:"
            mode={mode >> 6 & 7}
            onChange={x => setMode(x<<6 | mode&63)}
            disabled={!isOwner || stat.fileType == 3}
          />
          <Permissions
            label="Group permissions:"
            mode={mode >> 3 & 7}
            onChange={x => setMode(x<<3 | mode&455)}
            disabled={!isOwner || stat.fileType == 3}
          />
          <Permissions
            label="Other permissions:"
            mode={mode >> 0 & 7}
            onChange={x => setMode(x | mode&504)}
            disabled={!isOwner || stat.fileType == 3}
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

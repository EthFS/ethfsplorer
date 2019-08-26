import React, {useState, useRef} from 'react'
import {Button, Form, FormGroup, Input, Spinner} from 'reactstrap'
import {useAsync} from 'react-async-hook'
import errno from 'errno'
import {sortedIndexBy} from 'lodash'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import Modal from './Modal'
import Table from '../Table'
import useTrigger from '../../utils/trigger'
import constants from '../../web3/constants'
import write from '../../web3/write'

export default function Xattr({
  kernel, path, setProgress, setProgressText, setError,
}) {
  const [attrs, setAttrs] = useState([])
  const [busy, setBusy] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])
  const getAttrs = useAsync(async () => {
    if (!kernel || path === '') return
    try {
      setBusy(true)
      const attrs = []
      const {fileType, entries} = await kernel.stat(utf8ToHex(path))
      if (fileType == 1) {
        for (let i = 0; i < entries; i++) {
          const name = await kernel.readkeyPath(utf8ToHex(path), i)
          if (!name) continue
          const value = await kernel.readPath(utf8ToHex(path), name)
          if (!value) continue
          const attr = {
            name: hexToUtf8(name),
            value: hexToUtf8(value),
          }
          attrs.splice(sortedIndexBy(attrs, attr, 'name'), 0, attr)
        }
      }
      setAttrs(attrs)
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
      setProgress(100)
    }
    setBusy(false)
  }, [kernel, path])
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState('')
  const [editValue, setEditValue] = useState('')
  function handleAdd() {
    setShowEdit(true)
    setEditName('')
    setEditValue('')
  }
  function handleModify() {
    const selected = selectedRows.map(i => attrs[i]).filter(x => x)
    if (selected.length > 0) {
      const {name, value} = selected[0]
      setShowEdit(true)
      setEditName(name)
      setEditValue(value)
    }
  }
  async function handleSetXattr(name, value) {
    try {
      setError()
      setProgress(100)
      setProgressText(`Opening ${path}`)
      await kernel.open(utf8ToHex(path), constants.O_WRONLY)
      const fd = Number(await kernel.result())
      if (editName !== '' && name !== editName) {
        setProgressText(`Removing ${editName}`)
        await kernel.clear(fd, utf8ToHex(editName))
      }
      if (attrs.find(x => x.name === name)) {
        setProgressText(`Truncating value for ${name}`)
        await kernel.truncate(fd, utf8ToHex(name), 0)
      }
      const buf = Buffer.from(value)
      const [,e] = await write(kernel, fd, utf8ToHex(name), buf, buf.length, x => {
        setProgress(100 * x/buf.length)
        setProgressText(`Setting value for ${name}: ${x} / ${buf.length} bytes`)
      })
      if (e) throw e
      setProgressText(`Closing ${path}`)
      await kernel.close(fd)
      setProgress()
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
    }
    getAttrs.execute()
  }
  async function handleRemove() {
    const selected = selectedRows.map(i => attrs[i]).filter(x => x)
    if (!selected.length) return
    try {
      setError()
      setProgress(100)
      setProgressText(`Opening ${path}`)
      await kernel.open(utf8ToHex(path), constants.O_WRONLY)
      const fd = Number(await kernel.result())
      for (let i = 0; i < selected.length; i++) {
        const {name} = selected[i]
        setProgressText(`Removing ${name}`)
        await kernel.clear(fd, utf8ToHex(name))
      }
      setProgressText(`Closing ${path}`)
      await kernel.close(fd)
      setProgress()
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
    }
    getAttrs.execute()
  }
  const columns = React.useMemo(() => [
    {
      id: 'selection',
      Header: ({getToggleAllRowsSelectedProps}) => (
        <div>
          <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
        </div>
      ),
      Cell: ({row}) => (
        <div>
          <input type="checkbox" {...row.getToggleRowSelectedProps()} />
        </div>
      ),
    },
    {Header: 'Name', accessor: 'name'},
    {Header: 'Value', accessor: 'value'},
  ], [path, attrs])
  return (
    <Form>
      <div style={{marginBottom: 10, maxHeight: '45vh', overflowY: 'auto'}}>
        <Table columns={columns} data={attrs} setSelectedRows={setSelectedRows} />
      </div>
      <FormGroup className="d-flex align-items-center">
        <Button color="primary" onClick={handleAdd}>
          Add
        </Button>
        <div style={{marginLeft: 5}} />
        <Button color="secondary" onClick={handleModify} disabled={!selectedRows.length}>
          Modify
        </Button>
        <div style={{marginLeft: 5}} />
        <Button color="danger" onClick={handleRemove} disabled={!selectedRows.length}>
          Remove
        </Button>
        <div style={{marginLeft: 5}} />
        {busy && <Spinner color="secondary" />}
      </FormGroup>
      <SetXattr
        isOpen={showEdit}
        toggle={() => setShowEdit()}
        name={editName}
        value={editValue}
        onOk={handleSetXattr}
      />
    </Form>
  )
}

function SetXattr({isOpen, toggle, name, value, onOk}) {
  const [newName, setNewName] = useState('')
  const [newValue, setNewValue] = useState('')
  const input = useRef()
  useTrigger(isOpen, () => {
    setNewName(name)
    setNewValue(value)
    input.current.focus()
  })
  function handleOk(e) {
    e.preventDefault()
    if (!allowOk()) return
    toggle()
    onOk(newName, newValue)
  }
  function allowOk() {
    return newName !== '' && newValue !== '' &&
      (newName !== name || newValue !== value)
  }
  return (
    <Modal
      isOpen={isOpen}
      title="Set Extended Attribute"
      toggle={toggle}
      onOk={handleOk}
      allowOk={allowOk()}
      >
      <Form onSubmit={handleOk}>
        <FormGroup>
          <Input
            innerRef={input}
            type="text"
            value={newName}
            placeholder="Enter name"
            onChange={e => setNewName(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && handleOk(e)}
            spellCheck="false"
          />
        </FormGroup>
        <FormGroup>
          <Input
            type="text"
            value={newValue}
            placeholder="Enter value"
            onChange={e => setNewValue(e.target.value)}
            onKeyUp={e => e.key === 'Enter' && handleOk(e)}
            spellCheck="false"
          />
        </FormGroup>
      </Form>
    </Modal>
  )
}

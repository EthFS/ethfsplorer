import React, {useState} from 'react'
import {Button} from 'reactstrap'
import {useAsync} from 'react-async-hook'
import {sortedIndexBy} from 'lodash'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import Table from '../Table'

export default function Xattr({
  kernel, path, setProgress, setProgressText, setError,
}) {
  const [attrs, setAttrs] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  useAsync(async () => {
    if (!kernel || path === '') return
    try {
      setProgress()
      const attrs = []
      const {fileType, entries} = await kernel.stat(utf8ToHex(path))
      if (fileType == 1) {
        for (let i = 0; i < entries; i++) {
          const name = await kernel.readkeyPath(utf8ToHex(path), i)
          if (!name) continue
          const value = await kernel.readPath(utf8ToHex(path), name)
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
      setProgress(100)
      setError(err ? err.description : e.message)
    }
  }, [kernel, path])
  async function handleAdd() {
  }
  async function handleChange() {
  }
  async function handleRemove() {
  }
  const columns = React.useMemo(() => [
    {
      id: 'selection',
      Header: ({ getToggleAllRowsSelectedProps }) => (
        <div>
          <input type="checkbox" {...getToggleAllRowsSelectedProps()} />
        </div>
      ),
      Cell: ({ row }) => (
        <div>
          <input type="checkbox" {...row.getToggleRowSelectedProps()} />
        </div>
      ),
    },
    {Header: 'Name', accessor: 'name'},
    {Header: 'Value', accessor: 'value'},
  ], [path, attrs])
  return (
    <>
      <Table columns={columns} data={attrs} setSelectedRows={setSelectedRows} />
      <Button color="primary" onClick={handleAdd}>
        Add
      </Button>{' '}
      <Button color="secondary" onClick={handleChange} disabled={!selectedRows.length}>
        Change
      </Button>{' '}
      <Button color="danger" onClick={handleRemove} disabled={!selectedRows.length}>
        Remove
      </Button>
    </>
  )
}

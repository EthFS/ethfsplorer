import React, {useState, useEffect} from 'react'
import {useAsync} from 'react-async-hook'
import styled from 'styled-components'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faSpinner} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import {utf8ToHex, hexToUtf8} from 'web3-utils'
import Table from './Table'
import {useKernel} from '../web3/kernel'

export default function FileList({address, path}) {
  const kernel = useKernel(address)
  const [files, setFiles] = useState([])
  useAsync(async () => {
    if (!kernel) return
    setFiles([])
    const {entries} = await kernel.stat(utf8ToHex(path))
    const dirs = [], dotdirs = []
    const files = [], dotfiles = []
    for (let i = 0; i < entries; i++) {
      const name = hexToUtf8(await kernel.readkeyPath(utf8ToHex(path), i))
      const stat = await kernel.stat(utf8ToHex(`${path}/${name}`))
      const size = stat.fileType == 2 ? '-' : Number(stat.size)
      const lastModified = moment(stat.lastModified * 1e3).format('DD MMM YYYY HH:mm')
      let arr
      if (stat.fileType == 2) {
        arr = name[0] === '.' ? dotdirs : dirs
      } else {
        arr = name[0] === '.' ? dotfiles : files
      }
      arr.push({name, ...stat, size, lastModified})
    }
    setFiles(
      dotdirs.sort()
        .concat(dirs.sort())
        .concat(dotfiles.sort())
        .concat(files.sort())
    )
  }, [kernel, path])
  const columns = React.useMemo(() => [
    {Header: 'Name', accessor: 'name'},
    {Header: 'Owner', accessor: x => `${x.owner.slice(0, 12)}…`},
    {Header: 'Group', accessor: x => `${x.group.slice(0, 12)}…`},
    {Header: 'Size', accessor: 'size'},
    {Header: 'Last modified', accessor: 'lastModified'},
  ], [])
  return (
    <div>
      <Styles>
        <Table columns={columns} data={files} />
      </Styles>
      <div className="text-center">
        {!files.length &&
          <FontAwesomeIcon icon={faSpinner} spin />
        }
      </div>
    </div>
  )
}

const Styles = styled.div`
  padding: 1rem;
  table {
    border-spacing: 0;
    border: 1px solid black;
    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }
    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
      }
    }
  }
`

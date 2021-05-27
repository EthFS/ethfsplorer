import React from 'react'
import {useTable, useRowSelect} from 'react-table'
import {Table} from 'reactstrap'

export default function({columns, data, setSelectedRows}) {
  const {
    getTableProps,
    headerGroups,
    rows,
    prepareRow,
    state: {selectedRowIds},
  } = useTable({columns, data}, useRowSelect)
  if (setSelectedRows) setSelectedRows(selectedRowIds)
  return (
    <Table size="sm" hover responsive {...getTableProps()}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {rows.map(
          (row, i) => prepareRow(row) || (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          )
        )}
      </tbody>
    </Table>
  )
}

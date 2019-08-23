import * as Path from 'path'
import React, {useState, useEffect, useRef} from 'react'
import {Form, FormGroup, Input, Progress} from 'reactstrap'
import Modal from './Modal'
import {useKernel} from '../../web3/kernel'
import {utf8ToHex} from 'web3-utils'
import errno from 'errno'
import {emit} from '../../utils/events'
import useTrigger from '../../utils/trigger'

export default function Rename({address, path, isOpen, toggle}) {
  const [newPath, setNewPath] = useState('')
  const [progress, setProgress] = useState()
  const [progressText, setProgressText] = useState('')
  const [error, setError] = useState()
  const kernel = useKernel(address)
  const input = useRef()
  useEffect(() => {
    if (!isOpen) return
    setNewPath(path)
    setProgress()
  }, [isOpen])
  useTrigger(isOpen, () => {
    const {length} = Path.basename(path)
    input.current.setSelectionRange(path.length-length, path.length)
    input.current.focus()
  })
  function pathToAbsolute(path2) {
    if (!Path.isAbsolute(path2)) {
      path2 = Path.join(Path.dirname(path), path2)
    }
    return Path.normalize(path2)
  }
  async function handleOk(e) {
    e.preventDefault()
    if (newPath === '') return
    const path2 = pathToAbsolute(newPath)
    if (path2 === path) return
    try {
      setError()
      setProgress(100)
      setProgressText(`Renaming ${path} to ${path2}`)
      await kernel.move(utf8ToHex(path), utf8ToHex(path2))
      toggle()
      emit('refresh-path', Path.dirname(path))
    } catch (e) {
      const err = errno.code[e.reason]
      setError(err ? err.description : e.message)
      setTimeout(setProgress, 3e3)
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      title="Rename"
      toggle={toggle}
      onOk={handleOk}
      allowOk={
        newPath !== '' &&
        pathToAbsolute(newPath) !== path &&
        progress === undefined
      }>
      <Form onSubmit={handleOk}>
        <FormGroup>
          <Input
            innerRef={input}
            type="text"
            value={newPath}
            placeholder="Enter new name"
            onChange={e => {
              setNewPath(e.target.value)
              setError('')
            }}
            spellCheck="false"
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

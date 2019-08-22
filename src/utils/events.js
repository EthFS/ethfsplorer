import {useEffect} from 'react'
import EventEmitter from 'events'

const ee = new EventEmitter()
ee.setMaxListeners(1000)

export function emit(name, ...args) {
  ee.emit(name, ...args)
}

export function useEvent(name, cb, deps) {
  useEffect(() => {
    ee.on(name, cb)
    return () => ee.off(name, cb)
  }, [name, ...deps])
}

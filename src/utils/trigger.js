import {useState, useEffect} from 'react'

export default function useTrigger(value, cb) {
  const [trigger, setTrigger] = useState()
  useEffect(() => {
    value && setTrigger(true)
  }, [value])
  useEffect(() => {
    if (!trigger) return
    setTrigger()
    cb()
  })
}

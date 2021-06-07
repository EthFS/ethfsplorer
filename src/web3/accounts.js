import {useState, useEffect} from 'react'
import {useAsync} from 'react-async-hook'

export default function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const {ethereum} = window
  useAsync(async () => {
    setAccounts(await ethereum.request({method: 'eth_requestAccounts'}))
  }, [ethereum])
  useEffect(() => {
    if (ethereum && ethereum.on) {
      ethereum.on('accountsChanged', setAccounts)
      return () => ethereum.off('accountsChanged', setAccounts)
    }
  }, [ethereum])
  return accounts
}

import {useState, useEffect} from 'react'
import {useAsync} from 'react-async-hook'
import Eth from 'web3-eth'

export default function useAccounts() {
  const [accounts, setAccounts] = useState([])
  useAsync(async () => {
    const eth = new Eth(ethereum || web3.currentProvider)
    if (ethereum) await ethereum.enable()
    setAccounts(await eth.getAccounts())
  }, [ethereum, web3])
  useEffect(() => {
    if (ethereum) {
      ethereum.on('accountsChanged', setAccounts)
      return () => ethereum.off('accountsChanged', setAccounts)
    }
  }, [ethereum])
  return accounts
}

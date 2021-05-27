import {useState, useEffect} from 'react'
import {useAsync} from 'react-async-hook'
import Eth from 'web3-eth'

export default function useAccounts() {
  const [accounts, setAccounts] = useState([])
  const {ethereum, web3} = window
  useAsync(async () => {
    if (ethereum) {
      setAccounts(await ethereum.request({method: 'eth_requestAccounts'}))
    } else {
      const eth = new Eth(web3.currentProvider)
      setAccounts(await eth.getAccounts())
    }
  }, [ethereum, web3])
  useEffect(() => {
    if (ethereum && ethereum.on) {
      ethereum.on('accountsChanged', setAccounts)
      return () => ethereum.off('accountsChanged', setAccounts)
    }
  }, [ethereum])
  return accounts
}

import {useState} from 'react'
import {useAsync} from 'react-async-hook'
import contract from '@truffle/contract'
import useAccounts from './accounts'

export default function useKernel(address) {
  const accounts = useAccounts()
  const [kernel, setKernel] = useState()
  const {ethereum, web3} = window
  useAsync(async () => {
    if (!accounts.length) return
    const Kernel = contract({abi: require('./Kernel.abi')})
    Kernel.setProvider(ethereum || web3.currentProvider)
    Kernel.defaults({from: accounts[0]})
    setKernel(await Kernel.at(address))
  }, [address, accounts, ethereum, web3])
  return kernel
}

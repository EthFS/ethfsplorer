import {useState} from 'react'
import {useAsync} from 'react-async-hook'
import {Contract} from '@ethersproject/contracts'
import {Web3Provider} from '@ethersproject/providers'
import useAccounts from './accounts'

export default function useKernel(address) {
  const accounts = useAccounts()
  const [kernel, setKernel] = useState()
  const {ethereum} = window
  useAsync(async () => {
    if (!accounts.length) return
    const provider = new Web3Provider(ethereum)
    setKernel(new Contract(address, require('./Kernel.abi'), provider.getSigner()))
  }, [address, accounts, ethereum])
  return kernel
}

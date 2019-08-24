import {useState} from 'react'
import {useAsync} from 'react-async-hook'
import contract from 'truffle-contract'
import useAccounts from './accounts'

export default function useKernel(address) {
  const accounts = useAccounts()
  const [kernel, setKernel] = useState()
  useAsync(async () => {
    const Kernel = contract(require('../../artifacts/Kernel'))
    Kernel.setProvider(ethereum)
    await ethereum.enable()
    Kernel.defaults({from: accounts[0]})
    setKernel(await Kernel.at(address))
  }, [address, accounts, ethereum])
  return kernel
}

import {useState} from 'react'
import {useAsync} from 'react-async-hook'
import contract from 'truffle-contract'

export function useKernel(address) {
  const [kernel, setKernel] = useState()
  useAsync(async () => {
    const Kernel = contract(require('../../artifacts/Kernel'))
    Kernel.setProvider(ethereum)
    await ethereum.enable()
    setKernel(await Kernel.at(address))
  }, [address, ethereum])
  return kernel
}

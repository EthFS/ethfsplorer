import {useState, useEffect} from 'react'
import contract from 'truffle-contract'

export function useKernel(address) {
  const [kernel, setKernel] = useState()
  useEffect(() => {
    (async () => {
      const Kernel = contract(require('../../artifacts/Kernel'))
      Kernel.setProvider(ethereum)
      await ethereum.enable()
      setKernel(await Kernel.at(address))
    })()
  }, [address, ethereum])
  return kernel
}

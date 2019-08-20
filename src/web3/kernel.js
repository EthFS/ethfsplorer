import {useState} from 'react'
import {useAsync} from 'react-async-hook'
import contract from 'truffle-contract'

export function useKernel(address) {
  const [kernel, setKernel] = useState()
  useAsync(async () => {
    let kernel = getCache(address)
    if (kernel) return setKernel(kernel)
    const Kernel = contract(require('../../artifacts/Kernel'))
    Kernel.setProvider(ethereum)
    await ethereum.enable()
    const accounts = await Kernel.web3.eth.getAccounts()
    Kernel.defaults({from: accounts[0]})
    kernel = await Kernel.at(address)
    setKernel(kernel)
    setCache(address, kernel)
  }, [address, ethereum])
  return kernel
}

const cache = {}

function getCache(address) {
  if (cache.address === address && cache.ethereum === ethereum) {
    return cache.kernel
  }
}

function setCache(address, kernel) {
  cache.address = address
  cache.ethereum = ethereum
  cache.kernel = kernel
}

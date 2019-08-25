import React from 'react'
import {render} from 'react-dom'
import Explorer from './components/Explorer'

import 'bootstrap/dist/css/bootstrap.min.css'

const urlParams = new URLSearchParams(window.location.search)
const address = urlParams.get('address')

render(
  <div style={{height: '100vh', padding: 5}}>
    <Explorer address={address} />
  </div>
, document.getElementById('root'))

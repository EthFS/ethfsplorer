import React from 'react'
import {render} from 'react-dom'
import Browser from './components/Browser'

import 'bootstrap/dist/css/bootstrap.min'
import './styles/react-contextmenu'

const urlParams = new URLSearchParams(window.location.search)
const address = urlParams.get('address')

render(
  <div style={{height: '100vh', padding: 5}}>
    <Browser address={address} />
  </div>
, document.getElementById('root'))

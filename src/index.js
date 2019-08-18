import React from 'react'
import {render} from 'react-dom'
import Browser from './components/Browser'

import 'bootstrap/dist/css/bootstrap.min'

render(
  <div style={{height: '100vh'}}>
    <Browser
      address="0x16e52740255BE996B78b2E8E97bCa7907d8E92F3"
    />
  </div>
, document.getElementById('root'))

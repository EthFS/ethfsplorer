import React from 'react'
import {render} from 'react-dom'
import Explorer from './components/Explorer'

import 'bootstrap/dist/css/bootstrap.min.css'

const urlParams = new URLSearchParams(location.search)
const address = urlParams.get('address')

render(
  <div className="vh-100 py-1">
    <Explorer address={address} />
  </div>
, document.getElementById('root'))

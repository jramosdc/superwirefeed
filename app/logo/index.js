'use strict'

import React, { Component } from 'react'
import ReactSVG from 'react-svg'

class Logo extends Component {
  render () {
    return (
      <a className="logo">
        <ReactSVG path="assets/icons/logo.svg" />
      </a>
    )
  }
}

export default Logo

'use strict'

import React, { Component } from 'react'

import Logo from '../logo'

class Header extends Component {
  render () {
    return (
      <header className="header | flexible row | padding-large">
        <span className="brand | cell">
          <Logo />
          <span className="slogan">Share knowledge, clear the noise, monetize.</span>
        </span>
        <div className="cell | align-right">
          <button className="button">Login</button>
          <button className="button linear">Sign up for free</button>
        </div>
      </header>
    )
  }
}

export default Header

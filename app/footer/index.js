'use strict'

import React, { Component } from 'react'
import Logo from '../logo'

class Footer extends Component {
  render () {
    return (
      <footer className="footer">
        <section className="horizontal center">
          <div className="standard row">
            <span className="cell cell-3">
              Copyright © 2016-2017 Superwire
            </span>
            <span className="cell cell-3 | align-center">
              <Logo />
            </span>
            <nav className="cell cell-3 | align-right">
              <a>About</a>
              <a>Press</a>
              <a>Blog</a>
              <a>Careers</a>
              <a>Contact</a>
            </nav>
          </div>
        </section>
      </footer>
    )
  }
}

export default Footer

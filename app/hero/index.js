'use strict'

import React, { Component } from 'react'
import ReactSVG from 'react-svg'

import Header from '../header'

class Hero extends Component {
  render () {
    return (
      <section className="hero">
        <span className="gradient" />

        <section className="horizontal center">
          <Header />

          <section className="welcome flexible row | padding-large">
            <div className="cell cell-3">
              <h1>A Content Ecosystem For Busy People</h1>
              <h4>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s…</h4>
            </div>
            <div className="cell cell-2 star">
              <ReactSVG path="assets/star.svg" />
            </div>
          </section>

          <footer className="row font-size-h5">
            <nav className="row">
              <a className="cell">Features</a>
              <a className="cell">Explore</a>
              <a className="cell">Monetization</a>
              <a className="cell">News</a>
            </nav>
          </footer>
        </section>
      </section>
    )
  }
}

export default Hero

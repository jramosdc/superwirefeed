'use strict'

require('./style.css')

import React, { Component } from 'react'
import { render } from 'react-dom'
import ReactSVG from 'react-svg'

import Hero from './hero'
import Footer from './footer'

class ContentCreator extends Component {
  render () {
    var { props } = this
    return (
      <a className="cell cell-5">
        <img src={ props.src } />
        <h4>{ props.title }</h4>
        <p>{ props.profession}</p>
        <p>{ props.company }</p>
      </a>
    )
  }
}

class Partner extends Component {
  render () {
    var { props } = this
    return (
      <a className="cell cell-3">
        <img src={ props.src } title={ props.title } />
      </a>
    )
  }
}

class Advisor extends Component {
  render () {
    var { props } = this
    return (
      <a className="cell cell-3">
        <h4>{ props.title }</h4>
        <p>Advisor</p>
      </a>
    )
  }
}

class Landing extends Component {
  render () {
    var { props } = this

    var contentCreators = []
    props.contentCreators.forEach((value, key) => {
      contentCreators.push(<ContentCreator key={key} {...value} />)
    })

    var partners = []
    props.partners.forEach((value, key) => {
      partners.push(<Partner key={key} {...value} /> )
    })

    var advisors = []
    props.advisors.forEach((value, key) => {
      advisors.push(<Advisor key={key} {...value} /> )
    })

    return (
      <div>
        <Hero />

        <section className="horizontal center">
          <section className="how-it-works section | align-center">
            <h1>This is how it works</h1>

            <div className="standard row | padding-large">
              <div className="cell cell-3">
                <h4>Content Creator</h4>
                <p>You post your best content, Promote it, Choose license and sell or share accordingly. Track publication</p>
              </div>

              <div className="cell cell-3">
                <h4>Consumer</h4>
                <p>Explore the best content, read reviews, buy, leave a review. Post something too to gain credits</p>
              </div>

              <div className="cell cell-3">
                <h4>Corporation</h4>
                <p>Explore the best content, read reviews, buy, leave a review. Post something too to gain credits</p>
              </div>
            </div>
          </section>

          <section className="why-its-great section | align-center">
            <h1>Superwire is great for</h1>

            <div className="standard row | padding-large">
              <div className="cell cell-5">
                <ReactSVG path="assets/icons/researchers.svg" />
                <h4>Researchers</h4>
                <p>Lorem ipsum dolor sit amet</p>
              </div>

              <div className="cell cell-5">
                <ReactSVG path="assets/icons/journalists.svg" />
                <h4>Journalists</h4>
                <p>Lorem ipsum dolor sit amet</p>
              </div>

              <div className="cell cell-5">
                <ReactSVG path="assets/icons/corporations.svg" />
                <h4>Corporations</h4>
                <p>Lorem ipsum dolor sit amet</p>
              </div>

              <div className="cell cell-5">
                <ReactSVG path="assets/icons/students.svg" />
                <h4>Students</h4>
                <p>Lorem ipsum dolor sit amet</p>
              </div>

              <div className="cell cell-5">
                <ReactSVG path="assets/icons/managers.svg" />
                <h4>Managers</h4>
                <p>Lorem ipsum dolor sit amet</p>
              </div>
            </div>

            <a className="more">Find your community <ReactSVG path="assets/icons/arrow-right.svg" /></a>
          </section>

          <section className="content-creators section | align-center">
            <h1>Meet our popular content creators</h1>

            <div className="standard row">
              { contentCreators }
            </div>

            <a className="more">Sign up to see all of them <ReactSVG path="assets/icons/arrow-right.svg" /></a>
          </section>

          <section className="partners section | align-center">
            <h1>Meet our partners and advisors</h1>
            <div className="standard row">
              { partners } </div>
            <div className="standard row">
              { advisors } </div>
          </section>
        </section>

        <Footer />
      </div>
    )
  }
}

Landing.defaultProps = {
  contentCreators: [{
    src: 'assets/content/avatar.png',
    title: 'Vicky Gao',
    profession: 'User Experience Designer',
    company: 'LinkedIn'
  }, {
    src: 'assets/content/avatar2.png',
    title: 'Rob Gill',
    profession: 'UX Manager',
    company: 'PerformGroup'
  }, {
    src: 'assets/content/avatar3.png',
    title: 'Quincy Larson',
    profession: 'Teacher',
    company: 'FreeCodeCamp.com'
  }, {
    src: 'assets/content/avatar4.png',
    title: 'Mack Flavelle',
    profession: 'Instigator',
    company: 'Axiom Zen'
  }, {
    src: 'assets/content/avatar5.png',
    title: 'Vivian Cromwell',
    profession: 'Mobile software developer',
    company: 'SMB'
  }],

  partners: [{
    src: 'assets/content/videona.png',
    title: 'Videona',
    href: ''
  }, {
    src: 'assets/content/creativechain.png',
    title: 'Creativechain',
    href: ''
  }, {
    src: 'assets/content/elpais.png',
    title: 'El Pais',
    href: ''
  }, {
    src: 'assets/content/vizzuality.png',
    title: 'Vizzuality',
    href: ''
  }],

  advisors: [{
    title: 'Antonio Moneo',
    href: ''
  }, {
    title: 'Alejandro Lozano',
    href: ''
  }, {
    title: 'Ciro Acedo',
    href: ''
  }]
}

render(
  <Landing />,
  document.getElementById('root')
)

export default Landing

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

class Feed extends Component {
  render () {
    var { props, key} = this
    return (
      <div className="feed">
        <img src={ props.poster + '?random' } />
        <section className="description">
          <h5>{ props.title }</h5>
          <p>{ props.description }</p>
        </section>
        <section>
          <p>Posts</p>
          <h3>{ props.posts }</h3>
        </section>
        <section>
          <p>Followers</p>
          <h3>{ props.followers }</h3>
        </section>
        <section className="user">
          <img src={ props.avatar } />
          <h6>{ props.author }</h6>
          <p>{ props.authorType }</p>
        </section>
      </div>
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
      <a className="cell cell-3" href={ props.href }>
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

    var feeds = []
    props.feeds.forEach((value, key) => {
      feeds.push(<Feed key={key} {...value} /> )
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

          <section className="feeds section | align-center">
            <h1>Sneak peek at our feeds</h1>

            { feeds }

            <a className="more">Explore all feeds <ReactSVG path="assets/icons/arrow-right.svg" /></a>
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
            <div className="standard row">{ partners }</div>
            <div className="standard row">{ advisors }</div>
          </section>

          <section className="signup section | align-center">
            <h1>Become our member</h1>
            <p>Signing up in Superwire is easy and free. You only get valuable information and loose nothing.</p>

            <form>
              <input placeholder="Username" />
              <input placeholder="Your email" />
              <input placeholder="Password" />

              <button>SIGN UP</button>
              <a>Read more about our terms and conditions</a>
            </form>
          </section>
        </section>

        <Footer />
      </div>
    )
  }
}

Landing.defaultProps = {
  feeds: [{
    poster: 'https://cl.ly/372j2r1Z472E/echo23_vab.png',
    title: 'ECHOSTAR XXIII',
    description: 'SpaceX designs, manufactures and launches advanced rockets and spacecraft',
    posts: 11,
    followers: 1023,
    avatar: 'https://cl.ly/3t3B2y12322Q/avatar.png',
    author: 'SpaceX',
    authorType: 'Tocket Road'
  }, {
    poster: 'https://cl.ly/2Y432V19003c/Bitmap.png',
    title: 'Launchpad Accelerator',
    description: 'Launchpad Accelerator is a program to empower founders by supporting their startups through mentorship and equity-free support. The Accelerator leverages all that Google has to offer, to help participating tech startups reach their true potential.',
    posts: 9,
    followers: 998,
    avatar: 'https://cl.ly/3p371I092K2v/avatar.png',
    author: 'Google Devs',
    authorType: 'Mentoring startups'
  }, {
    poster: 'https://cl.ly/0M3J183f450J/Bitmap.png',
    title: 'ECHOSTAR XXIII',
    description: 'SpaceX designs, manufactures and launches advanced rockets and spacecraft',
    posts: 11,
    followers: 1023,
    avatar: 'https://cl.ly/3t3B2y12322Q/avatar.png',
    author: 'SpaceX',
    authorType: 'Tocket Road'
  }],
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
    href: 'http://videona.es/'
  }, {
    src: 'assets/content/creativechain.png',
    title: 'Creativechain',
    href: 'http://videona.es/'
  }, {
    src: 'assets/content/elpais.png',
    title: 'El Pais',
    href: 'http://elpais.com/'
  }, {
    src: 'assets/content/vizzuality.png',
    title: 'Vizzuality',
    href: 'http://www.vizzuality.com/'
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

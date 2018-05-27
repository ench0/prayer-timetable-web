import React, { Component } from 'react'
import PropTypes from 'prop-types'

import defsettings from '../settings.json'

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      settings: { title: '' } || defsettings
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.settings !== this.state.settings && nextProps.settings !== null) {
      this.setState({ settings: nextProps.settings })
    }
  }

  render() {
    return (
      <div className="Header">
        <div />
        <div className="center">{this.state.settings.title}</div>
        <div />
      </div>
    )
  }
}

Header.propTypes = {
  settings: PropTypes.object
}

export default Header

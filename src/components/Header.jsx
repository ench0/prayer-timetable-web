import React, { Component } from 'react'
import PropTypes from 'prop-types'

import defsettings from '../settings.json'
import mainLogo from '../style/img/logo.svg'
import switchOn from '../style/img/switchOn.svg'
import switchOff from '../style/img/switchOff.svg'

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      settings: { title: '' } || defsettings,
      jamaahShow: this.props.jamaahShow
    }
    this.sendData = this.props.sendData.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.settings !== this.state.settings && nextProps.settings !== null) {
      this.setState({ settings: nextProps.settings })
    }
    if (nextProps.jamaahShow !== this.state.jamaahShow && nextProps.jamaahShow !== null) {
      this.setState({ jamaahShow: nextProps.jamaahShow })
    }
  }

  render() {
    let jamaahShow
    if (this.state.jamaahShow) {
      jamaahShow = (
        <div
          className="left"
          style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
          onClick={() => this.sendData(false)}
        >
          <img src={switchOn} className="switchOn" alt="switchOn" /> <span>jamaah</span>
        </div>
      )
    } else {
      jamaahShow = (
        <div
          style={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}
          onClick={() => this.sendData(true)}
        >
          <img src={switchOff} className="switchOff" alt="switchOff" /> jamaah
        </div>
      )
    }

    return (
      <div className="Header">
        {jamaahShow}
        <div className="center">{this.state.settings.title}</div>
        <div className="right">
          <img src={mainLogo} className="logo" alt="logo" />
        </div>
      </div>
    )
  }
}

Header.propTypes = {
  settings: PropTypes.object
}

export default Header

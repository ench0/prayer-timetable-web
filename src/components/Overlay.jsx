import React, { Component } from 'react'
import PropTypes from 'prop-types'

// import logo from './logo.svg';
// import './App.css';
import moment from 'moment-hijri'
// import settings from '../settings.json'

class Overlay extends Component {
  constructor(props) {
    super(props)

    this.state = {
      // day: this.props.day,
      //   overlayActive: false,
      overlayTitle: ' ... '
    }
  }

  componentWillMount() {
    // this.setState({
    //   overlayActive: false
    // })
  }

  componentDidMount() {}

  componentWillUnmount() {}

  componentWillReceiveProps(nextProps) {
    // if (nextProps.day !== this.state.day) {
    //   this.setState({ day: nextProps.day })
    // }
    // if (nextProps.overlayActive !== this.state.overlayActive) {
    //   this.setState({ overlayActive: nextProps.overlayActive })
    // }
    if (nextProps.overlayTitle !== this.state.overlayTitle) {
      this.setState({ overlayTitle: nextProps.overlayTitle })
    }
    // console.log(nextProps.overlayActive)
    // console.log(this.state.overlayActive)
  }

  render() {
    // let overlayActive
    // console.log(this.state.overlayActive)
    // if (this.state.overlayActive) overlayActive = 'Overlay overlayActive'
    // else overlayActive = 'Overlay'
    return (
      // <div className={overlayActive}>
      <div className={'Overlay overlayActive'}>
        {/* <div>{this.state.day.gregorian}</div>
        <div>{this.state.day.hijri}</div> */}
        <div>{moment().format('dddd, DD MMMM YYYY')}</div>
        <div>{moment().format('iDD iMMMM iYYYY')}</div>
        <h1>{this.state.overlayTitle}</h1>
        {/* <div>{this.state.settings.body}</div> */}
        {/* <marquee behavior="scroll" direction="up" className="marquee" scrolldelay="300">{this.state.settings.body}</marquee> */}
      </div>
    )
  }
}

Overlay.propTypes = {
  settings: PropTypes.object,
  day: PropTypes.object,
  title: PropTypes.string,
  overlayActive: PropTypes.bool
}

export default Overlay

import React, { Component } from 'react'

import moment from 'moment-hijri'
import momenttz from 'moment-timezone'

import './style/normalize.css'
import './style/App.css'

import Overlay from './components/Overlay'
import Clock from './components/Clock'
import Timetable from './components/Timetable'
import Countdown from './components/Countdown'
import Message from './components/Message'
import Header from './components/Header'
import Footer from './components/Footer'

// moment.tz = require('moment-timezone');
import defsettings from './settings.json'
import deftimetable from './cities/dublin.json'

class TimetableApp extends Component {
  constructor (props) {
    super(props)

    this.state = {
      timetable: deftimetable,
      // settings: { join: '' },
      settings: defsettings,
      dst: 0,
      date: new Date(),
      day: {},
      prayers: { next: { time: moment(), name: '' }, current: { time: moment(), name: '' }, list: [] },
      tomorrow: 0,
      name: '',
      jamaahShow: true,
      overlayActive: false,
      overlayTitle: ' ... ',
      jummuahTime: moment({ hour: '13', minute: '10' }).day(5),
      taraweehTime: moment({ hour: '22', minute: '00' }), // .iMonth(8),
      refresh: this.props.refresh || 60,
      timePeriod: '',
      join: '1'
    }
  }

  /**********************************************************************
  STATES
  **********************************************************************/
  async componentWillMount () {
    this.prayersCalc()

    document.title = 'ICCI Timetable'
    try {
      if (await localStorage.getItem('settings') !== 'undefined') {
        var newsettings = await JSON.parse(localStorage.getItem('settings'))
      }
      if (await localStorage.getItem('timetable') !== 'undefined') {
        var newtimetable = await JSON.parse(localStorage.getItem('timetable'))
      }
      // await this.setState({ settings: newsettings, timetable: newtimetable, join: newsettings.join })
      await this.setState({ settings: newsettings, timetable: newtimetable })
    } catch (error) {
      console.log(error)
    }

    this.setState({
      prayers: this.prayersCalc(this.state.tomorrow),
      day: this.dayCalc(this.state.tomorrow)
    })
  }

  async componentDidMount () {
    await this.update()

    this.timerID = setInterval(
      () => this.tick(),
      1000
    )
    this.updateID = setInterval(
      () => this.update(),
      this.state.refresh * 60 * 1000

    )
  }

  componentWillUnmount () {
    clearInterval(this.timerID)
    clearInterval(this.updateID)
  }

  /**********************************************************************
  CALCULATIONS
  **********************************************************************/

  /* JAMAAH CALC */
  jamaahCalc (num, time, timenext) {
    const jamaahMethodSetting = this.state.settings.jamaahmethods[num]
    const jamaahOffsetSetting = this.state.settings.jamaahoffsets[num]

    let jamaahOffset
    switch (jamaahMethodSetting) {
      case 'afterthis':
        jamaahOffset = parseInt(jamaahOffsetSetting[0] * 60 + jamaahOffsetSetting[1], 10)
        break
      case 'fixed':
        jamaahOffset = (moment().month(time.get('month')).date(time.get('date')).hour(jamaahOffsetSetting[0])
          .minute(jamaahOffsetSetting[1]))
          .diff(time, 'minutes')
        if (moment().month(time.get('month')).date(time.get('date')).hour(jamaahOffsetSetting[0])
          .minute(jamaahOffsetSetting[1])
          .isBefore(time)) jamaahOffset--
        break
      case 'beforenext':
        jamaahOffset = (timenext.subtract({
          minutes: parseInt(jamaahOffsetSetting[0] * 60 + jamaahOffsetSetting[1], 10)
        })).diff(time, 'minutes')
        break
      case '':
        jamaahOffset = ''
        break
      default:
        jamaahOffset = 0
    }
    return jamaahOffset
  }

  prayersCalc (tomorrow) {
    // DST settings
    const city = 'Europe/Dublin'
    let dst
    const dstcheck = momenttz(moment().add(tomorrow, 'day'), city).isDST()

    if (!dstcheck && moment().format('M') === '10') dst = -1
    else if (dstcheck && moment().format('M') === '3') dst = 1
    else dst = 0

    let current,
      next,
      list

    const month = moment().add(dst, 'hour').month() + 1
    const date = moment().add(dst, 'hour').date()

    const tmonth = moment().add(1, 'days').add(dst, 'hour').month() + 1
    const tdate = moment().add(1, 'days').add(dst, 'hour').date()

    const prayerNames = ['fajr', 'shurooq', 'dhuhr', 'asr', 'maghrib', 'isha']

    const listToday = []
    const listTomorrow = []

    prayerNames.forEach((prayer, index) => listToday.push({
      name: prayer,
      time: moment({
        hour: this.state.timetable[month][date][index][0],
        minute: this.state.timetable[month][date][index][1]
      }).add(dst, 'hour'),
      jamaah: {
        offset: this.jamaahCalc(index, moment({ hour: this.state.timetable[month][date][index][0], minute: this.state.timetable[month][date][index][1] })),
        time: moment({
          hour: this.state.timetable[month][date][index][0],
          minute: this.state.timetable[month][date][index][1]
        }).add(dst, 'hour')
          .add(this.jamaahCalc(index, moment({ hour: this.state.timetable[month][date][index][0], minute: this.state.timetable[month][date][index][1] })), 'minutes')
      }
    }))
    prayerNames.forEach((prayer, index) => listTomorrow.push({
      name: prayer,
      time: moment({
        hour: this.state.timetable[tmonth][tdate][index][0],
        minute: this.state.timetable[tmonth][tdate][index][1]
      }).add(1, 'day').add(dst, 'hour'),
      jamaah: {
        offset: this.jamaahCalc(index, moment({ hour: this.state.timetable[tmonth][tdate][index][0], minute: this.state.timetable[tmonth][tdate][index][1] })),
        time: moment({
          hour: this.state.timetable[tmonth][tdate][index][0],
          minute: this.state.timetable[tmonth][tdate][index][1]
        }).add(1, 'day').add(dst, 'hour')
          .add(this.jamaahCalc(index, moment({ hour: this.state.timetable[tmonth][tdate][index][0], minute: this.state.timetable[tmonth][tdate][index][1] })), 'minutes')
      }
    }))

    var timePeriod

    if (moment().isBetween(moment().startOf('day'), listToday[0].time)) {
      tomorrow = 0
      current = { name: 'midnight', time: moment().startOf('day') }
      next = { name: listToday[0].name, time: listToday[0].time }
      list = listToday
      timePeriod = 'case 1'
    }
    // fajr-shurooq
    else if (moment().isBetween(listToday[0].time, listToday[1].time)) {
      // jamaah
      if (this.state.jamaahShow === true && moment().isBetween(listToday[0].time, listToday[0].jamaah.time)) {
        next = { name: `${listToday[0].name} jamaah`, time: listToday[0].jamaah.time }
      } else {
        next = { name: listToday[1].name, time: listToday[1].time }
      }
      tomorrow = 0
      current = { name: listToday[0].name, time: listToday[0].time }
      list = listToday
      timePeriod = 'case 2'
    }
    // shurooq-dhuhr
    else if (moment().isBetween(listToday[1].time, listToday[2].time)) {
      tomorrow = 0
      current = { name: listToday[1].name, time: listToday[1].time }
      next = { name: listToday[2].name, time: listToday[2].time }
      list = listToday
      timePeriod = 'case 3'
    }
    // dhuhr-asr
    else if (moment().isBetween(listToday[2].time, listToday[3].time)) {
      // jamaah
      if (this.state.jamaahShow === true && moment().isBetween(listToday[2].time, listToday[2].jamaah.time)) {
        next = { name: `${listToday[2].name} jamaah`, time: listToday[2].jamaah.time }
      } else {
        next = { name: listToday[3].name, time: listToday[3].time }
      }
      tomorrow = 0
      current = { name: listToday[2].name, time: listToday[2].time }
      list = listToday
      timePeriod = 'case 4'
    }
    // asr-maghrib
    else if (moment().isBetween(listToday[3].time, listToday[4].time)) {
      // jamaah
      if (this.state.jamaahShow === true && moment().isBetween(listToday[3].time, listToday[3].jamaah.time)) {
        next = { name: `${listToday[3].name} jamaah`, time: listToday[3].jamaah.time }
      } else {
        next = { name: listToday[4].name, time: listToday[4].time }
      }
      tomorrow = 0
      current = { name: listToday[3].name, time: listToday[3].time }
      list = listToday
      timePeriod = 'case 5'
    }
    // maghrib-isha
    else if (moment().isBetween(listToday[4].time, listToday[5].time)) {
      // if joined
      if (this.state.jamaahShow === true && this.state.join === '1' && moment().isBetween(listToday[4].time, listToday[4].jamaah.time)) {
        next = { name: `${listToday[4].name} jamaah`, time: listToday[4].jamaah.time }
        tomorrow = 0
        list = listToday
        timePeriod = 'case 6a'
      }
      else if (this.state.jamaahShow === true && this.state.join === '1') {
        next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
        tomorrow = 1
        list = listTomorrow
        timePeriod = 'case 6b'
      }
      // jamaah
      else if (this.state.jamaahShow === true && moment().isBetween(listToday[4].time, listToday[4].jamaah.time)) {
        next = { name: `${listToday[4].name} jamaah`, time: listToday[4].jamaah.time }
        tomorrow = 0
        list = listToday
      } else {
        next = { name: listToday[5].name, time: listToday[5].time }
        tomorrow = 0
        list = listToday
      }
      current = { name: listToday[4].name, time: listToday[4].time }

      timePeriod = 'case 6c'
    }
    // isha-midnight
    else if (moment().isBetween(listToday[5].time, moment().endOf('day'))) {
      // if joined
      if (this.state.jamaahShow === true && this.state.join === '1') {
        next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
        tomorrow = 1
        list = listTomorrow
        timePeriod = 'case 7a'
      }
      // jamaah
      else if (this.state.jamaahShow === true && this.state.join !== '1' && moment().isBetween(listToday[5].time, listToday[5].jamaah.time)) {
        next = { name: `${listToday[5].name} jamaah`, time: listToday[5].jamaah.time }
        tomorrow = 0
        list = listToday
        timePeriod = 'case 7b'
      } else {
        tomorrow = 1
        list = listTomorrow
        next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
        timePeriod = 'case 7c'
      }

      current = { name: listToday[5].name, time: listToday[5].time }
    } else {
      tomorrow = 1
      current = { name: listToday[5].name, time: listToday[5].time }// .clone().add(-1, 'day')}
      list = listTomorrow
      next = { name: listTomorrow[0].name, time: listTomorrow[0].time }
      timePeriod = 'case 8'
    }

    console.log(moment().format('M/D H'), timePeriod, '| current:', current.name, '| next:', next.name, '| tomorrow:', tomorrow)

    this.setState({ tomorrow, dst, timePeriod })

    // console.log(
    //     'now:', moment().format("DD/MM - H:mm"),
    //     '\nfajr:', listToday[0].time.format("DD/MM - H:mm"),
    //     '\nshurooq:', listToday[1].time.format("DD/MM - H:mm"),
    //     '\ndhuhr:', listToday[2].time.format("DD/MM - H:mm"),
    //     '\nmaghrib:', listToday[4].time.format("DD/MM - H:mm"),
    //     '\nisha:', listToday[5].time.format("DD/MM - H:mm"),
    //     '\ncurrent:', current.time.format("DD/MM - H:mm"),
    //     '\nnext:', next.time.format("DD/MM - H:mm")
    // )

    return {
      list, current, next, tomorrow
    }
  }

  dayCalc (tomorrow) {
    const gregorian = moment().add(tomorrow, 'day').format('dddd, D MMMM YYYY')
    const hijri = moment().add((parseInt(this.state.settings.hijrioffset, 10) + parseInt(tomorrow, 10)), 'day').format('iD iMMMM iYYYY')
    let ramadanCountdown
    // console.log(moment().format('iM'))
    if (moment().format('iM') === '8') {
      ramadanCountdown = moment.duration(moment().endOf('imonth').diff(moment().add((parseInt(this.state.settings.hijrioffset) + parseInt(tomorrow)), 'day'))).humanize()
    }
    else ramadanCountdown = ''

    return { gregorian, hijri, tomorrow, ramadanCountdown }
  }

  /**********************************************************************
  SCRIPTS
  **********************************************************************/
  tick () {
    this.setState({
      prayers: this.prayersCalc(this.state.tomorrow),
      day: this.dayCalc(this.state.tomorrow)
    })

    if (moment().isBetween(this.state.jummuahTime, this.state.jummuahTime.clone().add(1, 'hour'))) {
      this.setState({
        overlayActive: true
      })
    }
    else if (moment().format('iM') === '8' &&
    //   this.state.prayers.current.name === 'asr' &&
      moment().isBetween(this.state.taraweehTime, this.state.taraweehTime.clone().add(2, 'hour'))) {
      this.setState({
        overlayActive: true,
        overlayTitle: 'Taraweeh Prayer'
      })
    }
    else {
      this.setState({
        overlayActive: false,
        overlayTitle: ' ... '
      })
    }
  }

  async update () {
    if (this.state.refresh !== 0) {
      try {
        const res = await fetch('https://islamireland.ie/api/timetable/', { mode: 'cors' })
        // set vars
        const { name, settings, timetable } = await res.json()
        // update states and storage
        await this.setState({ settings, timetable, name })
        await localStorage.setItem('settings', JSON.stringify(settings))
        await localStorage.setItem('timetable', JSON.stringify(timetable))
        console.log('refreshed:', moment().format('HH:mm'))
      } catch (error) {
        console.log(error)
      }
    }
  }

  /**********************************************************************
  RENDERING
  **********************************************************************/
  render () {
    // console.log(this.state.overlayActive)
    let overlay
    if (this.state.overlayActive) {
      overlay = <Overlay settings={this.state.settings} day={this.state.day} overlayTitle={this.state.overlayTitle} />
    }
    else overlay = ''

    return (
      <div className='TimetableApp'>

        {/* <Overlay settings={this.state.settings} day={this.state.day} overlayTitle={this.state.overlayTitle} overlayActive={this.state.overlayActive} /> */}
        {overlay}
        <Header settings={this.state.settings} />
        <Clock day={this.state.day} />
        <Timetable
          prayers={this.state.prayers}
          jamaahShow={this.state.jamaahShow}
          join={this.state.join}
        />
        <Countdown
          prayers={this.state.prayers}
        />
        <Message settings={this.state.settings} />
        <Footer settings={this.state.settings} day={this.state.day} />

      </div>
    )
  }
}

export default TimetableApp

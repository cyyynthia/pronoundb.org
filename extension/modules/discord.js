/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { fetchPronouns } from '../fetch'

let _webpack = null
function fetchWebpack (filter) {
  if (!_webpack) {
    _webpack = webpackJsonp.push([ [], { __pronoundb: (_, e, r) => (e.c = r.c) }, [ [ '__pronoundb' ] ] ])
    delete _webpack.c.__pronoundb
  }

  return Object.values(_webpack.c).find(filter)
}

let _react = null
function fetchReact () {
  if (!_react) {
    const ReactMdl = fetchWebpack(m => m?.exports?.createElement)
    if (ReactMdl) _react = ReactMdl.exports
  }

  return _react
}

function fetchUserPopout (React) {
  const functionalUserPopoutMdl = fetchWebpack(m => m?.exports?.default?.displayName === 'UserPopout')
  const functionalUserPopout = functionalUserPopoutMdl?.exports?.default
  if (!functionalUserPopout) return

  // React Honks moment
  const owo = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current
  const ogUseMemo = owo.useMemo
  const ogUseState = owo.useState
  const ogUseEffect = owo.useEffect
  const ogUseLayoutEffect = owo.useLayoutEffect
  const ogUseRef = owo.useRef

  owo.useMemo = (fn) => fn()
  owo.useState = (v) => [ v, () => void 0 ]
  owo.useEffect = () => null
  owo.useLayoutEffect = () => null
  owo.useRef = () => ({})

  // Render moment
  const res = functionalUserPopout({ user: { isNonUserBot: () => void 0 } })

  // React Hooks moment
  owo.useMemo = ogUseMemo
  owo.useState = ogUseState
  owo.useEffect = ogUseEffect
  owo.useLayoutEffect = ogUseLayoutEffect
  owo.useRef = ogUseRef

  // Poggers moment
  return res.type
}

function fetchUserProfile () {
  const UserProfileMdl = fetchWebpack(m => m?.exports?.default?.displayName === 'UserProfile')
  const UserProfile = UserProfileMdl?.exports?.default
  if (!UserProfile) return

  const VeryVeryDecoratedUserProfileBody = UserProfile.prototype.render().type
  const VeryDecoratedUserProfileBody = VeryVeryDecoratedUserProfileBody.prototype.render.call({ memoizedGetStateFromStores: () => void 0 }).type
  const DecoratedUserProfileBody = VeryDecoratedUserProfileBody.render().type
  return DecoratedUserProfileBody.prototype.render.call({ props: { forwardedRef: null } }).type
}

function injectUserPopout () {
  const React = fetchReact()
  const UserPopout = fetchUserPopout(React)
  if (!UserPopout) {
    // Retry in a sec
    setTimeout(() => injectUserPopout(), 1e3)
    return
  }

  const ogMount = UserPopout.prototype.componentDidMount
  const ogRenderBody = UserPopout.prototype.renderBody

  UserPopout.prototype.componentDidMount = function () {
    ogMount.call(this)
    if (this.props.user?.bot) return
    fetchPronouns('discord', this.props.userId)
      .then(pronouns => this.setState({ __$pronouns: pronouns }))
  }

  UserPopout.prototype.renderBody = function () {
    const res = ogRenderBody.call(this)
    if (this.state?.__$pronouns) {
      res.props.children.props.children.push([
        React.createElement('div', { key: 'title', className: 'bodyTitle-Y0qMQz marginBottom8-AtZOdT size12-3R0845' }, 'Pronouns'),
        React.createElement('div', { key: 'pronouns', className: 'marginBottom8-AtZOdT size14-e6ZScH' }, this.state.__$pronouns)
      ])
    }
    return res
  }
}

function injectUserProfile () {
  const React = fetchReact()
  const UserProfile = fetchUserProfile()
  if (!UserProfile) {
    // Retry in a sec
    setTimeout(() => injectUserProfile(), 1e3)
    return
  }

  const UserInfo = UserProfile.prototype.render.call({
    getMode: () => null,
    renderHeader: () => null,
    renderCustomStatusActivity: () => null,
    renderTabBar: UserProfile.prototype.renderTabBar.bind({ props: {}, isCurrentUser: () => true }),
    props: {}
  }).props.children.props.children[1].props.children.type
    .prototype.render.call({ memoizedGetStateFromStores: () => null }).type

  const ogMount = UserProfile.prototype.componentDidMount
  const ogUpdate = UserProfile.prototype.componentDidUpdate
  const ogRender = UserProfile.prototype.render
  const ogRenderInfo = UserInfo.prototype.render

  UserProfile.prototype.componentDidMount = function () {
    ogMount.call(this)
    fetchPronouns('discord', this.props.user.id)
      .then(pronouns => this.setState({ __$pronouns: pronouns }))
  }

  UserProfile.prototype.componentDidUpdate = function (prevProps, prevState) {
    ogUpdate.call(this, prevProps, prevState)
    if (this.props.user.id !== prevProps.user.id) {
      this.setState({ __$pronouns: null })
      fetchPronouns('discord', this.props.user.id)
        .then(pronouns => this.setState({ __$pronouns: pronouns }))
    }
  }

  UserProfile.prototype.render = function () {
    const res = ogRender.call(this)
    if (this.props.section === 'USER_INFO') {
      res.props.children.props.children[1].props.children.props.__$pronouns = this.state?.__$pronouns
    }
    return res
  }

  UserInfo.prototype.render = function () {
    const res = ogRenderInfo.call(this)
    if (this.props.__$pronouns) {
      res.props.children[0].props.children.push([
        React.createElement('div', { key: 'title', className: 'userInfoSectionHeader-CBvMDh' }, 'Pronouns'),
        React.createElement('div', { key: 'pronouns', className: 'marginBottom8-AtZOdT size14-e6ZScH colorStandard-2KCXvj' }, this.props.__$pronouns)
      ])
    }
    return res
  }
}

function inject () {
  injectUserPopout()
  injectUserProfile()
  // todo: define if I want to inject into chat section like I do on Twitch (probably inject a setting in appearance tab)
}

if (/(^|\.)discord\.com$/.test(location.hostname)) {
  inject()
}

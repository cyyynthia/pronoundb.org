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

import { extractMessages, extractUserPopOut, extractUserProfileBody, extractUserProfileInfo } from './modules.shared'

function sleep (ms) {
  return new Promise(res => setTimeout(res, ms))
}

let _webpack = null
async function fetchWebpack (filter, dig = []) {
  if (!_webpack) {
    _webpack = window.webpackJsonp.push([ [], { __pronoundb: (_, e, r) => (e.c = r.c) }, [ [ '__pronoundb' ] ] ])
    delete _webpack.c.__pronoundb
  }

  let res
  while (!(res = Object.values(_webpack.c).find(filter))) await sleep(100)
  for (const d of dig) res = res[d]
  return res
}

export function inject (mdl, meth, repl) {
  const og = mdl[meth]
  mdl[meth] = function (...args) { return repl.call(this, args, og.apply(this, args)) }
  mdl[meth].toString = og.toString.bind(og)
  Object.assign(mdl[meth], og)
}

export function exporter (exp) {
  exp()
}

export async function getModules () {
  const fnMessagesWrapper = await fetchWebpack(m => m?.exports?.default?.type?.toString().includes('getOldestUnreadMessageId'), [ 'exports', 'default' ])
  const React = await fetchWebpack(m => m?.exports?.createElement, [ 'exports' ])
  const UserProfile = await fetchWebpack(m => m?.exports?.default?.displayName === 'UserProfile', [ 'exports', 'default' ])
  const fnUserPopOut = await fetchWebpack(m => m?.exports?.default?.displayName === 'UserPopout', [ 'exports', 'default' ])
  const MessageHeader = await fetchWebpack(m => m?.exports?.MessageTimestamp, [ 'exports' ])
  const UserProfileBody = extractUserProfileBody(UserProfile)

  return {
    React,
    Messages: extractMessages(React, fnMessagesWrapper.type),
    MessageHeader,
    UserProfileBody,
    UserProfileInfo: extractUserProfileInfo(UserProfileBody),
    UserPopOut: extractUserPopOut(React, fnUserPopOut)
  }
}

/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
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

import { css } from '../utils/dom'

export function personCard (width = 20, height = 20) {
  const style = css({
    backgroundImage: 'url(https://static.xx.fbcdn.net/rsrc.php/v3/yb/r/Nxb0jln7NuU.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    display: 'inline-block',
    height: `${height}px`,
    width: `${width}px`,
  })

  const div = document.createElement('div')
  div.setAttribute('style', style)
  return div
}

export function editThin () {
  const style = css({
    backgroundImage: 'url(https://static.xx.fbcdn.net/rsrc.php/v3/ys/r/Zx3_JCwzxMb.png)',
    backgroundSize: 'auto',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '-21px -347px',
    display: 'inline-block',
    height: '20px',
    width: '20px',
  })

  const div = document.createElement('div')
  div.setAttribute('style', style)
  return div
}

export function privacyPublic (width = 16, height = 16) {
  const style = css({
    backgroundImage: 'url(https://static.xx.fbcdn.net/rsrc.php/v3/yi/r/7wYk0RRj5-g.png)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    display: 'inline-block',
    height: `${height}px`,
    width: `${width}px`,
  })

  const div = document.createElement('div')
  div.setAttribute('style', style)
  return div
}

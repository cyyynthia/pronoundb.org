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

import type { Ref } from 'preact'
import { useRef, useCallback, useEffect } from 'preact/hooks'

type Fn = () => void

export default function useTooltip (tooltipText: string): [ Ref<any>, Fn, Fn ] {
  const divRef = useRef<HTMLElement>(null)
  const tooltipRef = useRef<HTMLElement>()

  const onMouseEnter = useCallback(() => {
    const { x, y, width } = divRef.current!.getBoundingClientRect()
    const tt = document.createElement('div')
    tt.className = 'tooltip'
    tt.style.left = `${x + (width / 2)}px`
    tt.style.top = `${y}px`
    tt.style.opacity = '0'
    tt.innerText = tooltipText
    document.body.appendChild(tt)

    setTimeout(() => (tt.style.opacity = '1'), 0)
    tooltipRef.current = tt
  }, [ divRef, tooltipRef, tooltipText ])

  const onMouseLeave = useCallback(() => {
    const tooltip = tooltipRef.current
    if (!tooltip) return

    tooltip.style.opacity = '0'
    setTimeout(() => tooltip.remove(), 150)
  }, [ tooltipRef ])

  useEffect(() => () => tooltipRef.current?.remove(), [ tooltipRef ])

  return [ divRef, onMouseEnter, onMouseLeave ]
}

/*
 * Copyright (c) Cynthia Rey, All rights reserved.
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

import { h } from 'preact'

import { Routes } from '../constants'
import useHeart from '../hooks/useHeart'

import Paw from '/assets/paw.svg'

export default function Footer () {
  const heart = useHeart('footer.donate')

  return (
    <footer class='container-head border-t py-3'>
      <div class='flex-none flex items-center mr-6 text-gray-600 dark:text-gray-400'>
        <Paw class='w-5 h-5 mr-2'/>
        <span>Copyright &copy; {new Date().getUTCFullYear()} Cynthia K. Rey </span>
      </div>
      <div class='flex-none flex items-center gap-4'>
        <a href={Routes.DOCS} class='link'>API Docs</a>
        <a href={Routes.LEGAL} class='link'>Legal</a>
        <a href={Routes.PRIVACY} class='link'>Privacy</a>
        <a href={Routes.GITHUB} target='_blank' rel='noreferrer' class='link'>GitHub</a>
        <a href={Routes.DONATE} target='_blank' rel='noreferrer' class='link'>Donate {heart}</a>
      </div>
    </footer>
  )
}

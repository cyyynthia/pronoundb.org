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

import { h } from 'preact'
import render from 'preact-render-to-string'
import { toStatic } from 'hoofd/preact'
import Root from './Root'

interface HtmlProps {
  manifest: Record<string, string>
  integrity: Record<string, string>
  url: string
}

function Html (props: HtmlProps) {
  const html = render(<Root url={props.url}/>)
  const { metas, links, title, lang } = toStatic()

  return (
    <html lang={lang}>
      <head>
        <title>{title}</title>
        <meta charSet='utf8'/>
        <meta name='theme-color' content='#f49898'/>
        <meta name='viewport' content='width=device-width, initial-scale=1, viewport-fit=cover'/>
        {metas.map(meta => <meta {...meta}/>)}
        {links.map(link => <link {...link}/>)}

        <link rel='preconnect' href='https://fonts.gstatic.com'/>
        <link href='https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap' rel='stylesheet'/>
        <link rel='stylesheet' href={props.manifest['styles.css']} integrity={props.integrity['styles.css']} crossOrigin='anonymous'/>
      </head>
      <body>
        <div id='react-root' dangerouslySetInnerHTML={{ __html: html }}/>
        <script src={props.manifest['main.js']} integrity={props.integrity['main.js']} crossOrigin='anonymous'></script>
        <script src={props.manifest['styles.js']} integrity={props.integrity['styles.js']} crossOrigin='anonymous'></script>
      </body>
    </html>
  )
}

Html.displayName = 'Html'
export default Html

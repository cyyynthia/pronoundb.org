/*
 * Copyright (c) 2018-2021 aetheryx & Cynthia K. Rey
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type Config from './config.example.json'
import { URL } from 'url'
import { existsSync, readFileSync } from 'fs'

let path = new URL('../', import.meta.url)
let cfgFile: URL | null = null
while (!cfgFile && path.pathname !== '/') {
  const attempt = new URL('config.json', path)
  if (existsSync(attempt)) {
    cfgFile = attempt
  } else {
    path = new URL('../', path)
  }
}

if (!cfgFile) {
  console.log('Unable to locate config file! Exiting.')
  process.exit(1)
}

const blob = readFileSync(cfgFile, 'utf8')
export default JSON.parse(blob) as typeof Config

/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
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

export function topics (props: Record<string, string>) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')

	svg.setAttribute('viewBox', '0 0 24 24')
	path1.setAttribute('d', 'M12.003 23.274c-.083 0-.167-.014-.248-.042-.3-.105-.502-.39-.502-.708v-4.14c-2.08-.172-4.013-1.066-5.506-2.56-3.45-3.45-3.45-9.062 0-12.51s9.062-3.45 12.512 0c3.096 3.097 3.45 8.07.82 11.565l-6.49 8.112c-.146.182-.363.282-.587.282zm0-21.05c-1.882 0-3.763.717-5.195 2.15-2.864 2.863-2.864 7.524 0 10.39 1.388 1.387 3.233 2.15 5.195 2.15.414 0 .75.337.75.75v2.72l5.142-6.425c2.17-2.885 1.876-7.014-.696-9.587-1.434-1.43-3.316-2.148-5.197-2.148z')
	path2.setAttribute('d', 'M15.55 8.7h-7.1c-.413 0-.75-.337-.75-.75s.337-.75.75-.75h7.1c.413 0 .75.335.75.75s-.337.75-.75.75zm-3.05 3.238H8.45c-.413 0-.75-.336-.75-.75s.337-.75.75-.75h4.05c.414 0 .75.336.75.75s-.336.75-.75.75z')
	svg.appendChild(path1)
	svg.appendChild(path2)

	for (const key in props) {
		if (Object.prototype.hasOwnProperty.call(props, key)) {
			svg.setAttribute(key, String(props[key]))
		}
	}

	return svg
}

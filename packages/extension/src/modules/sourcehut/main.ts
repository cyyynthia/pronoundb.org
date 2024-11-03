import { h } from '../../utils/dom'
import { fetchPronouns } from '../../utils/fetch'
import { formatPronouns } from '../../utils/pronouns'

export const name = 'SourceHut'
export const color = '#212529'
export const match = /^https:\/\/sr.ht/
export { default as Icon } from 'simple-icons/icons/sourcehut.svg'

async function injectProfile () {
	const node = document.querySelector('.col-md-4 > h2')!
	const userId = node.textContent!.trim().substring(1)
	const pronouns = await fetchPronouns('sourcehut', userId)

	if (!pronouns || !pronouns.sets.en) return

	const el = h('span', { class: 'col-md-6' }, `— ${formatPronouns(pronouns.sets.en)}`)

	node.parentElement!.insertBefore(el, node.nextSibling)
}


export function inject () {
	if (document.querySelector('.col-md-4 > h2')) {
		injectProfile()
	}
}

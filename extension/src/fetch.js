export async function fetchPronouns (platform, id) {
  console.log('fetch:', id)
  return 'she/her'
}

export async function fetchPronounsBulk (platform, ids) {
  console.log('fetch:', ids)
  const res = {}
  ids.forEach(id => (res[id] = 'she/her'))
  return res
}

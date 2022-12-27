export class LRUMap<K, V> {
  // Construct a new cache object which will hold up to limit entries.
  // When the size == limit, a `put` operation will evict the oldest entry.
  constructor (limit: number)

  // Current number of items
  size: number

  // Maximum number of items this map can hold
  limit: number

  // Least recently-used entry. Invalidated when map is modified.
  oldest: Entry<K, V>

  // Most recently-used entry. Invalidated when map is modified.
  newest: Entry<K, V>

  // Put <value> into the cache associated with <key>. Replaces any existing entry
  // with the same key. Returns `this`.
  set(key: K, value: V) : LRUMap<K, V>

  // Purge the least recently used (oldest) entry from the cache.
  // Returns the removed entry or undefined if the cache was empty.
  shift(): [K, V] | undefined

  // Get and register recent use of <key>.
  // Returns the value associated with <key> or undefined if not in cache.
  get(key :K): V | undefined

  // Check if there's a value for key in the cache without registering recent use.
  has(key :K): boolean
}

// An entry holds the key and value, and pointers to any older and newer entries.
interface Entry<K, V> {
  key: K
  value: V
}

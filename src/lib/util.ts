import crypto from 'crypto'
import fsp from 'fs/promises'

export async function fileIsFresh(path: string, expirySecond: number) {
	const minTime = Date.now() - expirySecond * 1000
	const stat = await fsp.stat(path).catch(() => undefined)

	return Boolean(stat?.isFile() && stat.mtimeMs > minTime)
}

export function sortMap<K, V>(map: Map<K, V>, fn: (va: V, vb: V, ka: K, kb: K) => number) {
	const arr = Array.from(map)
	map.clear()
	arr.sort(([ka, va], [kb, vb]) => fn(va, vb, ka, kb))
	for (const [k, v] of arr) map.set(k, v)
	return map
}

export function hash(algo: string, input: string, encoding: crypto.BinaryToTextEncoding) {
	const hash = crypto.createHash(algo)
	hash.update(input)
	return hash.digest(encoding)
}
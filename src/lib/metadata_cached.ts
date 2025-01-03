import fsp from 'fs/promises'
import path from 'path'
import os from 'os'
import { fileIsFresh, hash } from './util.js'
import getPackageMetadata, { PackageMetadata } from './metadata.js'

export async function getPackageMetadataCached(packageName: string, expirySecond = 86400, baseURL?: string | URL) {
	const ftmp = path.join(os.tmpdir(), 'pkgmd_' + hash('md5', packageName, 'hex'))

	if (await fileIsFresh(ftmp, expirySecond)) {
		return JSON.parse(await fsp.readFile(ftmp, 'utf8')) as PackageMetadata
	}

	const metadata = await getPackageMetadata(packageName, baseURL)
	fsp.writeFile(ftmp, JSON.stringify(metadata)).catch(() => {})

	return metadata
}

export async function getPackageVersionsCached(packageName: string, expirySecond = 86400, baseURL?: string | URL) {
	const ftmp = path.join(os.tmpdir(), 'pkgv_' + hash('md5', packageName, 'hex'))

	if (await fileIsFresh(ftmp, expirySecond)) {
		return JSON.parse(await fsp.readFile(ftmp, 'utf8')) as string[]
	}

	const metadata = await getPackageMetadata(packageName, baseURL)
	const versions = Object.keys(metadata.versions)
	fsp.writeFile(ftmp, JSON.stringify(versions)).catch(() => {})

	return versions
}

import HttpUtil from "./http.js"

export const npmRegistry = new URL('https://registry.npmjs.org')

export default async function getPackageMetadata(packageName: string, baseURL: string | URL = npmRegistry) {
	return HttpUtil.json<PackageMetadata>(
		await fetch(new URL(packageName, baseURL), {
			headers: { 'accept': 'application/vnd.npm.install-v1+json' }
		})
	)
}

declare namespace PackageMetadata {
	interface Version {
		name: string
		version: string
		dist: Dist
		deprecated?: string

		dependencies?: Record<string, string>
		acceptDependencies?: Record<string, string>
		devDependencies?: Record<string, string>
		bundleDependencies?: Record<string, string>
		optionalDependencies?: Record<string, string>
		peerDependencies?: Record<string, string>

		bin?: Record<string, string>
		directories?: Record<string, string>

		engines?: Record<string, string>
		cpu?: string[]
		os?: string[]
	}

	interface Dist {
		tarball: string
		fileCount?: number
		unpackedSize?: number
		shasum: string
		integrity: string
		signatures: Signature[]
		'npm-signature': string
	}

	interface Signature {
		sig: string
		keyid: string
	}
}

interface PackageMetadata {
	name: string
	'dist-tags': Record<string, string>
	versions: Record<string, PackageMetadata.Version>
}

export type { PackageMetadata }

namespace PackageVersion {
	export let pattern = /^(\d+\.\d+\.\d+)(?:-(\w+))?(?:\.(\d+\.\d+\.\d+)-(\w+)\.?(\d+)?)?$/

	/**
	 * Parses package version
	 * @param packageVersion Package version in string
	 * @returns Package version
	 */
	export function parse(packageVersion: string): Version | undefined {
		const m = packageVersion.match(pattern)
		if (!m) return

		let [, version = '', releaseType = 'stable', mcVersion, mcReleaseType = 'stable', mcRevision] = m
		if (mcRevision) mcVersion += '.' + mcRevision

		return {
			raw: packageVersion,
			version: version.split('.').map(Number),
			versionString: version,
			type: releaseTypeMap[releaseType] ?? ReleaseType.Unknown,
			mc: mcVersion ? {
				version: mcVersion.split('.').map(Number),
				versionString: mcVersion,
				type: mcReleaseTypeMap[mcReleaseType] ?? MCReleaseType.Unknown
			} : undefined
		}
	}

	/**
	 * Compares both version array
	 * @param a Version 1
	 * @param b Version 2
	 * @param maxLen Maximum array length
	 * @param start Start index
	 * @returns A - B
	 */
	export function compare(a: number[], b: number[], maxLen = Infinity, start = 0) {
		const max = Math.min(maxLen, a.length, b.length)
		for (let i = start; i < max; i++) {
			const aa = a[i]!, bb = b[i]!
			if (aa === bb) continue
			return aa - bb
		}

		return max === maxLen ? 0 : a.length - b.length
	}

	/**
	 * Compares both MC version
	 * @param a Version 1
	 * @param b Version 2
	 * @returns A - B
	 */
	export function compareMc(a: MCVersion, b: MCVersion) {
		return compare(a.version, b.version, 3) // compare major, minor, patch
			|| a.type - b.type // compare type
			|| compare(a.version, b.version, undefined, 3) // compare revision
	}

	/**
	 * Compares both package version
	 * @param a Version 1
	 * @param b Version 2
	 * @returns A - B
	 */
	export function comparePackage(a: Version, b: Version) {
		return compare(a.version, b.version) // compare version
			|| a.type - b.type // compare type
			|| a.mc && b.mc && compareMc(a.mc, b.mc)
			|| 0
	}

	export enum ReleaseType {
		Unknown,
		Beta,
		RC,
		Stable
	}

	export enum MCReleaseType {
		Unknown,
		Preview,
		Stable
	}

	const releaseTypeMap: Record<string, ReleaseType> = {
		stable: ReleaseType.Stable,
		rc: ReleaseType.RC,
		beta: ReleaseType.Beta
	}

	const mcReleaseTypeMap: Record<string, MCReleaseType> = {
		stable: MCReleaseType.Stable,
		preview: MCReleaseType.Preview,
	}

	export interface Version {
		raw: string
		version: number[]
		versionString: string
		type: ReleaseType
		mc?: MCVersion
	}

	export function MCVersion(type: MCReleaseType, version: string | readonly number[]): MCVersion {
		let ver, verStr
		if (typeof version === 'string') {
			ver = version.split('.').map(Number)
			verStr = version
		}
		else {
			ver = version.slice()
			verStr = version.join('.')
		}

		return {
			type,
			version: ver,
			versionString: verStr
		}
	}

	export namespace MCVersion {
		export const minStable: MCVersion = MCVersion(MCReleaseType.Stable, [0, 0, 0])
		export const maxStable: MCVersion = MCVersion(MCReleaseType.Stable, [Infinity, 0, 0])
		export const minPreview: MCVersion = MCVersion(MCReleaseType.Preview, [0, 0, 0, 0])
		export const maxPreview: MCVersion = MCVersion(MCReleaseType.Preview, [Infinity, 0, 0, 0])
	}

	export interface MCVersion {
		version: number[]
		versionString: string
		type: MCReleaseType
	}
}

type PackageVersion = PackageVersion.Version
export const PackageMCVersion = PackageVersion.MCVersion
export type PackageMCVersion = PackageVersion.MCVersion
export const PackageReleaseType = PackageVersion.ReleaseType
export type PackageReleaseType = PackageVersion.ReleaseType

export default PackageVersion

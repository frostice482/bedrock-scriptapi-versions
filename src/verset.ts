import PackageVersion, { PackageMCVersion, PackageReleaseType } from "./package_version.js"
import Sortable from "./lib/sortable.js"
import { sortMap } from "./lib/util.js"
import MinecraftVersions from "./mcver.js"
import { getPackageVersionsCached } from "./lib/metadata_cached.js"

/**
 * Mapping of packages and its list of versions
 */
export class PackagesVersionSets extends Map<string, VersionSetList> {
	/**
	 * Creates PackagesVersionSets from package names. Uses `getPackageVersionsCached` func to retreive versions
	 * @param packages Package names
	 * @param requireAll Requires all package to be successfully loaded, otherwise throws error
	 */
	static async from(packages: string[], requireAll = false) {
		const list = new PackagesVersionSets()

		const arr = await Promise.all(
			packages.map(async pkg => {
				try {
					const versionList = new VersionSetList(await getPackageVersionsCached(pkg))
					versionList.estimateStableMCVersions()
					return { pkg, versionList }
				}
				catch(e) {
					if (requireAll) throw e
					console.error(`Failed to load package '${pkg}':`, e)
				}
			})
		)
		for (const entry of arr) if (entry) list.set(entry.pkg, entry.versionList)

		return list
	}

	/**
	 * Gets packages latest version releases from Minecraft version
	 * @param mcVersion Minecraft version
	 * @returns Packages latest version releases
	 */
	getMcVersionReleases(mcVersion: PackageMCVersion) {
		const map = new Map<string, MCVersionReleasesMap>()
		for (const [packageName, list] of this) map.set(packageName, list.getMcVersionReleases(mcVersion))
		return map
	}

	/**
	 * Gets Minecraft version list
	 */
	getMcVersions() {
		const versions = new MinecraftVersions()
		for (const setlist of this.values()) setlist.getMcVersions(versions)
		return versions
	}
}

/**
 * List of versions
 */
export class VersionSetList {
	constructor(versions?: Iterable<PackageVersion | string>) {
		if (versions) {
			for (let version of versions) {
				const parsed = typeof version === 'string' ? PackageVersion.parse(version) : version
				if (parsed) this.addVersion(parsed)
			}
		}
	}

	list = new Map<string, VersionSet>()

	/**
	 * Adds a new version to list
	 * @param version Package version
	 * @returns Version release list
	 */
	@Sortable.causeUnsort
	addVersion(version: PackageVersion) {
		let set = this.list.get(version.versionString)
		if (!set) this.list.set(version.versionString, set = new VersionSet(version.version))
		set.addRelease(version)
		return set
	}

	@Sortable.causeSort
	sort() {
		for (const set of this.list.values()) set.sort()
		sortMap(this.list, (a, b) => PackageVersion.compare(a.version, b.version))
	}

	/**
	 * Estimates Minecraft version of stable releases.
	 *
	 * Stable releases don't have Minecraft version tied to them,
	 * but mostly can be determined by getting the oldest stable Minecraft version
	 * of beta release from the next version.
	 */
	estimateStableMCVersions() {
		this.sort()
		let prev: PackageVersion | undefined
		for (const set of this) {
			if (prev && !prev.mc) prev.mc = set.betaOldestStableMc
			prev = set.stableRelease
		}
		return this
	}

	/**
	 * Gets Minecraft version list
	 */
	getMcVersions(versions = new MinecraftVersions) {
		for (const set of this.list.values())
			for (const releases of set)
				if (releases.mc) versions.addVersion(releases.mc)
		return versions
	}

	/**
	 * Gets latest version release from Minecraft version
	 * @param mcVersion Minecraft version
	 * @returns latest version releases, map of release types and its version
	 */
	getMcVersionReleases(mcVersion: PackageMCVersion): MCVersionReleasesMap {
		const map: MCVersionReleasesMap = new Map
		for (const set of this) {
			const setvers = set.getMcVersionReleases(mcVersion)
			for (const [k, v] of setvers) if (v) map.set(k, v)
		}
		return map
	}

	*versions() {
		for (const set of this) yield* set
	}

	*[Symbol.iterator]() {
		this.sort()
		yield* this.list.values()
	}
}

export class VersionSet {
	constructor(version: number[], releases?: Iterable<PackageVersion>) {
		this.version = version
		this.versionString = version.join('.')

		if (releases) for (const release of releases) this.addRelease(release)
		this.sort()
	}

	version: number[]
	versionString: string

	betaReleases = new Map<string, PackageVersion>()
	rcReleases = new Map<string, PackageVersion>()
	stableRelease?: PackageVersion
	betaOldestStableMc?: PackageMCVersion

	@Sortable.causeUnsort
	addRelease(version: PackageVersion) {
		const mc = version.mc
		const mcver = mc?.versionId ?? ''

		switch (version.type) {
			case PackageReleaseType.Beta:
				this.betaReleases.set(mcver, version)
				if (mc?.type === PackageVersion.MCReleaseType.Stable && (!this.betaOldestStableMc || PackageVersion.compareMc(mc, this.betaOldestStableMc) < 0))
					this.betaOldestStableMc = mc
			break

			case PackageReleaseType.RC:
				this.rcReleases.set(mcver, version)
			break

			case PackageReleaseType.Stable:
				this.stableRelease = version
			break
		}
		return this
	}

	@Sortable.causeSort
	sort() {
		sortMap(this.betaReleases, PackageVersion.comparePackage)
		sortMap(this.rcReleases, PackageVersion.comparePackage)
	}

	/**
	 * Gets version releases from Minecraft version
	 * @param mcVersion Minecraft version
	 * @returns Version releases, map of release types and its version
	 */
	getMcVersionReleases(mcVersion: PackageMCVersion): MCVersionReleasesMap {
		this.sort()
		return new Map([
			[PackageReleaseType.Stable,
				this.stableRelease?.mc && PackageVersion.compareMc(this.stableRelease.mc, mcVersion) <= 0 ? this.stableRelease : undefined
			],
			[PackageReleaseType.RC,
				this.rcReleases.get(mcVersion.versionId)
			],
			[PackageReleaseType.Beta,
				this.betaReleases.get(mcVersion.versionId)
			],
		])
	}

	*[Symbol.iterator](): Generator<PackageVersion> {
		this.sort()
		yield* this.betaReleases.values()
		yield* this.rcReleases.values()
		if (this.stableRelease) yield this.stableRelease
	}
}

export type MCVersionReleasesMap = Map<PackageReleaseType, PackageVersion | undefined>

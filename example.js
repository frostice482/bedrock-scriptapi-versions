import { getPackageVersionsCached, PackageVersion, VersionSetList, PackageReleaseType, PackagesVersionSets } from './app/index.js'

const packages = [
	'@minecraft/server',
	'@minecraft/server-gametest',
	'@minecraft/server-ui',
	'@minecraft/server-net',
	'@minecraft/server-admin',
]

// to handle list of packages and its version list
const packageVersions = new PackagesVersionSets(
	await Promise.all(
		packages.map(async packageName => {
			// get package versions from npm registry
			// cached versions is stored in OS tmpdir
			const versions = await getPackageVersionsCached(packageName)

			// parse each version and put it to VersionSetList
			const versionSetList = new VersionSetList(versions.map(PackageVersion.parse).filter(v => v))
			// determine stable MC versions for stable releases
			versionSetList.estimateStableMCVersions()

			return [packageName, versionSetList]
		})
	)
)

// gets Minecraft versions
const mcVersions = packageVersions.getMcVersions()

// gets package versions from latest stable version of Minecraft
const mcStableVersions = packageVersions.getMcVersionReleases(mcVersions.latestStable)

console.log(`Latest stable: ${mcVersions.latestStable.versionString}`)
for (const [packageName, releases] of mcStableVersions) {
	console.log(` - ${packageName}: `)
	for (const [releaseType, version] of releases) {
		if (!version) continue
		console.log(`    : ${PackageReleaseType[releaseType].padEnd(8)}: ${version.versionString.padEnd(8)} (${version.raw})`)
	}
}

/*
Latest stable: 1.21.51
 - @minecraft/server:
    : Stable  : 1.16.0   (1.16.0)
    : Beta    : 1.17.0   (1.17.0-beta.1.21.51-stable)
 - @minecraft/server-gametest:
    : Stable  : 0.1.0    (0.1.0)
    : Beta    : 1.0.0    (1.0.0-beta.1.21.51-stable)
 - @minecraft/server-ui:
    : Stable  : 1.3.0    (1.3.0)
    : Beta    : 1.4.0    (1.4.0-beta.1.21.51-stable)
 - @minecraft/server-net:
    : Beta    : 1.0.0    (1.0.0-beta.1.21.51-stable)
 - @minecraft/server-admin:
    : Beta    : 1.0.0    (1.0.0-beta.1.21.51-stable)
*/

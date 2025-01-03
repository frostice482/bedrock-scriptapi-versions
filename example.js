import { PackageReleaseType, PackagesVersionSets } from './app/index.js'

const packages = [
	'@minecraft/server',
	'@minecraft/server-gametest',
	'@minecraft/server-ui',
	'@minecraft/server-net',
	'@minecraft/server-admin',
]

// to handle list of packages and its version list
const packagesVersionSets = await PackagesVersionSets.from(packages)
// gets Minecraft versions
const mcVersions = packagesVersionSets.getMcVersions()
// gets package versions from latest stable version of Minecraft
const mcStableVersions = packagesVersionSets.getMcVersionReleases(mcVersions.latestStable)

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

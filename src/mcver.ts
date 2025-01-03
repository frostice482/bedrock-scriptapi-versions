import Sortable from "./lib/sortable.js";
import { sortMap } from "./lib/util.js";
import PackageVersion, { PackageMCVersion } from "./package_version.js";

export default class MinecraftVersions {
	constructor(versions?: Iterable<PackageMCVersion>) {
		if (versions) for (const version of versions) this.addVersion(version)
	}

	stables = new Map<string, PackageMCVersion>()
	previews = new Map<string, PackageMCVersion>()

	latestStable = PackageMCVersion.minStable
	latestPreview = PackageMCVersion.minPreview

	@Sortable.causeUnsort
	addVersion(version: PackageMCVersion) {
		switch (version.type) {
			case PackageVersion.MCReleaseType.Preview:
				this.previews.set(version.versionId, version)
				if (PackageVersion.compareMc(version, this.latestPreview) > 0)
					this.latestPreview = version
			break

			case PackageVersion.MCReleaseType.Stable:
				this.stables.set(version.versionId, version)
				if (PackageVersion.compareMc(version, this.latestStable) > 0)
					this.latestStable = version
			break
		}
	}

	@Sortable.causeSort
	sort() {
		sortMap(this.stables, PackageVersion.compareMc)
		sortMap(this.previews, PackageVersion.compareMc)
	}

	*[Symbol.iterator]() {
		yield* this.stables.values()
		yield* this.previews.values()
	}
}
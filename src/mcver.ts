import Sortable from "./lib/sortable.js";
import PackageVersion, { PackageMCVersion } from "./package_version.js";

export default class MinecraftVersions {
	constructor(versions?: Iterable<PackageMCVersion>) {
		if (versions) for (const version of versions) this.addVersion(version)
	}

	stables: PackageMCVersion[] = []
	previews: PackageMCVersion[] = []

	latestStable = PackageMCVersion.minStable
	latestPreview = PackageMCVersion.minPreview

	@Sortable.causeUnsort
	addVersion(version: PackageMCVersion) {
		switch (version.type) {
			case PackageVersion.MCReleaseType.Preview:
				this.previews.push(version)
				if (PackageVersion.compareMc(version, this.latestPreview) > 0)
					this.latestPreview = version
			break

			case PackageVersion.MCReleaseType.Stable:
				this.stables.push(version)
				if (PackageVersion.compareMc(version, this.latestStable) > 0)
					this.latestStable = version
			break
		}
	}

	@Sortable.causeSort
	sort() {
		this.stables.sort(PackageVersion.compareMc)
		this.previews.sort(PackageVersion.compareMc)
	}

	*[Symbol.iterator]() {
		yield* this.stables.values()
		yield* this.previews.values()
	}
}
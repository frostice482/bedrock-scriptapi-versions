namespace Sortable {
	const unsorted = new WeakSet<object>()

	export function causeUnsort(obj: object, prop: string, desc: TypedPropertyDescriptor<(this: object, ...args: any[]) => any>) {
		const fn = desc.value!
		desc.value = function() {
			const r = fn.apply(this, arguments as never)
			unsorted.add(this)
			return r
		}
	}

	export function causeSort(obj: object, prop: string, desc: TypedPropertyDescriptor<(this: object, ...args: any[]) => void>) {
		const fn = desc.value!
		desc.value = function() {
			if (!unsorted.has(this)) return
			const r = fn.apply(this, arguments as never)
			unsorted.delete(this)
			return r
		}
	}
}
export default Sortable

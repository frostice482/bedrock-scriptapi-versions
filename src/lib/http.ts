namespace HttpUtil {
	export function checkHttpOk(res: Response) {
		if (!res.ok) throw Error(`HTTP ${res.url} ${res.status} ${res.statusText}`)
		return res
	}

	export function json<T>(res: Response) {
		checkHttpOk(res)
		return res.json() as Promise<T>
	}
}
export default HttpUtil

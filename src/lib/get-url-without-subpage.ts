export function getUrlWithoutSubpage(url: string): string {
	const match = url.match(/^.*?\/participants\/[0-9a-z]{15}/g);
	return match ? match[0] : url;
}

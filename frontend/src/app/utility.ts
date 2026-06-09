export class Utility {
  static normalizeUrl(url: string): string {
    if (!url) return url;

    // check if url has trailing protocol
    if (!/^https?:\/\//i.test(url)) {
      // add https:// as default protocol
      return `https://${url}`;
    }

    return url;
  }
}

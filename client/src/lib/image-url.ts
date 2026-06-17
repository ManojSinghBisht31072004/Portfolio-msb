export function toImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (driveFile) return `https://drive.google.com/thumbnail?id=${driveFile[1]}&sz=w800`;
  const driveOpen = url.match(/drive\.google\.com\/(?:open|uc)\?.*id=([^&]+)/);
  if (driveOpen) return `https://drive.google.com/thumbnail?id=${driveOpen[1]}&sz=w800`;
  if (url.includes("drive.google.com/thumbnail")) return url;
  return url;
}

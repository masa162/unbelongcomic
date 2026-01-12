export function getImageUrl(imageId: string, options: { width?: number; height?: number; fit?: 'cover' | 'contain' } = {}) {
  if (!imageId) return '';
  
  // Custom CDN URL
  const baseUrl = 'https://img.unbelong.xyz';
  
  const params = new URLSearchParams();
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.fit) params.append('fit', options.fit);
  
  const queryString = params.toString();
  return `${baseUrl}/${imageId}${queryString ? `?${queryString}` : ''}`;
}

export function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

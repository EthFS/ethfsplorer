export function fileMode(mode) {
  let s = ''
  mode &= 511
  for (let i = 0; i < 9; i++) {
    if (!(mode & 1)) {
      s = '-' + s
    } else switch (i % 3) {
      case 0:
        s = 'x' + s
        break
      case 1:
        s = 'w' + s
        break
      case 2:
        s = 'r' + s
        break
    }
    mode >>= 1
  }
  return s
}

export function fileSize(size, decimals = 2) {
	if (size === undefined) return '-'
	if (!size) return '0 bytes'
	const k = 1024
	const sizes = ['bytes', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(size) / Math.log(k))
	return parseFloat((size / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i]
}

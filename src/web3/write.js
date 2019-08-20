export default async function write(kernel, fd, key, buf, len = buf.length) {
  let i = 0
  try {
    while (i < len) {
      const j = Math.min(len, i+8192)
      await kernel.write(fd, key, buf.slice(i, j))
      i = j
    }
    return [i]
  } catch (e) {
    return [i, e]
  }
}

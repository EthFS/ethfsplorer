export default async function write(kernel, fd, key, buf, len, progressCb) {
  let i = 0
  try {
    while (i < len) {
      const j = Math.min(len, i+8192)
      progressCb(j)
      const tx = await kernel.write(fd, key, buf.slice(i, j))
      await tx.wait()
      i = j
    }
    return [i]
  } catch (e) {
    return [i, e]
  }
}

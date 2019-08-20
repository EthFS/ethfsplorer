const constants = {}
export default constants

require('../../artifacts/Constants')
  .ast.nodes[1].nodes.filter(x => x.value)
  .forEach(x => constants[x.name.slice(1)] = x.value.value)

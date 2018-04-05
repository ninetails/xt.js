const render = (arr, parent = global.createDocumentFragment(), window = window || global) =>
  Array.from(arr)
    .reduce((p, data) => {
      if (~['string', 'number'].indexOf(typeof data)) {
        return p.appendChild(window.document.createTextNode(data))
      }

      if (typeof data === 'object') {
        return Object.entries(data).forEach(([key, value]) => {
          switch (key) {
            case 'className':
              p.setAttribute('class', value)
              break
            default:
              p.setAttribute(key, value)
          }
        })
      }

      const tag = data.shift()
      return p.appendChild(render(data, window.document.createElement(tag)))
    }, parent)

export default render

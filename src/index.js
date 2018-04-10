const isString = thing =>
  typeof thing === 'string'

export default ((window) => {
  const { document, DocumentFragment, Node } = window

  const isNode = thing =>
    thing instanceof Node

  const isDocFrag = thing =>
    thing instanceof DocumentFragment

  const render = (data = [], parent = document.createDocumentFragment()) => {
    if (!data.length) {
      return parent
    }

    let tag
    if (isString(data[0])) {
      tag = document.createElement(data.shift())
    } else if (isNode(data[0]) && !isDocFrag(data[0])) {
      tag = data.shift()
    } else {
      tag = document.createElement('div')
    }

    parent.appendChild(
      [...data]
        .filter(entry => entry)
        .reduce(
          (element, entry) => {
            if (isString(entry)) {
              element.appendChild(document.createTextNode(entry))
              return element
            }

            if (isNode(entry)) {
              element.appendChild(entry)
              return element
            }

            if (Array.isArray(entry)) {
              return render(entry, element)
            }

            Object.keys(entry)
              .forEach(name => {
                switch (name) {
                  case 'className':
                    element.setAttribute('class', entry[name])
                    break
                  case 'style':
                    Object.assign(element.style, entry.style)
                    break
                  case 'on':
                    Object.keys(entry.on)
                      .forEach(eventName => element.addEventListener(eventName, entry.on[eventName]))
                    break
                  default:
                    element.setAttribute(name, entry[name])
                }
              })

            return element
          },
          tag
        )
    )

    return parent
  }

  render.h = (...args) => {
    if (typeof args[0] === 'function') {
      return [...args].shift()({ ...(args[1] || {}), children: args[2] || undefined })
    }
    return [...args]
  }

  return render
})(window || global)

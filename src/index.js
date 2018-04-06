export default ((window) => {
  const { document, Node } = window

  const render = (data = [], parent = document.createDocumentFragment()) => {
    let tagName = 'div'

    if (!data.length) {
      return parent
    }

    if (data[0] && typeof data[0] === 'string') {
      tagName = data.shift()
    }

    parent.appendChild(
      [...data]
        .filter(entry => entry)
        .reduce(
          (element, entry) => {
            if (typeof entry === 'string') {
              element.appendChild(document.createTextNode(entry))
              return element
            }

            if (entry instanceof Node) {
              element.appendChild(entry)
              return element
            }

            if (entry instanceof Array) {
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
          document.createElement(tagName)
        )
    )

    return parent
  }

  return render
})(window || global)

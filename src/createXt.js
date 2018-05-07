const isArray = Array.isArray

const isInstanceOf = type => thing => thing instanceof type
const isTypeOf = type => thing => typeof thing === type // eslint-disable-line valid-typeof

const isString = isTypeOf('string')

const toMappedParams = (data, parent) => {
  if (!isArray(data)) {
    return data
  }

  return {
    data,
    parent
  }
}

export default (window) => {
  const { document, DocumentFragment, Node } = window

  const isNode = isInstanceOf(Node)

  const isDocFrag = isInstanceOf(DocumentFragment)

  const getTag = ({ data, ...args }) => {
    if (!data.length) {
      return args
    }

    if (isString(data[0])) {
      return {
        ...args,
        tag: document.createElement(data.shift()),
        data
      }
    }

    if (isNode(data[0]) && !isDocFrag(data[0])) {
      return {
        ...args,
        tag: data.shift(),
        data
      }
    }

    return {
      ...args,
      tag: document.createElement('div'),
      data
    }
  }

  const addProps = (element, entry) => {
    if (isString(entry)) {
      element.appendChild(document.createTextNode(entry))
      return element
    }

    if (isNode(entry)) {
      element.appendChild(entry)
      return element
    }

    if (Array.isArray(entry)) {
      return xt(entry, element)
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
          default:
            if (/^on([a-z]+)/.test(name.toLowerCase()) && typeof entry[name] === 'function') {
              element.addEventListener(RegExp.$1, entry[name])
            } else {
              element.setAttribute(name, entry[name])
            }
        }
      })

    return element
  }

  const addPropsToParent = ({ parent, data, tag }) => {
    if (!data || !tag) {
      return parent
    }

    parent.appendChild(data.filter(entry => entry).reduce(addProps, tag))

    return parent
  }

  const xt = (data = [], parent = document.createDocumentFragment()) =>
    addPropsToParent(getTag(toMappedParams(data, parent)))

  xt.h = (...args) => {
    if (typeof args[0] === 'function') {
      return [...args].shift()({ ...(args[1] || {}), children: args[2] || undefined })
    }
    return [...args]
  }

  return xt
}

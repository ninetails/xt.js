/** @jsx xt.h */
import createXt from '../createXt'

describe('xt', () => {
  const xt = createXt(global)
  const { document, DocumentFragment } = global
  const getRoot = () => document.getElementById('root')
  let root

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>'
    root = getRoot()
  })

  it('should return Document Fragment', () => {
    const actual = xt()
    expect(actual).toBeInstanceOf(DocumentFragment)
  })

  it('should add a div', () => {
    root.appendChild(xt(['div']))
    const actual = root.innerHTML
    expect(actual).toBe('<div></div>')
  })

  it('should add a div if no tag name was provided', () => {
    root.appendChild(xt([{}]))
    const actual = root.innerHTML
    expect(actual).toBe('<div></div>')
  })

  it('should add a div with string content', () => {
    root.appendChild(xt(['div', 'mocked content']))
    const actual = root.innerHTML
    expect(actual).toBe('<div>mocked content</div>')
  })

  it('should add a div within a nested span', () => {
    root.appendChild(xt(['div', ['span', 'mocked content']]))
    const actual = root.innerHTML
    expect(actual).toBe('<div><span>mocked content</span></div>')
  })

  it('should add a html node', () => {
    root.appendChild(xt(['div', document.createTextNode('foo')]))
    const actual = root.innerHTML
    expect(actual).toBe('<div>foo</div>')
  })

  it('should add simple attributes', () => {
    root.appendChild(xt(['div', { 'data-test': 'foo' }]))
    const actual = root.innerHTML
    expect(actual).toBe('<div data-test="foo"></div>')
  })

  it('should add simple classNames', () => {
    root.appendChild(xt(['div', { className: 'foo' }]))
    const actual = root.innerHTML
    expect(actual).toBe('<div class="foo"></div>')
  })

  it('should add inline styles', () => {
    root.appendChild(xt(['div', { style: { backgroundColor: 'red' } }]))
    expect(root.firstChild.style).toMatchObject({ backgroundColor: 'red' })
  })

  it('should add click event', () => {
    expect.assertions(4)

    return (new Promise(resolve => {
      const button = document.createElement('button')
      const spy = jest.spyOn(button, 'addEventListener')
      const mockEvent = document.createEvent('HTMLEvents')
      mockEvent.initEvent('click', false, true)
      root.appendChild(xt([
        button,
        {
          onClick: function (event) {
            resolve({
              button,
              context: this,
              event,
              mockEvent,
              spy
            })
          }
        }
      ]))

      button.dispatchEvent(mockEvent)
    })).then(({ button, context, event, mockEvent, spy }) => {
      expect(root.innerHTML).toBe('<button></button>')
      expect(context).toBe(button)
      expect(spy.mock.calls[0][0]).toBe('click')
      expect(mockEvent).toBe(event)
    })
  })

  it('should accept element as first array argument', () => {
    root.appendChild(xt([document.createElement('div'), 'foo']))
    const actual = root.innerHTML
    expect(actual).toBe('<div>foo</div>')
  })

  it('should not use Document Fragment as element when first array argument', () => {
    const mockDocFrag = document.createDocumentFragment()
    const mockDiv = document.createElement('span')
    mockDiv.innerHTML = 'bar'
    mockDocFrag.appendChild(mockDiv)
    root.appendChild(xt([mockDocFrag, 'foo']))
    const actual = root.innerHTML
    expect(actual).toBe('<div><span>bar</span>foo</div>')
  })

  it('should receive object as mapped params', () => {
    root.appendChild(xt({ data: ['div', 'foo'], parent: document.createElement('div') }))
    const actual = root.innerHTML
    expect(actual).toBe('<div><div>foo</div></div>')
  })

  describe('.h (jsx)', () => {
    it('should create div', () => {
      root.appendChild(xt(<div>foo</div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div>foo</div>')
    })

    it('should pass attributes', () => {
      root.appendChild(xt(<div aria-hidden="true" data-test="bar">foo</div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div aria-hidden="true" data-test="bar">foo</div>')
    })

    it('should add class using className', () => {
      root.appendChild(xt(<div className="bar">foo</div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div class="bar">foo</div>')
    })

    it('should add a div within a nested span', () => {
      root.appendChild(xt(<div><span>mocked content</span></div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div><span>mocked content</span></div>')
    })

    it('should add space between as used with React', () => {
      root.appendChild(xt(<div><span>span 1</span>{' '}<span>span 2</span></div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div><span>span 1</span> <span>span 2</span></div>')
    })

    it('should accept custom element', () => {
      const CustomComponent = ({ prop, children }) => <div data-prop={prop}>{children}</div>
      root.appendChild(xt(<div><CustomComponent prop="value">foo</CustomComponent></div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div><div data-prop="value">foo</div></div>')
    })

    it('should accept custom element (empty children)', () => {
      const CustomComponent = ({ prop, children }) => <div data-prop={prop}>{children}</div>
      root.appendChild(xt(<div><CustomComponent prop="value" /></div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div><div data-prop="value"></div></div>')
    })

    it('should accept custom element (empty children & prop)', () => {
      const CustomComponent = ({ prop, children }) => <div>{children}</div>
      root.appendChild(xt(<div><CustomComponent /></div>))
      const actual = root.innerHTML
      expect(actual).toBe('<div><div></div></div>')
    })

    it('should add click event', () => {
      expect.assertions(3)

      return (new Promise(resolve => {
        let button

        const mockEvent = document.createEvent('HTMLEvents')
        mockEvent.initEvent('click', false, true)

        function mockClickEvent (event) {
          resolve({
            button,
            context: this,
            event,
            mockEvent
          })
        }

        root.appendChild(xt(<button onClick={mockClickEvent} />))
        button = root.querySelector('button')

        button.dispatchEvent(mockEvent)
      })).then(({ button, context, event, mockEvent }) => {
        expect(root.innerHTML).toBe('<button></button>')
        expect(context).toBe(button)
        expect(event).toBe(mockEvent)
      })
    })
  })
})

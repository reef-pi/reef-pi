import { RawAdmin } from './admin'
import { confirm } from 'utils/confirm'
import FormData from 'form-data'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn()
}))

jest.mock('form-data', () => jest.fn())

const patchSetState = component => {
  component.setState = update => {
    component.state = {
      ...component.state,
      ...(typeof update === 'function' ? update(component.state) : update)
    }
  }
}

describe('Admin DB import', () => {
  let append

  beforeEach(() => {
    append = jest.fn()
    FormData.mockImplementation(() => ({ append }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('imports the selected database file after confirmation', () => {
    confirm.mockResolvedValue(true)
    const dbImport = jest.fn()
    const component = new RawAdmin({ dbImport })
    patchSetState(component)
    const file = new window.File(['reef-pi'], 'reef-pi.db')

    component.handleDBFileChange({ target: { files: [file] } })
    component.handleDBFileImport()

    expect(dbImport).not.toHaveBeenCalled()
    return Promise.resolve().then(() => {
      expect(confirm).toHaveBeenCalled()
      expect(append).toHaveBeenCalledWith('dbImport', file, 'reef-pi.db')
      expect(dbImport).toHaveBeenCalledWith(expect.objectContaining({ append }))
    })
  })

  it('does not import the selected database file when confirmation is canceled', () => {
    confirm.mockResolvedValue(false)
    const dbImport = jest.fn()
    const component = new RawAdmin({ dbImport })
    patchSetState(component)
    const file = new window.File(['reef-pi'], 'reef-pi.db')

    component.handleDBFileChange({ target: { files: [file] } })
    component.handleDBFileImport()

    return Promise.resolve().then(() => {
      expect(confirm).toHaveBeenCalled()
      expect(dbImport).not.toHaveBeenCalled()
    })
  })
})

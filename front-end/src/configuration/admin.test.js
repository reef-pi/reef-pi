import { RawAdmin } from './admin'
import { confirm } from 'utils/confirm'
import SignIn from 'sign_in'
import FormData from 'form-data'
import * as Alert from 'utils/alert'

jest.mock('utils/confirm', () => ({
  confirm: jest.fn()
}))

jest.mock('utils/alert', () => ({
  showError: jest.fn(),
  showUpdateSuccessful: jest.fn()
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

  it('reports selected database filename and default label', () => {
    const component = new RawAdmin({})
    patchSetState(component)

    expect(component.dbFileName()).toBe('select_file')

    const file = new window.File(['reef-pi'], 'backup.db')
    component.handleDBFileChange({ target: { files: [file] } })

    expect(component.state.dbFile).toBe(file)
    expect(component.dbFileName()).toBe('backup.db')
  })

  it('shows an error when importing without selecting a database file', () => {
    const dbImport = jest.fn()
    const component = new RawAdmin({ dbImport })

    component.handleDBFileImport()

    expect(Alert.showError).toHaveBeenCalledWith('select_file')
    expect(confirm).not.toHaveBeenCalled()
    expect(dbImport).not.toHaveBeenCalled()
  })

  it('shows an error when installing without a version', () => {
    const upgrade = jest.fn()
    const component = new RawAdmin({ upgrade })

    component.handleInstall()

    expect(Alert.showError).toHaveBeenCalledWith('entry_required')
    expect(confirm).not.toHaveBeenCalled()
    expect(upgrade).not.toHaveBeenCalled()
  })

  it('installs a selected version after confirmation', () => {
    confirm.mockResolvedValue(true)
    const upgrade = jest.fn()
    const component = new RawAdmin({ upgrade })
    patchSetState(component)

    component.handleVersionChange({ target: { value: '5.0.0' } })
    component.handleInstall()

    return Promise.resolve().then(() => {
      expect(confirm).toHaveBeenCalledWith('are_you_sure')
      expect(upgrade).toHaveBeenCalledWith('5.0.0')
      expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
    })
  })

  it('delegates signout to SignIn logout', () => {
    jest.spyOn(SignIn, 'logout').mockImplementation(() => {})
    const component = new RawAdmin({})

    component.handleSignout()

    expect(SignIn.logout).toHaveBeenCalled()
  })

  it('runs reload, reboot, and power off actions after confirmation', () => {
    confirm.mockResolvedValue(true)
    const reload = jest.fn()
    const reboot = jest.fn()
    const powerOff = jest.fn()
    const component = new RawAdmin({ reload, reboot, powerOff })

    component.handleReload()
    component.handleReboot()
    component.handlePowerOff()

    return Promise.resolve().then(() => {
      expect(reload).toHaveBeenCalled()
      expect(reboot).toHaveBeenCalled()
      expect(powerOff).toHaveBeenCalled()
    })
  })
})

import React from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Formik } from 'formik'
import EditJournal from './edit_journal'
import * as Alert from 'utils/alert'
import { fetchJournalUsage } from 'redux/actions/journal'
import 'isomorphic-fetch'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const mockDispatch = jest.fn()

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch
}))

jest.mock('redux/actions/journal', () => ({
  fetchJournalUsage: jest.fn(id => ({ type: 'FETCH_JOURNAL_USAGE', id }))
}))

const initialValues = { id: '1', name: 'pH', description: 'log', unit: 'pH' }

const render = (extraProps = {}) => {
  const container = document.createElement('div')
  const root = createRoot(container)
  const props = {
    values: initialValues,
    errors: {},
    touched: {},
    submitForm: jest.fn(),
    handleBlur: jest.fn(),
    isValid: true,
    dirty: false,
    readOnly: false,
    ...extraProps
  }

  act(() => {
    root.render(
      <Formik initialValues={initialValues} onSubmit={props.submitForm}>
        {(formikProps) => (
          <EditJournal
            values={props.values}
            errors={props.errors}
            touched={props.touched}
            submitForm={props.submitForm}
            handleBlur={formikProps.handleBlur}
            isValid={props.isValid}
            dirty={props.dirty}
            readOnly={props.readOnly}
          />
        )}
      </Formik>
    )
  })

  return {
    container,
    props,
    unmount: () => act(() => root.unmount())
  }
}

describe('EditJournal', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'showError').mockImplementation(() => {})
    jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders without throwing', () => {
    const { unmount } = render()
    unmount()
  })

  it('renders name, description, unit fields', () => {
    const { container, unmount } = render()
    expect(container.querySelector('[name="name"]')).not.toBeNull()
    expect(container.querySelector('[name="description"]')).not.toBeNull()
    expect(container.querySelector('[name="unit"]')).not.toBeNull()
    unmount()
  })

  it('disables fields when readOnly', () => {
    const { container, unmount } = render({ readOnly: true })
    expect(container.querySelectorAll('[disabled]')).toHaveLength(4)
    expect(container.querySelector('.row.d-none input[type="submit"]')).not.toBeNull()
    unmount()
  })

  it('fetches journal usage for existing journal values', () => {
    const { unmount } = render()
    expect(fetchJournalUsage).toHaveBeenCalledWith('1')
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'FETCH_JOURNAL_USAGE', id: '1' })
    unmount()
  })

  it('submits and shows success when form is valid', () => {
    const submitForm = jest.fn()
    const { container, unmount } = render({ submitForm, dirty: true, isValid: true })
    act(() => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).toHaveBeenCalled()
    expect(Alert.showError).not.toHaveBeenCalled()
    unmount()
  })

  it('submits and shows an error when form is dirty and invalid', () => {
    const submitForm = jest.fn()
    const { container, unmount } = render({ submitForm, dirty: true, isValid: false })
    act(() => {
      container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    expect(submitForm).toHaveBeenCalled()
    expect(Alert.showError).toHaveBeenCalled()
    expect(Alert.showUpdateSuccessful).not.toHaveBeenCalled()
    unmount()
  })

  it('marks touched fields with validation errors as invalid', () => {
    const { container, unmount } = render({
      errors: { name: 'required' },
      touched: { name: true }
    })
    expect(container.querySelector('[name="name"]').className).toContain('is-invalid')
    unmount()
  })
})

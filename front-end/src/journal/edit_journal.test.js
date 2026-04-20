import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Formik } from 'formik'
import EditJournal from './edit_journal'
import * as Alert from 'utils/alert'
import fetchMock from 'fetch-mock'
import 'isomorphic-fetch'

jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn()
}))

const initialValues = { id: '1', name: 'pH', description: 'log', unit: 'pH' }

const render = (extraProps = {}) => {
  fetchMock.getOnce('/api/journal/1/usage', {})
  const submitForm = extraProps.submitForm || jest.fn()
  return renderToStaticMarkup(
    <Formik initialValues={initialValues} onSubmit={submitForm}>
      {(formikProps) => (
        <EditJournal
          values={formikProps.values}
          errors={formikProps.errors}
          touched={formikProps.touched}
          submitForm={formikProps.submitForm}
          handleBlur={formikProps.handleBlur}
          isValid={formikProps.isValid}
          dirty={formikProps.dirty}
          readOnly={false}
          {...extraProps}
        />
      )}
    </Formik>
  )
}

describe('EditJournal', () => {
  beforeEach(() => {
    jest.spyOn(Alert, 'showError').mockImplementation(() => {})
    jest.spyOn(Alert, 'showUpdateSuccessful').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    fetchMock.reset()
    fetchMock.restore()
  })

  it('renders without throwing', () => {
    expect(() => render()).not.toThrow()
  })

  it('renders name, description, unit fields', () => {
    const markup = render()
    expect(markup).toContain('name="name"')
    expect(markup).toContain('name="description"')
    expect(markup).toContain('name="unit"')
  })

  it('disables fields when readOnly', () => {
    const markup = render({ readOnly: true })
    expect(markup.match(/disabled=""/g)).toHaveLength(4)
  })
})

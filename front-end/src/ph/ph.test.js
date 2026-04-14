import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import PhForm, { phFormValues, submitPhForm } from './ph_form'
import Chart, { ChartView } from './chart'
import Main, { PhView } from './main'
import 'isomorphic-fetch'
jest.mock('utils/confirm', () => {
  return {
    showModal: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this),
    confirm: jest
      .fn()
      .mockImplementation(() => {
        return new Promise(resolve => {
          return resolve(true)
        })
      })
      .bind(this)
  }
})

describe('Ph ui', () => {
  it('<Main />', () => {
    const probe = {
      id: 1,
      name: 'probe',
      enable: false,
      chart: {},
      notify: { enable: false },
      control: true,
      is_macro: true,
      min: 7,
      downer_eq: '3',
      max: 8.6,
      upper_eq: '1'
    }
    const fetchPhProbes = jest.fn()
    const update = jest.fn()
    const create = jest.fn()
    const deleteProbe = jest.fn()
    const view = new PhView({
      probes: [probe],
      ais: [],
      macros: [],
      equipment: [],
      currentReading: {},
      fetchPhProbes,
      update,
      create,
      delete: deleteProbe,
      readProbe: jest.fn(),
      calibrateProbe: jest.fn()
    })
    view.setState = jest.fn(updateState => {
      view.state = { ...view.state, ...updateState }
    })

    view.componentDidMount()
    expect(fetchPhProbes).toHaveBeenCalled()
    expect(() => renderToStaticMarkup(<PhView probes={[probe]} ais={[]} macros={[]} equipment={[]} currentReading={{}} fetchPhProbes={fetchPhProbes} update={update} create={create} delete={deleteProbe} readProbe={() => {}} calibrateProbe={() => {}} />)).not.toThrow()
    view.handleToggleAddProbeDiv()
    expect(view.state.addProbe).toBe(true)
    view.handleCreateProbe(phFormValues({ probe }))
    expect(create).toHaveBeenCalled()
    expect(Main).toBeDefined()
  })

  it('<PhForm/> for create', () => {
    const fn = jest.fn()
    const values = phFormValues({})
    submitPhForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
  })

  it('<PhForm /> for edit', () => {
    const fn = jest.fn()

    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: true,
      is_macro: false,
      chart_y_min: 0,
      chart_y_max: 14
    }
    const values = phFormValues({ probe })
    submitPhForm(values, { props: { onSubmit: fn } })
    expect(fn).toHaveBeenCalled()
  })

  it('<PhForm /> for edit with macro', () => {
    const fn = jest.fn()

    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: true,
      is_macro: true,
      chart_y_min: 0,
      chart_y_max: 14
    }
    expect(phFormValues({ probe }).control).toBe('macro')
  })

  it('<PhForm /> for edit without control', () => {
    const fn = jest.fn()

    const probe = {
      name: 'name',
      enable: true,
      address: 99,
      notify: { enable: false },
      control: false,
      is_macro: true,
      chart_y_min: 0,
      chart_y_max: 14
    }
    expect(phFormValues({ probe }).control).toBe('')
  })

  it('<ChartView />', () => {
    const probes = [{ id: '1', name: 'foo' , chart: {}}]
    const readings = { 1: { name: 'foo', current: [] } }
    jest.useFakeTimers()
    const fetchProbeReadings = jest.fn()
    const chart = new ChartView({
      probe_id: '1',
      config: { name: 'foo', chart: { color: '#000', unit: 'pH', ymin: 0, ymax: 14 }, notify: { enable: false } },
      readings: readings[1],
      type: 'current',
      fetchProbeReadings,
      height: 100
    })
    chart.setState = jest.fn(updateState => {
      chart.state = { ...(chart.state || {}), ...updateState }
    })
    chart.componentDidMount()
    expect(fetchProbeReadings).toHaveBeenCalledWith('1')
    expect(() => renderToStaticMarkup(<ChartView probe_id='1' config={{ name: 'foo', chart: { color: '#000', unit: 'pH', ymin: 0, ymax: 14 }, notify: { enable: false } }} readings={readings[1]} type='current' fetchProbeReadings={fetchProbeReadings} height={100} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<ChartView probe_id='1' readings={readings[1]} type='current' fetchProbeReadings={fetchProbeReadings} />)).not.toThrow()
    expect(() => renderToStaticMarkup(<ChartView probe_id='1' config={probes[0]} type='current' fetchProbeReadings={fetchProbeReadings} />)).not.toThrow()
    chart.componentWillUnmount()
    jest.useRealTimers()
    expect(Chart).toBeDefined()
  })
})

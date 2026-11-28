import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import MacroSummary from './macro_summary'

const targets = {
  equipment: [{ id: 'eq1', name: 'Return Pump' }],
  timers: [{ id: 'timer1', name: 'Feed timer' }],
  atos: [{ id: 'ato1', name: 'Reservoir ATO' }],
  tcs: [{ id: 'tc1', name: 'Tank temperature' }],
  phprobes: [{ id: 'ph1', name: 'Display pH' }],
  dosers: [{ id: 'doser1', name: 'Alkalinity' }],
  macros: [{ id: 'macro1', name: 'Water change' }],
  lights: [{ id: 'light1', name: 'Reef lights' }],
  jacks: [{ id: 'jack1', name: 'PWM Jack' }]
}

const html = (macro, extra = {}) => renderToStaticMarkup(
  <MacroSummary macro={macro} {...targets} {...extra} />
)

describe('<MacroSummary /> (#3308)', () => {
  it('renders reversible state and ordered equipment/wait steps as read-only values', () => {
    const out = html({
      reversible: true,
      steps: [
        { type: 'equipment', config: { id: 'eq1', on: true } },
        { type: 'wait', config: { duration: 30 } },
        { type: 'equipment', config: { id: 'eq1', on: false } }
      ]
    })

    expect(out).toContain('<h3>Macro</h3>')
    expect(out).toContain('<dt>reversible</dt><dd>yes</dd>')
    expect(out).toContain('<h3>steps</h3>')
    expect(out).toContain('<dt>1. equipment</dt><dd>Return Pump — turn_on</dd>')
    expect(out).toContain('<dt>2. wait</dt><dd>30 second_s</dd>')
    expect(out).toContain('<dt>3. equipment</dt><dd>Return Pump — turn_off</dd>')
    expect(out).not.toMatch(/<input|<select|<textarea|<button/)
  })

  it('renders alert and PWM configuration without exposing stored ids', () => {
    const out = html({
      reversible: false,
      steps: [
        { type: 'alert', config: { title: 'Feed complete', message: 'Resume normal schedule.' } },
        { type: 'pwm', config: { id: 'jack1', value: 50 } }
      ]
    })

    expect(out).toContain('<dt>1. alert</dt><dd>Feed complete — Resume normal schedule.</dd>')
    expect(out).toContain('<dt>2. pwm</dt><dd>PWM Jack — 50%</dd>')
    expect(out).not.toContain('jack1')
  })

  it('uses domain wording for subsystem and nested macro steps', () => {
    const out = html({
      reversible: 'true',
      steps: [
        { type: 'subsystem', config: { id: 'timers', on: 'true' } },
        { type: 'macro', config: { id: 'macro1', on: 'false' } }
      ]
    })

    expect(out).toContain('<dt>reversible</dt><dd>yes</dd>')
    expect(out).toContain('<dt>1. subsystem</dt><dd>timers — enabled</dd>')
    expect(out).toContain('<dt>2. macro</dt><dd>Water change — revert</dd>')
  })

  it('normalizes false string booleans', () => {
    const out = html({
      reversible: 'false',
      steps: [{ type: 'equipment', config: { id: 'eq1', on: 'false' } }]
    })

    expect(out).toContain('<dt>reversible</dt><dd>no</dd>')
    expect(out).toContain('Return Pump — turn_off')
  })

  it('falls back to a missing target id and labels a blank target as not configured', () => {
    expect(html({
      reversible: false,
      steps: [{ type: 'equipment', config: { id: 'gone', on: true } }]
    })).toContain('gone — turn_on')

    expect(html({
      reversible: false,
      steps: [{ type: 'equipment', config: { id: '', on: true } }]
    })).toContain('Not configured — turn_on')
  })

  it('renders stable fallbacks for empty steps and missing config', () => {
    expect(html({ reversible: false, steps: [] })).toContain('<dt>steps</dt><dd>none</dd>')
    expect(() => html({ reversible: false, steps: [{ type: 'wait' }] })).not.toThrow()
    expect(html({ reversible: false, steps: [{ type: 'wait' }] })).toContain('<dt>1. wait</dt><dd>—</dd>')
    expect(() => html({ reversible: false })).not.toThrow()
  })
})

import fs from 'fs'
import path from 'path'

const css = fs.readFileSync(path.join(__dirname, 'colors_and_type.css'), 'utf8')
const scss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'sass', '_tokens.scss'), 'utf8')

describe('--reefpi-color-border-strong (light theme)', () => {
  const light = /--reefpi-color-border-strong:\s*(#[0-9a-f]{6})/i.exec(css)[1]

  it('mirrors the Sass token', () => {
    expect(/\$border-strong-color:\s*(#[0-9a-f]{6})/i.exec(scss)[1].toLowerCase()).toBe(light.toLowerCase())
  })

  it('is a visible grey, not black: the off switch track and tile borders use it', () => {
    expect(light.toLowerCase()).not.toBe('#000000')
  })
})

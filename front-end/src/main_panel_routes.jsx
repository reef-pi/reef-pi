import React from 'react'
import { Route } from 'react-router-dom'
import Ato from 'ato/main'
import Camera from 'camera/main'
import Equipment from 'equipment/main'
import Lighting from 'lighting/main'
import Configuration from 'configuration/main'
import Temperature from 'temperature/main'
import Timers from 'timers/main'
import Doser from 'doser/main'
import Ph from 'ph/main'
import Macro from 'macro/main'
import Dashboard from 'dashboard/main'
import i18n from 'utils/i18n'
import Instances from 'instances/main'
import Journal from 'journal/main'

export const mainPanelRoutes = [
  { key: 'dashboard', index: true, path: '', element: <Dashboard />, label: i18n.t('capabilities:dashboard') },
  { key: 'equipment', path: '/equipment', element: <Equipment />, label: i18n.t('capabilities:equipment') },
  { key: 'timers', path: '/timers', element: <Timers />, label: i18n.t('capabilities:timers') },
  { key: 'lighting', path: '/lighting', element: <Lighting />, label: i18n.t('capabilities:lights') },
  { key: 'temperature', path: '/temperature', element: <Temperature />, label: i18n.t('capabilities:temperature') },
  { key: 'ato', path: '/ato', element: <Ato />, label: i18n.t('capabilities:ato') },
  { key: 'ph', path: '/ph', element: <Ph />, label: i18n.t('capabilities:ph') },
  { key: 'doser', path: '/doser', element: <Doser />, label: i18n.t('capabilities:dosing_pumps') },
  { key: 'macro', path: '/macro', element: <Macro />, label: i18n.t('capabilities:macros') },
  { key: 'camera', path: '/camera', element: <Camera />, label: i18n.t('capabilities:camera') },
  { key: 'manager', path: '/manager', element: <Instances />, label: i18n.t('capabilities:manager') },
  { key: 'journal', path: '/journal', element: <Journal />, label: i18n.t('capabilities:journal') },
  { key: 'configuration', path: '/configuration/*', element: <Configuration />, label: i18n.t('capabilities:configuration') }
]

export const mainPanelRouteElements = mainPanelRoutes.map(route => (
  <Route key={route.key} index={route.index} path={route.path} element={route.element} />
))

export const routeNavigationPath = route => (route.path || '').replace(/\/\*$/, '')

export const routeEnabled = (route, capabilities) => (
  capabilities[route.key] !== undefined && capabilities[route.key]
)

export const navigationRoutes = capabilities => (
  mainPanelRoutes.filter(route => routeEnabled(route, capabilities))
)

export const routeMatchesLocation = (route, pathname) => {
  if (route.index) {
    return pathname === '/'
  }
  const basePath = route.path.replace('/*', '')
  return pathname === basePath || pathname.startsWith(basePath + '/')
}

export const currentRouteForPath = pathname => (
  mainPanelRoutes.find(route => routeMatchesLocation(route, pathname))
)

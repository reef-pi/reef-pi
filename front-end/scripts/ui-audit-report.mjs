#!/usr/bin/env node
import { buildUiAuditReport } from './ui-audit-report-core.mjs'

try {
  const result = buildUiAuditReport()
  if (result.objectiveFailureCount > 0) {
    console.error(`UI audit failed with ${result.objectiveFailureCount} objective finding(s).`)
  } else {
    console.log(`UI audit passed with ${result.entryCount} screenshot manifest entr${result.entryCount === 1 ? 'y' : 'ies'}.`)
  }
  process.exitCode = result.exitCode
} catch (error) {
  console.error(error.stack || error.message)
  process.exitCode = 1
}

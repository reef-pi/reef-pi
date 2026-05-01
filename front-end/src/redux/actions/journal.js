import { deleteAction, getAction, postAction, putAction } from './api'

export const journalUpdated = () => {
  return ({
    type: 'JOURNAL_UPDATED'
  })
}

export const journalsLoaded = (s) => {
  return ({
    type: 'JOURNALS_LOADED',
    payload: s
  })
}

export const fetchJournals = () => {
  return getAction('journal', journalsLoaded)
}

export const journalLoaded = (s) => {
  return ({
    type: 'JOURNAL_LOADED',
    payload: s
  })
}

export const fetchJournal = (id) => {
  return getAction(['journal', id], journalLoaded)
}

export const journalUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'JOURNAL_USAGE_LOADED',
      payload: { data: s, id }
    })
  }
}

export const fetchJournalUsage = (id) => {
  return getAction(['journal', id, 'usage'], journalUsageLoaded(id))
}

export const createJournal = (a) => {
  return putAction('journal', a, fetchJournals)
}

export const updateJournal = (id, a) => {
  return postAction(['journal', id], a, fetchJournals)
}

export const deleteJournal = (id) => {
  return deleteAction(['journal', id], fetchJournals)
}

export const recordJournal = (id, j) => {
  return postAction(['journal', id, 'record'], j, journalRecorded(id))
}

export const journalRecorded = (id) => {
  return (s) => {
    return ({
      type: 'JOURNAL_RECORDED',
      payload: { data: s, id }
    })
  }
}

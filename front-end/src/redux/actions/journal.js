import { reduxPut, reduxDelete, reduxGet, reduxPost } from 'utils/ajax'

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
  return (reduxGet({
    url: '/api/journal',
    success: journalsLoaded
  }))
}

export const journalLoaded = (s) => {
  return ({
    type: 'JOURNAL_LOADED',
    payload: s
  })
}

export const fetchJournal = (id) => {
  return (reduxGet({
    url: '/api/journal/' + id,
    success: journalLoaded
  }))
}

export const journalUsageLoaded = (id) => {
  return (s) => {
    return ({
      type: 'JOURNAL_USAGE_LOADED',
      payload: { data: s, id: id }
    })
  }
}

export const fetchJournalUsage = (id) => {
  return (reduxGet({
    url: '/api/journal/' + id + '/usage',
    success: journalUsageLoaded(id)
  }))
}

export const createJournal = (a) => {
  return (reduxPut({
    url: '/api/journal',
    data: a,
    success: fetchJournals
  }))
}

export const updateJournal = (id, a) => {
  return (reduxPost({
    url: '/api/journal/' + id,
    data: a,
    success: fetchJournals
  }))
}

export const deleteJournal = (id) => {
  return (reduxDelete({
    url: '/api/journal/' + id,
    success: fetchJournals
  }))
}

export const recordJournal = (id, j) => {
  return (reduxPost({
    url: '/api/journal/' + id + '/record',
    data: j,
    success: journalRecorded(id)
  }))
}

export const journalRecorded = (id) => {
  return (s) => {
    return ({
      type: 'JOURNAL_RECORDED',
      payload: { data: s, id: id }
    })
  }
}

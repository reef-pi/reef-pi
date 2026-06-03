import React, { useState } from 'react'
import JournalForm from './form'
import EntryForm from './entry_form'
import Chart from './chart'
import i18next from 'i18next'
import { fetchJournal, fetchJournalUsage, recordJournal, updateJournal } from 'redux/actions/journal'
import { useDispatch } from 'react-redux'
import Button from '../../design-system/ui_kits/reef-pi-app/primitives/Button'
import { List, ListItem } from '../../design-system/ui_kits/reef-pi-app/primitives/List'

const Journal = (props) => {
  const [addEntry, setAddEntry] = useState(false)
  const dispatch = useDispatch()

  const toggle = () => {
    setAddEntry(!addEntry)
  }

  const handleRecord = (payload) => {
    dispatch(recordJournal(props.config.id, payload))
    dispatch(fetchJournalUsage(props.config.id))
    toggle()
  }

  const handleSubmit = (values) => {
    const payload = {
      name: values.name,
      description: values.description,
      unit: values.unit
    }
    dispatch(updateJournal(values.id, payload))
    dispatch(fetchJournal(values.id))
  }

  let newEntry = <div />
  if (addEntry) {
    newEntry = (
      <EntryForm
        onSubmit={handleRecord}
        readOnly={props.readOnly}
        expanded={props.expanded}
      />
    )
  }

  return (
    <List>
      <ListItem>
        <JournalForm
          data={props.config}
          readOnly={props.readOnly}
          expanded={props.expanded}
          onSubmit={handleSubmit}
        />
        <Chart journal_id={props.config.id} width={500} height={300} />
      </ListItem>
      <ListItem>
        <Button
          id='add_entry'
          type='button'
          variant='primary'
          onClick={toggle}
        >
          {addEntry ? '-' : i18next.t('journal:add_entry')}
        </Button>
        {newEntry}
      </ListItem>
    </List>
  )
}

export default Journal

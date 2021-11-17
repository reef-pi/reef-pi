import React, { useState } from 'react'
import JournalForm from './form'
import EntryForm from './entry_form'
import Chart from './chart'
import i18next from 'i18next'
import { fetchJournal, recordJournal, updateJournal } from 'redux/actions/journal'
import { useDispatch } from 'react-redux'

const Journal = (props) => {
  const [addEntry, setAddEntry] = useState(false)
  const dispatch = useDispatch()

  const toggle = () => {
    setAddEntry(!addEntry)
  }

  const handleRecord = (payload) => {
    dispatch(recordJournal(props.config.id, payload))
    dispatch(fetchJournal(props.config.id))
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

  console.log(addEntry, newEntry)
  return (
    <ul className='list-group list-group-flush'>
      <li className='list-group-item'>
        <JournalForm
          data={props.config}
          readOnly={props.readOnly}
          expanded={props.expanded}
          onSubmit={handleSubmit}
        />
        <Chart journal_id={props.config.id} width={500} height={300} />
      </li>
      <li className='list-group-item'>
        <div className='row'>
          <div className='col'>
            <input
              id='add_entry'
              type='button'
              value={addEntry ? '-' : i18next.t('journal:add_entry')}
              onClick={toggle}
              className='btn btn-outline-success'
            />
          </div>
        </div>
        {newEntry}
      </li>
    </ul>
  )
}

export default Journal

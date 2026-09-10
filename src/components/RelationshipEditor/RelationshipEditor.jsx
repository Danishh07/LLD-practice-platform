import { useState } from 'react'
import styles from './RelationshipEditor.module.css'

const RELATIONSHIP_TYPES = ['Association', 'Aggregation', 'Composition', 'Inheritance']

function classNameById(classes, classId) {
  return classes.find((designClass) => designClass.id === classId)?.name || 'Unnamed class'
}

function RelationshipEditor({ classes, relationships, onAddRelationship, onRemoveRelationship }) {
  const [fromClassId, setFromClassId] = useState('')
  const [toClassId, setToClassId] = useState('')
  const [type, setType] = useState(RELATIONSHIP_TYPES[0])
  const [description, setDescription] = useState('')

  const canDefineRelationships = classes.length >= 2

  function handleAdd() {
    if (!fromClassId || !toClassId || fromClassId === toClassId) return

    onAddRelationship({ fromClassId, toClassId, type, description: description.trim() })

    setDescription('')
  }

  if (!canDefineRelationships) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.guardMessage}>
          Add at least 2 classes before defining relationships between them.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      {relationships.length === 0 ? (
        <p className={styles.emptyHint}>No relationships yet.</p>
      ) : (
        <ul className={styles.list}>
          {relationships.map((relationship) => (
            <li key={relationship.id} className={styles.listItem}>
              <div className={styles.relationshipLine}>
                <span className={styles.className}>{classNameById(classes, relationship.fromClassId)}</span>
                <span className={styles.relationshipType}>{relationship.type}</span>
                <span className={styles.className}>{classNameById(classes, relationship.toClassId)}</span>
              </div>
              {relationship.description && (
                <p className={styles.relationshipDescription}>{relationship.description}</p>
              )}
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => onRemoveRelationship(relationship.id)}
                aria-label={`Remove relationship: ${classNameById(classes, relationship.fromClassId)} to ${classNameById(classes, relationship.toClassId)}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.form}>
        <div className={styles.formRow}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>From</span>
            <select
              className={styles.select}
              value={fromClassId}
              onChange={(event) => setFromClassId(event.target.value)}
            >
              <option value="">Select class</option>
              {classes.map((designClass) => (
                <option key={designClass.id} value={designClass.id}>
                  {designClass.name || 'Unnamed class'}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>Relationship</span>
            <select className={styles.select} value={type} onChange={(event) => setType(event.target.value)}>
              {RELATIONSHIP_TYPES.map((relationshipType) => (
                <option key={relationshipType} value={relationshipType}>
                  {relationshipType}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.fieldLabel}>To</span>
            <select
              className={styles.select}
              value={toClassId}
              onChange={(event) => setToClassId(event.target.value)}
            >
              <option value="">Select class</option>
              {classes.map((designClass) => (
                <option key={designClass.id} value={designClass.id}>
                  {designClass.name || 'Unnamed class'}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Description (optional)</span>
          <input
            type="text"
            className={styles.textInput}
            placeholder="e.g. A ParkingSpot holds one Vehicle"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <button
          type="button"
          className={styles.addButton}
          onClick={handleAdd}
          disabled={!fromClassId || !toClassId || fromClassId === toClassId}
        >
          Add relationship
        </button>
      </div>
    </div>
  )
}

export default RelationshipEditor

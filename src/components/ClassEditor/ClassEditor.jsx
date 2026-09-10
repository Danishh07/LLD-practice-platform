import { useState } from 'react'
import styles from './ClassEditor.module.css'

// Responsibilities, fields, and methods are edited with identical
// add/remove UI — this small local component avoids repeating that
// markup three times per class. It's specific to "editing one string
// list of a class" and isn't meant to be reused outside ClassEditor,
// so it isn't its own file.
function EditableList({ label, singularLabel, emptyHint, items, onAdd, onRemove }) {
  const [draft, setDraft] = useState('')

  function handleAdd() {
    const value = draft.trim()
    if (!value) return
    onAdd(value)
    setDraft('')
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className={styles.listGroup}>
      <span className={styles.listLabel}>{label}</span>

      {items.length === 0 ? (
        <p className={styles.emptyHint}>{emptyHint}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className={styles.listItem}>
              <span className={styles.listItemText}>{item}</span>
              <button
                type="button"
                className={styles.removeItemButton}
                onClick={() => onRemove(index)}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.listAddRow}>
        <input
          type="text"
          className={styles.listInput}
          placeholder={`Add a ${singularLabel}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={`New ${singularLabel}`}
        />
        <button type="button" className={styles.listAddButton} onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  )
}

function ClassEditor({ classes, onAddClass, onRemoveClass, onRenameClass, onAddListItem, onRemoveListItem }) {
  return (
    <div className={styles.wrapper}>
      {classes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No classes yet. Start by adding the first class in your design.</p>
        </div>
      ) : (
        <div className={styles.classList}>
          {classes.map((designClass, index) => (
            <div
              key={designClass.id}
              className={styles.classCard}
              role="group"
              aria-label={`Class ${index + 1}${designClass.name ? `: ${designClass.name}` : ''}`}
            >
              <div className={styles.classHeader}>
                <input
                  type="text"
                  className={styles.classNameInput}
                  value={designClass.name}
                  placeholder="Class name"
                  onChange={(event) => onRenameClass(designClass.id, event.target.value)}
                  aria-label={`Class ${index + 1} name`}
                />
                <button
                  type="button"
                  className={styles.removeClassButton}
                  onClick={() => onRemoveClass(designClass.id)}
                  aria-label={`Remove class${designClass.name ? `: ${designClass.name}` : ` ${index + 1}`}`}
                >
                  Remove class
                </button>
              </div>

              <div className={styles.listGrid}>
                <EditableList
                  label="Responsibilities"
                  singularLabel="responsibility"
                  emptyHint="No responsibilities yet."
                  items={designClass.responsibilities}
                  onAdd={(value) => onAddListItem(designClass.id, 'responsibilities', value)}
                  onRemove={(index) => onRemoveListItem(designClass.id, 'responsibilities', index)}
                />
                <EditableList
                  label="Fields"
                  singularLabel="field"
                  emptyHint="No fields yet."
                  items={designClass.fields}
                  onAdd={(value) => onAddListItem(designClass.id, 'fields', value)}
                  onRemove={(index) => onRemoveListItem(designClass.id, 'fields', index)}
                />
                <EditableList
                  label="Methods"
                  singularLabel="method"
                  emptyHint="No methods yet."
                  items={designClass.methods}
                  onAdd={(value) => onAddListItem(designClass.id, 'methods', value)}
                  onRemove={(index) => onRemoveListItem(designClass.id, 'methods', index)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="button" className={styles.addClassButton} onClick={onAddClass}>
        + Add class
      </button>
    </div>
  )
}

export default ClassEditor

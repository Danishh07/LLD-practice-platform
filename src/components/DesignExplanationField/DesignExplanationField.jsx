import styles from './DesignExplanationField.module.css'

function DesignExplanationField({ value, onChange }) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="design-explanation">
        Design explanation
      </label>
      <p className={styles.hint}>
        Why you chose this design, important decisions, how it can be extended, and any trade-offs.
      </p>
      <textarea
        id="design-explanation"
        className={styles.textarea}
        rows={6}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Explain your design here..."
      />
    </div>
  )
}

export default DesignExplanationField

import styles from './SubmitBar.module.css'

function SubmitBar({ canSubmit, disabledReason, onSubmit }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.text}>
        <p className={styles.helper}>
          {canSubmit
            ? 'Submitting will score your design and take you to your results.'
            : disabledReason}
        </p>
      </div>
      <button type="button" className={styles.submitButton} disabled={!canSubmit} onClick={onSubmit}>
        Submit Design
      </button>
    </div>
  )
}

export default SubmitBar

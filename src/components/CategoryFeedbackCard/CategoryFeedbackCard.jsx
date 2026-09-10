import styles from './CategoryFeedbackCard.module.css'

function CategoryFeedbackCard({ name, score, max, feedback }) {
  const percentage = max > 0 ? Math.round((score / max) * 100) : 0

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span className={styles.scoreText}>
          {score} / {max}
        </span>
      </div>

      <div className={styles.barTrack} role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={max}>
        <div className={styles.barFill} style={{ width: `${percentage}%` }} />
      </div>

      {feedback.length > 0 ? (
        <ul className={styles.feedbackList}>
          {feedback.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.feedbackFallback}>No specific notes for this category.</p>
      )}
    </div>
  )
}

export default CategoryFeedbackCard

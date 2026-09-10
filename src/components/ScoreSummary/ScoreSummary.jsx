import styles from './ScoreSummary.module.css'

// Simple, deterministic thresholds — same submission always maps to
// the same label, no hidden randomness or LLM judgement involved.
export function interpretScore(score) {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Strong'
  if (score >= 55) return 'Good'
  return 'Needs Improvement'
}

function ScoreSummary({ score }) {
  const interpretation = interpretScore(score)

  return (
    <div className={styles.wrapper} data-interpretation={interpretation}>
      <div className={styles.scoreRow}>
        <span className={styles.score}>{score}</span>
        <span className={styles.outOf}>/ 100</span>
      </div>
      <span className={styles.interpretation}>{interpretation}</span>
    </div>
  )
}

export default ScoreSummary

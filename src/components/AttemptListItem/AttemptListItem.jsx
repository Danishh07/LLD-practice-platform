import { Link } from 'react-router-dom'
import { interpretScore } from '../ScoreSummary/ScoreSummary.jsx'
import { CATEGORY_LABELS } from '../CategoryScoreGrid/CategoryScoreGrid.jsx'
import styles from './AttemptListItem.module.css'

function formatDate(isoString) {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function AttemptListItem({ attempt, problemId }) {
  const { score, categoryScores } = attempt.evaluation
  const interpretation = interpretScore(score)

  return (
    <li className={styles.item}>
      <div className={styles.main}>
        <div className={styles.scoreBlock}>
          <span className={styles.score}>{score}</span>
          <span className={styles.outOf}>/ 100</span>
          <span className={styles.interpretation} data-interpretation={interpretation}>
            {interpretation}
          </span>
        </div>
        <span className={styles.date}>{formatDate(attempt.createdAt)}</span>
      </div>

      <div className={styles.categorySummary}>
        {CATEGORY_LABELS.map(({ key, label }) => (
          <span key={key} className={styles.categoryChip}>
            {label.split(' ')[0]} {categoryScores[key].score}/{categoryScores[key].max}
          </span>
        ))}
      </div>

      <Link
        to={`/problems/${problemId}/history/${attempt.id}`}
        className={styles.viewButton}
        aria-label={`View attempt from ${formatDate(attempt.createdAt)}`}
      >
        View Attempt
      </Link>
    </li>
  )
}

export default AttemptListItem

import { Link, useParams } from 'react-router-dom'
import { getProblemById } from '../../data/problems.js'
import { getAttemptsByProblemId } from '../../services/storageService.js'
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx'
import AttemptListItem from '../../components/AttemptListItem/AttemptListItem.jsx'
import { sortAttemptsNewestFirst } from './sortAttempts.js'
import styles from './AttemptHistoryPage.module.css'

function AttemptHistoryPage() {
  const { problemId } = useParams()
  const problem = getProblemById(problemId)

  if (!problem) {
    return <NotFoundPage />
  }

  const attempts = sortAttemptsNewestFirst(getAttemptsByProblemId(problem.id))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Attempt history</span>
        <h1 className={styles.title}>{problem.title}</h1>
        <p className={styles.count}>
          {attempts.length} {attempts.length === 1 ? 'attempt' : 'attempts'}
        </p>
      </header>

      {attempts.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No attempts yet.</p>
          <p className={styles.emptyBody}>
            Completing a design for this problem will create an attempt here, along with your score
            and feedback.
          </p>
          <Link to={`/problems/${problem.id}/attempt`} className={styles.startButton}>
            Start Practice
          </Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {attempts.map((attempt) => (
            <AttemptListItem key={attempt.id} attempt={attempt} problemId={problem.id} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default AttemptHistoryPage

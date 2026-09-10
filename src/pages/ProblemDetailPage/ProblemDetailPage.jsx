import { Link, useParams } from 'react-router-dom'
import { getProblemById } from '../../data/problems.js'
import { getAttemptsByProblemId } from '../../services/storageService.js'
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx'
import styles from './ProblemDetailPage.module.css'

function ProblemDetailPage() {
  const { problemId } = useParams()
  const problem = getProblemById(problemId)

  // Unknown problem id — reuse the same not-found page rather than
  // inventing a second "not found" UI for this one case.
  if (!problem) {
    return <NotFoundPage />
  }

  // The count only decides the link's label — storageService is the
  // sole source of the data itself, nothing is computed beyond .length.
  const attemptCount = getAttemptsByProblemId(problem.id).length

  return (
    <article className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{problem.title}</h1>
          <span className={styles.difficulty} data-difficulty={problem.difficulty}>
            {problem.difficulty}
          </span>
        </div>
        <p className={styles.statement}>{problem.statement}</p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Functional requirements</h2>
        <ul className={styles.requirementList}>
          {problem.functionalRequirements.map((requirement) => (
            <li key={requirement} className={styles.requirementItem}>
              {requirement}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Non-functional requirements</h2>
        <ul className={styles.requirementList}>
          {problem.nonFunctionalRequirements.map((requirement) => (
            <li key={requirement} className={styles.requirementItem}>
              {requirement}
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.actions}>
        <Link to={`/problems/${problem.id}/attempt`} className={styles.startButton}>
          Start Practice
        </Link>
        <Link to={`/problems/${problem.id}/history`} className={styles.historyButton}>
          {attemptCount > 0 ? 'View Past Attempts' : 'View Attempt History'}
        </Link>
      </div>
    </article>
  )
}

export default ProblemDetailPage

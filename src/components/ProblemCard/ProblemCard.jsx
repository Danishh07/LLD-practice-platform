import { Link } from 'react-router-dom'
import styles from './ProblemCard.module.css'

function ProblemCard({ problem }) {
  return (
    <Link to={`/problems/${problem.id}`} className={styles.card}>
      <div className={styles.cardTop}>
        <h2 className={styles.title}>{problem.title}</h2>
        <span className={styles.difficulty} data-difficulty={problem.difficulty}>
          {problem.difficulty}
        </span>
      </div>

      <p className={styles.description}>{problem.shortDescription}</p>

      <div className={styles.cardBottom}>
        <span className={styles.meta}>
          {problem.functionalRequirements.length} requirements
        </span>
        <span className={styles.cta}>Practice this problem</span>
      </div>
    </Link>
  )
}

export default ProblemCard

import { Link, useParams } from 'react-router-dom'
import { getProblemById } from '../../data/problems.js'
import { getAttemptById } from '../../services/storageService.js'
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx'
import ScoreSummary from '../../components/ScoreSummary/ScoreSummary.jsx'
import CategoryScoreGrid from '../../components/CategoryScoreGrid/CategoryScoreGrid.jsx'
import FeedbackListSection from '../../components/FeedbackListSection/FeedbackListSection.jsx'
import SubmittedDesign from '../../components/SubmittedDesign/SubmittedDesign.jsx'
import styles from './EvaluationResultPage.module.css'

function EvaluationResultPage() {
  const { problemId, attemptId } = useParams()
  const problem = getProblemById(problemId)
  const attempt = getAttemptById(attemptId)

  const isValid = problem && attempt && attempt.problemId === problem.id

  if (!isValid) {
    return <NotFoundPage />
  }

  const { evaluation } = attempt

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Attempt result</span>
        <h1 className={styles.title}>{problem.title}</h1>
      </header>

      <ScoreSummary score={evaluation.score} />

      <FeedbackListSection
        title="What you did well"
        items={evaluation.strengths}
        emptyMessage="No particular strengths were flagged for this attempt."
      />

      <FeedbackListSection
        title="What you missed"
        items={evaluation.missedConsiderations}
        emptyMessage="No missed considerations were found."
      />

      <FeedbackListSection
        title="Suggestions"
        items={evaluation.suggestions}
        emptyMessage="No specific suggestions — this attempt covered the key considerations well."
      />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Detailed category scores</h2>
        <CategoryScoreGrid categoryScores={evaluation.categoryScores} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your submitted design</h2>
        <SubmittedDesign
          classes={attempt.classes}
          relationships={attempt.relationships}
          designExplanation={attempt.designExplanation}
        />
      </section>

      <div className={styles.actions}>
        <Link to={`/problems/${problem.id}/attempt`} className={styles.primaryAction}>
          Try Again
        </Link>
        <Link to={`/problems/${problem.id}/history`} className={styles.secondaryAction}>
          View Past Attempts
        </Link>
        <Link to={`/problems/${problem.id}`} className={styles.secondaryAction}>
          Back to Problem
        </Link>
      </div>
    </div>
  )
}

export default EvaluationResultPage

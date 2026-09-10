import CategoryFeedbackCard from '../CategoryFeedbackCard/CategoryFeedbackCard.jsx'
import styles from './CategoryScoreGrid.module.css'

// The six categories evaluationService always returns, in display
// order. Exported so anything else that needs to iterate the same set
// (AttemptListItem's compact summary) doesn't redefine it.
export const CATEGORY_LABELS = [
  { key: 'coreEntities', label: 'Core Entities' },
  { key: 'relationships', label: 'Relationships' },
  { key: 'responsibilities', label: 'Responsibilities' },
  { key: 'extensibility', label: 'Extensibility' },
  { key: 'designExplanation', label: 'Design Explanation' },
  { key: 'completeness', label: 'Completeness' },
]

function CategoryScoreGrid({ categoryScores }) {
  return (
    <div className={styles.grid}>
      {CATEGORY_LABELS.map(({ key, label }) => {
        const category = categoryScores[key]
        return (
          <CategoryFeedbackCard
            key={key}
            name={label}
            score={category.score}
            max={category.max}
            feedback={category.feedback}
          />
        )
      })}
    </div>
  )
}

export default CategoryScoreGrid

import problems from '../../data/problems.js'
import ProblemCard from '../../components/ProblemCard/ProblemCard.jsx'
import styles from './ProblemListPage.module.css'

function ProblemListPage() {
  return (
    <section className={styles.page}>
      <header className={styles.intro}>
        <h1 className={styles.title}>Problems</h1>
        <p className={styles.subtitle}>
          Pick a problem, define your class design, and get feedback on it.
        </p>
      </header>

      <div className={styles.grid}>
        {problems.map((problem) => (
          <ProblemCard key={problem.id} problem={problem} />
        ))}
      </div>
    </section>
  )
}

export default ProblemListPage

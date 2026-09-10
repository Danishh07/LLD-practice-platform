import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

function NotFoundPage() {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.subtitle}>
        There&apos;s nothing here. <Link to="/">Back to Problems</Link>
      </p>
    </section>
  )
}

export default NotFoundPage

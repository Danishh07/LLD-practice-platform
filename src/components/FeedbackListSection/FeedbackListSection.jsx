import styles from './FeedbackListSection.module.css'

function FeedbackListSection({ title, items, emptyMessage }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      {items.length === 0 ? (
        <p className={styles.emptyNote}>{emptyMessage}</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default FeedbackListSection

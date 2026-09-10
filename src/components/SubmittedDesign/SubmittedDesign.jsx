import styles from './SubmittedDesign.module.css'

function findClassName(classes, classId) {
  return classes.find((designClass) => designClass.id === classId)?.name || 'Unnamed class'
}

// A plain, read-only render of what was submitted — deliberately not
// ClassEditor/RelationshipEditor in a "read-only mode". Those exist to
// be edited; forcing no-op handlers onto them just to reuse markup
// would be more complicated than a small dedicated presentational
// component. This one is shared because it now has two consumers
// (EvaluationResultPage and AttemptDetailPage) with identical needs.
function SubmittedDesign({ classes, relationships, designExplanation }) {
  return (
    <div className={styles.wrapper}>
      {classes.length === 0 ? (
        <p className={styles.emptyNote}>No classes were included in this submission.</p>
      ) : (
        <div className={styles.classGrid}>
          {classes.map((designClass) => (
            <div key={designClass.id} className={styles.classCard}>
              <h3 className={styles.className}>{designClass.name || 'Unnamed class'}</h3>

              <div className={styles.classSection}>
                <span className={styles.classSectionLabel}>Responsibilities</span>
                {designClass.responsibilities.length > 0 ? (
                  <ul className={styles.classSectionList}>
                    {designClass.responsibilities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.classSectionEmpty}>None listed.</p>
                )}
              </div>

              <div className={styles.classSection}>
                <span className={styles.classSectionLabel}>Fields</span>
                {designClass.fields.length > 0 ? (
                  <ul className={styles.classSectionList}>
                    {designClass.fields.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.classSectionEmpty}>None listed.</p>
                )}
              </div>

              <div className={styles.classSection}>
                <span className={styles.classSectionLabel}>Methods</span>
                {designClass.methods.length > 0 ? (
                  <ul className={styles.classSectionList}>
                    {designClass.methods.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.classSectionEmpty}>None listed.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.relationshipsBlock}>
        <span className={styles.classSectionLabel}>Relationships</span>
        {relationships.length === 0 ? (
          <p className={styles.emptyNote}>No relationships were defined.</p>
        ) : (
          <ul className={styles.relationshipList}>
            {relationships.map((relationship, index) => (
              <li key={index} className={styles.relationshipItem}>
                <span className={styles.relationshipLine}>
                  {findClassName(classes, relationship.fromClassId)} —{' '}
                  <span className={styles.relationshipType}>{relationship.type}</span> —{' '}
                  {findClassName(classes, relationship.toClassId)}
                </span>
                {relationship.description && (
                  <span className={styles.relationshipDescription}>{relationship.description}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.explanationBlock}>
        <span className={styles.classSectionLabel}>Design explanation</span>
        {designExplanation ? (
          <p className={styles.explanationText}>{designExplanation}</p>
        ) : (
          <p className={styles.emptyNote}>No design explanation was provided.</p>
        )}
      </div>
    </div>
  )
}

export default SubmittedDesign

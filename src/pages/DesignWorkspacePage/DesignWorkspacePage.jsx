import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProblemById } from '../../data/problems.js'
import { evaluateDesign } from '../../services/evaluationService.js'
import { saveAttempt } from '../../services/storageService.js'
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx'
import ClassEditor from '../../components/ClassEditor/ClassEditor.jsx'
import RelationshipEditor from '../../components/RelationshipEditor/RelationshipEditor.jsx'
import DesignExplanationField from '../../components/DesignExplanationField/DesignExplanationField.jsx'
import SubmitBar from '../../components/SubmitBar/SubmitBar.jsx'
import styles from './DesignWorkspacePage.module.css'

function createClass() {
  return {
    id: crypto.randomUUID(),
    name: '',
    responsibilities: [],
    fields: [],
    methods: [],
  }
}

function DesignWorkspacePage() {
  const { problemId } = useParams()
  const problem = getProblemById(problemId)
  const navigate = useNavigate()

  // All workspace state lives here as plain local state — no context,
  // no store, no custom hook. It's passed down as props to the editor
  // components below, and updated through handlers defined here.
  const [classes, setClasses] = useState([])
  const [relationships, setRelationships] = useState([])
  const [designExplanation, setDesignExplanation] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  if (!problem) {
    return <NotFoundPage />
  }

  function handleAddClass() {
    setClasses((current) => [...current, createClass()])
  }

  function handleRemoveClass(classId) {
    setClasses((current) => current.filter((designClass) => designClass.id !== classId))
    // A relationship pointing at a removed class would otherwise dangle
    // and break the "look up class name by id" logic in RelationshipEditor.
    setRelationships((current) =>
      current.filter(
        (relationship) => relationship.fromClassId !== classId && relationship.toClassId !== classId
      )
    )
  }

  function handleRenameClass(classId, name) {
    setClasses((current) =>
      current.map((designClass) => (designClass.id === classId ? { ...designClass, name } : designClass))
    )
  }

  function handleAddListItem(classId, listName, value) {
    setClasses((current) =>
      current.map((designClass) =>
        designClass.id === classId
          ? { ...designClass, [listName]: [...designClass[listName], value] }
          : designClass
      )
    )
  }

  function handleRemoveListItem(classId, listName, index) {
    setClasses((current) =>
      current.map((designClass) =>
        designClass.id === classId
          ? { ...designClass, [listName]: designClass[listName].filter((_, i) => i !== index) }
          : designClass
      )
    )
  }

  function handleAddRelationship(relationship) {
    setRelationships((current) => [...current, { id: crypto.randomUUID(), ...relationship }])
  }

  function handleRemoveRelationship(relationshipId) {
    setRelationships((current) =>
      current.filter((relationship) => relationship.id !== relationshipId)
    )
  }

  const hasClasses = classes.length > 0
  const allClassesNamed = classes.every((designClass) => designClass.name.trim() !== '')
  const canSubmit = hasClasses && allClassesNamed

  let disabledReason = ''
  if (!hasClasses) {
    disabledReason = 'Add at least one class before submitting your design.'
  } else if (!allClassesNamed) {
    disabledReason = 'Give every class a name before submitting.'
  }

  function handleSubmit() {
    // Defense in depth — SubmitBar's disabled state already prevents
    // reaching here in the normal flow, but handleSubmit shouldn't
    // trust that alone.
    if (!hasClasses) {
      setErrorMessage('Add at least one class before submitting your design.')
      return
    }
    if (!allClassesNamed) {
      setErrorMessage('Give every class a name before submitting.')
      return
    }
    setErrorMessage('')

    // All scoring logic lives in evaluationService — this page only
    // calls it and persists the result, never re-implements it.
    const submission = { classes, relationships, designExplanation }
    const evaluation = evaluateDesign(problem, submission)

    const attempt = {
      id: crypto.randomUUID(),
      problemId: problem.id,
      createdAt: new Date().toISOString(),
      classes,
      relationships,
      designExplanation,
      evaluation,
    }

    saveAttempt(attempt)
    navigate(`/problems/${problem.id}/attempt/${attempt.id}/result`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Practice attempt</span>
        <h1 className={styles.title}>{problem.title}</h1>
        <p className={styles.intro}>
          Define the classes in your design, connect them with relationships, then explain your
          reasoning below. Submit when you're ready for feedback.
        </p>
      </header>

      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Classes</h2>
        <p className={styles.sectionHint}>
          Each class needs a name. Responsibilities describe what it does, fields are the data it
          holds, and methods are its behavior.
        </p>
        <ClassEditor
          classes={classes}
          onAddClass={handleAddClass}
          onRemoveClass={handleRemoveClass}
          onRenameClass={handleRenameClass}
          onAddListItem={handleAddListItem}
          onRemoveListItem={handleRemoveListItem}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Relationships</h2>
        <p className={styles.sectionHint}>
          Association: classes interact without owning each other. Aggregation: a "has-a"
          relationship where the parts can exist independently. Composition: a stronger "owns-a"
          relationship where the parts don't exist without the whole. Inheritance: one class is a
          specialized version of another.
        </p>
        <RelationshipEditor
          classes={classes}
          relationships={relationships}
          onAddRelationship={handleAddRelationship}
          onRemoveRelationship={handleRemoveRelationship}
        />
      </section>

      <section className={styles.section}>
        <DesignExplanationField value={designExplanation} onChange={setDesignExplanation} />
      </section>

      <SubmitBar canSubmit={canSubmit} disabledReason={disabledReason} onSubmit={handleSubmit} />
    </div>
  )
}

export default DesignWorkspacePage

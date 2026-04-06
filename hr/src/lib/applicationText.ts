export function getApplicationAnalysisText(application: any): string {
  return (
    application?.cvTextSnapshot ||
    application?.candidateCV?.cvText ||
    application?.cvText ||
    ""
  )
}
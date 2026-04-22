export const generateCV = async (data: any, template: 'modern' | 'classic') => {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  
  // Basic properties
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20
  
  // Modern Template
  if (template === 'modern') {
    // Header background
    doc.setFillColor(37, 99, 235) // blue-600
    doc.rect(0, 0, pageWidth, 40, 'F')
    
    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text(data.personal?.name || 'Votre nom', 20, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`${data.personal?.email || ''}  |  ${data.personal?.phone || ''}  |  ${data.personal?.city || ''}`, 20, 30)
    
    y = 55
    doc.setTextColor(0, 0, 0)
    
    const addSectionTitle = (title: string) => {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(37, 99, 235)
      doc.text(title.toUpperCase(), 20, y)
      doc.setDrawColor(200, 200, 200)
      doc.line(20, y + 2, pageWidth - 20, y + 2)
      doc.setTextColor(0, 0, 0)
      y += 10
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
      addSectionTitle('Experience professionnelle')
      data.experience.forEach((exp: any) => {
        if (!exp.title) return
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(exp.title, 20, y)
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(100, 100, 100)
        doc.text(`${exp.company || ''} | ${exp.duration || ''}`, pageWidth - 20, y, { align: 'right' })
        
        doc.setTextColor(0, 0, 0)
        y += 8
      })
      y += 5
    }

    // Education
    if (data.education && data.education.length > 0) {
      addSectionTitle('Formation')
      data.education.forEach((edu: any) => {
        if (!edu.degree) return
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(edu.degree, 20, y)
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(100, 100, 100)
        doc.text(`${edu.institution || ''} | ${edu.year || ''}`, pageWidth - 20, y, { align: 'right' })
        
        doc.setTextColor(0, 0, 0)
        y += 8
      })
      y += 5
    }
    
    // Skills
    if (data.skills && data.skills.length > 0) {
      addSectionTitle('Competences')
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(data.skills.join('  •  '), 20, y, { maxWidth: pageWidth - 40 })
      y += 15
    }

  } else {
    // Classic Template
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(22)
    doc.setFont("times", "bold")
    doc.text(data.personal?.name || 'Votre nom', pageWidth / 2, y, { align: 'center' })
    
    y += 8
    doc.setFontSize(11)
    doc.setFont("times", "normal")
    doc.text(`${data.personal?.email || ''} | ${data.personal?.phone || ''} | ${data.personal?.city || ''}`, pageWidth / 2, y, { align: 'center' })
    
    y += 15
    
    const addClassicSection = (title: string) => {
      doc.setFontSize(14)
      doc.setFont("times", "bold")
      doc.text(title.toUpperCase(), 20, y)
      doc.setDrawColor(0, 0, 0)
      doc.line(20, y + 2, pageWidth - 20, y + 2)
      y += 8
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
      addClassicSection('Experience professionnelle')
      data.experience.forEach((exp: any) => {
        if (!exp.title) return
        doc.setFontSize(12)
        doc.setFont("times", "bold")
        doc.text(exp.title, 20, y)
        
        doc.setFontSize(11)
        doc.setFont("times", "italic")
        doc.text(`${exp.company || ''}, ${exp.duration || ''}`, 20, y + 5)
        
        y += 12
      })
      y += 5
    }

    // Education
    if (data.education && data.education.length > 0) {
      addClassicSection('Formation')
      data.education.forEach((edu: any) => {
        if (!edu.degree) return
        doc.setFontSize(12)
        doc.setFont("times", "bold")
        doc.text(edu.degree, 20, y)
        
        doc.setFontSize(11)
        doc.setFont("times", "italic")
        doc.text(`${edu.institution || ''}, ${edu.year || ''}`, 20, y + 5)
        
        y += 12
      })
      y += 5
    }
    
    // Skills
    if (data.skills && data.skills.length > 0) {
      addClassicSection('Competences techniques')
      doc.setFontSize(11)
      doc.setFont("times", "normal")
      doc.text(data.skills.join(', '), 20, y, { maxWidth: pageWidth - 40 })
    }
  }

  return doc
}

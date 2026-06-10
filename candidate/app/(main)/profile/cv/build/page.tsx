'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, ChevronUp, ChevronDown, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/auth'
import { clearLatestDraft, loadLatestDraft, saveLatestDraft } from '@/lib/cv-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import * as z from 'zod'
import { CVPreview } from '@/components/cv-preview'
import { StepProgressBar } from '@/components/step-progress-bar'

const steps = ['Profil', 'Formation', 'Experience', 'Competences', 'Validation']

const tunisianCities = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Le Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Sfax',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Tozeur',
  'Kébili',
  'Gafsa',
  'Bouarada',
].filter((value, index, list) => list.indexOf(value) === index)

const degreeOptions = [
  'Baccalauréat',
  'BTS',
  'Licence',
  'Licence Appliquée',
  'Master',
  'Ingénieur',
  'Doctorat',
  'CAP',
  'Autre',
]

const namePattern = /^[A-Za-zÀ-ÿ'\-\s.]{2,80}$/
const phonePattern = /^\+?[0-9\s\-()]{8,20}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const textPattern = /^.{2,120}$/
const skillPattern = /^[A-Za-zÀ-ÿ0-9+#./\-\s]{2,40}$/
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

const currentYear = new Date().getFullYear()
const monthFormatter = new Intl.DateTimeFormat('fr-TN', { month: 'short', year: 'numeric' })

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const monthToDate = (value: string) => {
  if (!monthPattern.test(value)) return null
  return new Date(`${value}-01T00:00:00`)
}

const formatMonth = (value: string) => {
  const date = monthToDate(value)
  if (!date) return ''
  const label = monthFormatter.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const buildExperienceDuration = (
  startDate?: string,
  endDate?: string,
  isCurrent?: boolean,
  fallback?: string,
) => {
  const start = startDate?.trim() || ''
  const end = endDate?.trim() || ''
  const startLabel = formatMonth(start)
  const endLabel = isCurrent ? 'Present' : formatMonth(end)

  if (startLabel && endLabel) {
    return `${startLabel} - ${endLabel}`
  }
  if (startLabel && isCurrent) {
    return `${startLabel} - Present`
  }
  if (fallback && fallback.trim().length > 0) {
    return fallback.trim()
  }
  return ''
}

const baseBuilderSchema = z.object({
  personal: z.object({
    name: z.string().trim().min(2, 'Nom requis').max(80, 'Nom trop long').regex(namePattern, 'Lettres uniquement, pas de chiffres ni emoji'),
    email: z.string().trim().regex(emailPattern, 'Adresse email invalide'),
    phone: z.string().trim().regex(phonePattern, 'Numéro de téléphone invalide'),
    city: z.string().trim().min(1, 'Sélectionnez une ville').refine((value) => tunisianCities.includes(value), 'Sélectionnez une ville tunisienne'),
  }),
  education: z.array(z.object({
    degree: z.string().trim().min(1, 'Sélectionnez un diplôme').refine((value) => degreeOptions.includes(value), 'Sélectionnez un diplôme valide'),
    field: z.string().trim().min(2, 'Domaine requis').max(80, 'Domaine trop long'),
    institution: z.string().trim().min(2, 'Établissement requis').max(120, 'Établissement trop long'),
    year: z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'Année sur 4 chiffres')
      .refine((year) => {
        const y = Number(year)
        return y >= 1970 && y <= currentYear + 6
      }, 'Année hors plage valide'),
  })).min(1, 'Ajoutez au moins une formation').max(10, 'Maximum 10 formations'),
  experience: z.array(
    z
      .object({
        title: z.string().trim().min(2, 'Intitulé du poste requis').max(80, 'Intitulé trop long'),
        company: z.string().trim().min(2, 'Entreprise requise').max(120, 'Nom trop long'),
        startDate: z.string().trim().regex(monthPattern, 'Sélectionnez un mois de début valide'),
        endDate: z.string().trim().optional(),
        isCurrent: z.boolean().optional(),
        duration: z.string().trim().max(60, 'Durée trop longue').optional(),
        description: z.string().trim().min(10, 'Description trop courte (min 10 caractères)').max(500, 'Description trop longue'),
      })
      .superRefine((entry, ctx) => {
        const start = monthToDate(entry.startDate)
        if (!start) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Sélectionnez un mois de début valide', path: ['startDate'] })
          return
        }

        if (entry.isCurrent) return

        const end = monthToDate((entry.endDate || '').trim())
        if (!end) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Sélectionnez un mois de fin valide', path: ['endDate'] })
          return
        }

        if (end.getTime() < start.getTime()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'La date de fin doit être après la date de début', path: ['endDate'] })
        }
      }),
  ).max(20, 'Maximum 20 expériences'),
  skills: z.array(z.string().trim().min(2).max(40).regex(skillPattern, 'Compétence invalide')).min(1, 'Ajoutez au moins une compétence').max(25, 'Maximum 25 compétences'),
  languages: z.array(z.object({
    name: z.string().trim().min(2, 'Nom requis').max(50),
    level: z.string().trim().min(2, 'Niveau requis').max(50),
  })).max(10).optional(),
  links: z.array(z.object({
    name: z.string().trim().min(2, 'Nom requis').max(50),
    url: z.string().trim().url('URL invalide').max(300),
  })).max(5).optional(),
  coverNote: z.string().trim().max(1000, 'Note de motivation trop longue').optional(),
  template: z.enum(['modern', 'classic']),
})

const builderSchema = baseBuilderSchema.superRefine((data, ctx) => {
  const skillSet = new Set<string>()
  data.skills.forEach((skill, index) => {
    const normalized = skill.trim().toLowerCase()
    if (skillSet.has(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Compétence en double — supprimez-la',
        path: ['skills', index],
      })
      return
    }
    skillSet.add(normalized)
  })

  const educationSet = new Set<string>()
  data.education.forEach((entry, index) => {
    const normalized = [entry.degree, entry.institution, entry.year]
      .map((value) => value.trim().toLowerCase())
      .join('|')
    if (educationSet.has(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Formation en double — supprimez-la',
        path: ['education', index],
      })
      return
    }
    educationSet.add(normalized)
  })

  const experienceSet = new Set<string>()
  data.experience.forEach((entry, index) => {
    const normalized = [entry.title, entry.company, entry.startDate, entry.endDate || '', entry.description]
      .map((value) => value.trim().toLowerCase())
      .join('|')
    if (experienceSet.has(normalized)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Expérience en double — supprimez-la',
        path: ['experience', index],
      })
      return
    }
    experienceSet.add(normalized)
  })
})

type TemplateType = 'modern' | 'classic'

interface EducationEntry {
  id: string
  degree: string
  field: string
  institution: string
  year: string
}

interface ExperienceEntry {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  isCurrent: boolean
  duration: string
  description: string
}

interface LanguageEntry {
  id: string
  name: string
  level: string
}

interface LinkEntry {
  id: string
  name: string
  url: string
}

interface FormState {
  personal: {
    name: string
    email: string
    phone: string
    city: string
  }
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: string[]
  languages: LanguageEntry[]
  links: LinkEntry[]
  skillInput: string
  coverNote: string
  template: TemplateType
}

const initialState: FormState = {
  personal: { name: '', email: '', phone: '', city: '' },
  education: [{ id: makeId(), degree: '', field: '', institution: '', year: '' }],
  experience: [],
  skills: [],
  languages: [],
  links: [],
  skillInput: '',
  coverNote: '',
  template: 'modern',
}

const sanitizeName = (value: string) => value.replace(/[^A-Za-zÀ-ÿ'\-\s]/g, '').replace(/\s+/g, ' ')
const sanitizePhone = (value: string) => value.replace(/[^0-9+\-()\s]/g, '')

const scrollAndFocus = (element: HTMLElement | null) => {
  if (!element) return
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  if (typeof (element as HTMLInputElement).focus === 'function') {
    ;(element as HTMLInputElement).focus()
  }
}

const buildErrorMap = (issues: z.ZodIssue[], form: FormState) => {
  const nextErrors: Record<string, string> = {}
  let firstKey = ''

  issues.forEach((issue) => {
    const path = [...issue.path]
    if (path[0] === 'education' && typeof path[1] === 'number') {
      const entry = form.education[path[1]]
      if (entry) path[1] = entry.id
    }
    if (path[0] === 'experience' && typeof path[1] === 'number') {
      const entry = form.experience[path[1]]
      if (entry) path[1] = entry.id
    }

    const key = path.join('.') || 'form'
    if (!firstKey) firstKey = key
    nextErrors[key] = issue.message
  })

  return { nextErrors, firstKey }
}

const resolveFocusKey = (key: string, form: FormState) => {
  if (key.startsWith('personal.')) return key
  if (key.startsWith('education.')) {
    const [, second] = key.split('.')
    const fallbackId = form.education[0]?.id
    const entryId = form.education.find((entry) => entry.id === second)?.id || fallbackId
    return entryId ? `education.${entryId}.degree` : 'education'
  }
  if (key.startsWith('experience.')) {
    const [, second] = key.split('.')
    const fallbackId = form.experience[0]?.id
    const entryId = form.experience.find((entry) => entry.id === second)?.id || fallbackId
    return entryId ? `experience.${entryId}.title` : 'experience'
  }
  if (key === 'skills') return 'skills.input'
  if (key === 'coverNote') return 'coverNote'
  if (key === 'template') return 'template.modern'
  return key
}

export default function ProfileCVBuildPage() {
  const router = useRouter()

const personalFieldError = (field: keyof FormState['personal'], value: string) => {
  const trimmed = value.trim()
  if (field === 'name') return trimmed.length >= 2 && namePattern.test(trimmed) ? '' : 'Nom complet requis (lettres uniquement)'
  if (field === 'email') return trimmed && emailPattern.test(trimmed) ? '' : 'Adresse email invalide'
  if (field === 'phone') return trimmed && phonePattern.test(trimmed) ? '' : 'Numéro de téléphone invalide'
  if (field === 'city') return trimmed && tunisianCities.includes(trimmed) ? '' : 'Sélectionnez une ville tunisienne'
  return ''
}

const educationFieldError = (field: keyof Omit<EducationEntry, 'id'>, value: string) => {
  const trimmed = value.trim()
  if (field === 'degree') return trimmed && degreeOptions.includes(trimmed) ? '' : 'Sélectionnez un diplôme valide'
  if (field === 'field') return trimmed.length >= 2 ? '' : 'Domaine requis'
  if (field === 'institution') return trimmed.length >= 2 ? '' : 'Établissement requis'
  if (field === 'year') return /^\d{4}$/.test(trimmed) ? '' : 'Année sur 4 chiffres'
  return ''
}

const experienceFieldError = (
  field: keyof Omit<ExperienceEntry, 'id'>,
  value: string,
  entry: Omit<ExperienceEntry, 'id'>,
) => {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (field === 'title') return trimmed.length >= 2 ? '' : 'Intitulé du poste requis'
  if (field === 'company') return trimmed.length >= 2 ? '' : 'Entreprise requise'
  if (field === 'startDate') return monthPattern.test(trimmed) ? '' : 'Sélectionnez un mois de début valide'
  if (field === 'endDate') {
    if (entry.isCurrent) return ''
    if (!monthPattern.test(trimmed)) return 'Sélectionnez un mois de fin valide'
    const start = monthToDate(entry.startDate)
    const end = monthToDate(trimmed)
    if (start && end && end.getTime() < start.getTime()) return 'La date de fin doit être après la date de début'
    return ''
  }
  if (field === 'description') return trimmed.length >= 10 ? '' : 'Description trop courte (min 10 caractères)'
  return ''
}
  const { user } = useAuthStore()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(initialState)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [draftHydrated, setDraftHydrated] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({})

  const selectedCity = useMemo(() => {
    return tunisianCities.includes(form.personal.city) ? form.personal.city : ''
  }, [form.personal.city])

  const normalizedPayload = useMemo(() => ({
    personal: form.personal,
    education: form.education.map(({ id, ...rest }) => rest),
    experience: form.experience.map(({ id, ...rest }) => ({
      ...rest,
      duration: buildExperienceDuration(rest.startDate, rest.endDate, rest.isCurrent, rest.duration),
    })),
    skills: form.skills,
    languages: form.languages.map(({ id, ...rest }) => rest),
    links: form.links.map(({ id, ...rest }) => rest),
    coverNote: form.coverNote,
    template: form.template,
  }), [form])

  useEffect(() => {
    const draft = loadLatestDraft<FormState>(user?.id)
    if (draft) {
      setForm({
        personal: {
          name: draft.personal?.name || '',
          email: draft.personal?.email || '',
          phone: draft.personal?.phone || '',
          city: draft.personal?.city || '',
        },
        education: Array.isArray(draft.education) && draft.education.length > 0
          ? draft.education.map((entry) => ({
              id: makeId(),
              degree: entry.degree || '',
              field: entry.field || '',
              institution: entry.institution || '',
              year: entry.year || '',
            }))
          : initialState.education,
        experience: Array.isArray(draft.experience)
          ? draft.experience.map((entry) => ({
              id: makeId(),
              title: entry.title || '',
              company: entry.company || '',
              startDate: entry.startDate || '',
              endDate: entry.endDate || '',
              isCurrent: entry.isCurrent === true || (!entry.endDate && /present|présent/i.test(entry.duration || '')),
              duration: entry.duration || '',
              description: entry.description || '',
            }))
          : initialState.experience,
        skills: Array.isArray(draft.skills) ? draft.skills.filter(Boolean) : [],
        languages: Array.isArray(draft.languages)
          ? draft.languages.map((entry) => ({ id: makeId(), name: entry.name || '', level: entry.level || '' }))
          : initialState.languages,
        links: Array.isArray(draft.links)
          ? draft.links.map((entry) => ({ id: makeId(), name: entry.name || '', url: entry.url || '' }))
          : initialState.links,
        skillInput: '',
        coverNote: draft.coverNote || '',
        template: draft.template === 'classic' ? 'classic' : 'modern',
      })
    toast.info('Brouillon restauré')
    }
    setDraftHydrated(true)
  }, [user?.id])

  useEffect(() => {
    if (!draftHydrated) return
    const handle = window.setTimeout(() => {
      saveLatestDraft(user?.id, normalizedPayload)
    }, 600)

    return () => window.clearTimeout(handle)
  }, [draftHydrated, normalizedPayload, user?.id])

  const stepValidation = useMemo(() => {
    const personalCheck = baseBuilderSchema.pick({ personal: true }).safeParse({ personal: normalizedPayload.personal })
    const educationCheck = baseBuilderSchema.pick({ education: true }).safeParse({ education: normalizedPayload.education })
    const experienceCheck = baseBuilderSchema.pick({ experience: true }).safeParse({ experience: normalizedPayload.experience })
    const skillsCheck = baseBuilderSchema.pick({ skills: true, coverNote: true, template: true, languages: true, links: true }).safeParse({
      skills: normalizedPayload.skills,
      coverNote: normalizedPayload.coverNote,
      template: normalizedPayload.template,
      languages: normalizedPayload.languages,
      links: normalizedPayload.links,
    })
    const fullCheck = builderSchema.safeParse(normalizedPayload)

    const firstIssue = (result: z.SafeParseReturnType<any, any>) =>
      result.success ? '' : result.error.issues[0]?.message || 'Please complete required fields'

    return {
      personalValid: personalCheck.success,
      educationValid: educationCheck.success,
      experienceValid: experienceCheck.success,
      skillsValid: skillsCheck.success,
      allValid: fullCheck.success,
      personalError: firstIssue(personalCheck),
      educationError: firstIssue(educationCheck),
      experienceError: firstIssue(experienceCheck),
      skillsError: firstIssue(skillsCheck),
      allError: firstIssue(fullCheck),
    }
  }, [normalizedPayload])

  const updatePersonal = (field: keyof FormState['personal'], value: string) => {
    const nextValue = field === 'name' ? sanitizeName(value) : field === 'phone' ? sanitizePhone(value) : value
    setForm((prev) => ({ ...prev, personal: { ...prev.personal, [field]: nextValue } }))
    setFieldErrors((prev) => ({ ...prev, [`personal.${field}`]: '' }))
  }

  const updateEducation = (id: string, field: keyof Omit<EducationEntry, 'id'>, value: string) => {
    setForm((prev) => {
      const copy = prev.education.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
      return { ...prev, education: copy }
    })
    setFieldErrors((prev) => ({ ...prev, [`education.${id}.${field}`]: '' }))
  }

  const updateExperience = <K extends keyof Omit<ExperienceEntry, 'id'>>(
    id: string,
    field: K,
    value: Omit<ExperienceEntry, 'id'>[K],
  ) => {
    setForm((prev) => {
      const copy = prev.experience.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
      return { ...prev, experience: copy }
    })
    setFieldErrors((prev) => ({ ...prev, [`experience.${id}.${field}`]: '' }))
  }

  const registerFieldRef = (key: string) => (element: HTMLElement | null) => {
    fieldRefs.current[key] = element
  }

  const validatePersonalBlur = (field: keyof FormState['personal']) => {
    const message = personalFieldError(field, form.personal[field])
    setFieldErrors((prev) => ({ ...prev, [`personal.${field}`]: message }))
  }

  const validateEducationBlur = (id: string, field: keyof Omit<EducationEntry, 'id'>, value: string) => {
    const message = educationFieldError(field, value)
    setFieldErrors((prev) => ({ ...prev, [`education.${id}.${field}`]: message }))
  }

  const validateExperienceBlur = (
    id: string,
    field: keyof Omit<ExperienceEntry, 'id'>,
    value: string,
    entry: Omit<ExperienceEntry, 'id'>,
  ) => {
    const message = experienceFieldError(field, value, entry)
    setFieldErrors((prev) => ({ ...prev, [`experience.${id}.${field}`]: message }))
  }

  const validateStep = (targetStep: number) => {
    const partialChecks: Array<z.SafeParseReturnType<any, any>> = []

    if (targetStep >= 1) {
      partialChecks.push(baseBuilderSchema.pick({ personal: true }).safeParse({ personal: normalizedPayload.personal }))
    }
    if (targetStep >= 2) {
      partialChecks.push(baseBuilderSchema.pick({ education: true }).safeParse({ education: normalizedPayload.education }))
    }
    if (targetStep >= 3) {
      partialChecks.push(baseBuilderSchema.pick({ experience: true }).safeParse({ experience: normalizedPayload.experience }))
    }
    if (targetStep >= 4) {
      partialChecks.push(baseBuilderSchema.pick({ skills: true, coverNote: true, template: true, languages: true, links: true }).safeParse({
        skills: normalizedPayload.skills,
        coverNote: normalizedPayload.coverNote,
        template: normalizedPayload.template,
        languages: normalizedPayload.languages,
        links: normalizedPayload.links,
      }))
    }

    const issues = partialChecks.flatMap((result) => result.success ? [] : result.error.issues)
    if (issues.length > 0) {
      const { nextErrors, firstKey } = buildErrorMap(issues, form)
      setFieldErrors(nextErrors)
      scrollAndFocus(fieldRefs.current[resolveFocusKey(firstKey, form)])
      return false
    }

    return true
  }

  const prevStep = () => {
    if (step === 1) {
      router.push('/profile/cv')
      return
    }
    setStep((s) => Math.max(1, s - 1))
  }

  const addSkill = () => {
    const value = form.skillInput.trim()
    if (!value) return
    if (!skillPattern.test(value)) {
      toast.error('Compétence invalide — utilisez des lettres ou chiffres')
      return
    }
    if (form.skills.length >= 25) {
      toast.error('Maximum 25 compétences')
      return
    }
    if (form.skills.includes(value)) {
      setForm((prev) => ({ ...prev, skillInput: '' }))
      return
    }
    setForm((prev) => ({ ...prev, skills: [...prev.skills, value], skillInput: '' }))
    setFieldErrors((prev) => ({ ...prev, skills: '' }))
  }

  const removeSkill = (value: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((skill) => skill !== value) }))
  }

  const addEducation = () => {
    if (form.education.length >= 10) {
      toast.error('Maximum 10 formations')
      return
    }
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { id: makeId(), degree: '', field: '', institution: '', year: '' }],
    }))
  }

  const addExperience = () => {
    if (form.experience.length >= 20) {
      toast.error('Maximum 20 expériences')
      return
    }
    setForm((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: makeId(),
          title: '',
          company: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          duration: '',
          description: '',
        },
      ],
    }))
  }

  const addLanguage = () => {
    if (form.languages.length >= 10) return toast.error('Maximum 10 languages allowed')
    setForm(prev => ({ ...prev, languages: [...prev.languages, { id: makeId(), name: '', level: '' }] }))
  }

  const addLink = () => {
    if (form.links.length >= 5) return toast.error('Maximum 5 links allowed')
    setForm(prev => ({ ...prev, links: [...prev.links, { id: makeId(), name: '', url: '' }] }))
  }

  const moveItem = (arrayName: 'education' | 'experience' | 'languages' | 'links', index: number, direction: 'up' | 'down') => {
    setForm(prev => {
      const arr = [...prev[arrayName]] as any[]
      if (direction === 'up' && index > 0) {
        [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      } else if (direction === 'down' && index < arr.length - 1) {
        [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]]
      }
      return { ...prev, [arrayName]: arr }
    })
  }

  const saveGeneratedCV = async () => {
    const validation = builderSchema.safeParse(normalizedPayload)

    if (!validation.success) {
      const { nextErrors, firstKey } = buildErrorMap(validation.error.issues, form)
      setFieldErrors(nextErrors)
      toast.error('Veuillez corriger les champs en erreur')
      scrollAndFocus(fieldRefs.current[resolveFocusKey(firstKey, form)])
      const firstInvalidStep = validation.error.issues.some((issue) => issue.path[0] === 'personal') ? 1
        : validation.error.issues.some((issue) => issue.path[0] === 'education') ? 2
        : validation.error.issues.some((issue) => issue.path[0] === 'experience') ? 3
        : 4
      setStep(firstInvalidStep)
      return
    }

    setSaving(true)
    try {
      await api.post('/cvs/generated', {
        name: `Generated CV - ${form.personal.name.trim()}`,
        template: form.template,
        formData: {
          personal: form.personal,
          education: form.education.map(({ id, ...rest }) => rest),
          experience: normalizedPayload.experience,
          skills: form.skills,
          languages: form.languages.map(({ id, ...rest }) => rest),
          links: form.links.map(({ id, ...rest }) => rest),
          coverNote: form.coverNote,
          template: form.template,
        },
      })

      clearLatestDraft(user?.id)
      toast.success('CV enregistré dans votre bibliothèque')
      router.push('/profile/cv')
    } catch {
      toast.error('Échec de l\'enregistrement du CV')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-page">
      {/* Mobile Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 z-50 bg-page overflow-y-auto lg:hidden">
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border flex justify-between items-center z-10">
            <h2 className="text-[15px] font-semibold text-ink">Aperçu du CV</h2>
            <Button variant="ghost" size="sm" onClick={() => setPreviewMode(false)}><X className="h-5 w-5" /></Button>
          </div>
          <div className="p-4 bg-page min-h-screen">
             <CVPreview data={normalizedPayload} template={form.template} />
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className={`flex flex-col w-full lg:w-1/2 h-screen overflow-y-auto ${previewMode ? 'hidden lg:flex' : 'flex'}`}>
        <header className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
          <div className="px-4 py-3">
            <div className="flex justify-between items-center">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 text-ink3 min-h-[44px] touch-manipulation -ml-1"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-[12px]">Retour</span>
              </button>
              <Button variant="outline" size="sm" className="lg:hidden gap-2" onClick={() => setPreviewMode(true)}>
                <Eye className="w-4 h-4" /> Aperçu
              </Button>
            </div>
            <StepProgressBar currentStep={step} totalSteps={steps.length} stepLabels={steps} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 max-w-xl mx-auto w-full">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nom complet *</Label>
                  <Input
                    ref={registerFieldRef('personal.name')}
                    value={form.personal.name}
                    onChange={(e) => updatePersonal('name', e.target.value)}
                    onBlur={() => validatePersonalBlur('name')}
                    placeholder="Ex: Mohamed Ali"
                    autoComplete="name"
                  />
                  {fieldErrors['personal.name'] && <p className="mt-1 text-[11px] text-err">{fieldErrors['personal.name']}</p>}
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input ref={registerFieldRef('personal.email')} type="email" value={form.personal.email} onChange={(e) => updatePersonal('email', e.target.value)} onBlur={() => validatePersonalBlur('email')} autoComplete="email" />
                  {fieldErrors['personal.email'] && <p className="mt-1 text-[11px] text-err">{fieldErrors['personal.email']}</p>}
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input ref={registerFieldRef('personal.phone')} value={form.personal.phone} onChange={(e) => updatePersonal('phone', e.target.value)} onBlur={() => validatePersonalBlur('phone')} placeholder="+216 XX XXX XXX" inputMode="tel" />
                  {fieldErrors['personal.phone'] && <p className="mt-1 text-[11px] text-err">{fieldErrors['personal.phone']}</p>}
                </div>
                <div>
                  <Label>City *</Label>
                  <Select value={selectedCity} onValueChange={(value) => updatePersonal('city', value)}>
                    <SelectTrigger ref={registerFieldRef('personal.city')} className="mt-1.5">
                      <SelectValue placeholder="Select a Tunisian city" />
                    </SelectTrigger>
                    <SelectContent>
                      {tunisianCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors['personal.city'] && <p className="mt-1 text-[11px] text-err">{fieldErrors['personal.city']}</p>}
                </div>

                <div className="pt-4 border-t mt-4">
                  <h3 className="font-semibold text-[13px] mb-3">Liens Professionnels (Optionnel)</h3>
                  {form.links.map((item, index) => (
                     <div key={item.id} className="relative space-y-2 rounded-lg border border-border bg-card2 p-3 mb-2">
                      <button type="button" onClick={() => setForm(prev => ({...prev, links: prev.links.filter(l => l.id !== item.id)}))} className="absolute right-2 top-2 text-ink4 hover:text-err"><X className="h-4 w-4" /></button>
                      <Input placeholder="Nom (ex: LinkedIn, Portfolio)" value={item.name} onChange={e => {
                        const copy = [...form.links]; copy[index].name = e.target.value; setForm(prev => ({...prev, links: copy}))
                      }} />
                      <Input placeholder="URL (ex: https://...)" value={item.url} onChange={e => {
                        const copy = [...form.links]; copy[index].url = e.target.value; setForm(prev => ({...prev, links: copy}))
                      }} />
                     </div>
                  ))}
                  <Button type="button" variant="outline" className="w-full text-[12px]" onClick={addLink} disabled={form.links.length >= 5}><Plus className="h-3 w-3 mr-1"/> Ajouter un lien</Button>
                </div>

                <Button className="w-full mt-4" disabled={!stepValidation.personalValid} onClick={() => validateStep(1) && setStep(2)}>Suivant : Formation</Button>
                {!stepValidation.personalValid && <p className="text-[11px] text-ink4">{stepValidation.personalError}</p>}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Formation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.education.map((item, index) => (
                  <div key={item.id} className="relative space-y-2 rounded-lg border border-border bg-card2 p-3">
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button type="button" onClick={() => moveItem('education', index, 'up')} disabled={index === 0} className="text-ink4 hover:text-ink disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                      <button type="button" onClick={() => moveItem('education', index, 'down')} disabled={index === form.education.length - 1} className="text-ink4 hover:text-ink disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          education: prev.education.filter((entry) => entry.id !== item.id),
                        }))}
                        className="text-ink4 hover:text-err ml-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Select value={item.degree} onValueChange={(value) => updateEducation(item.id, 'degree', value)}>
                      <SelectTrigger ref={registerFieldRef(`education.${item.id}.degree`)} className="w-[calc(100%-80px)]">
                        <SelectValue placeholder="Select degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeOptions.map((degree) => (
                          <SelectItem key={degree} value={degree}>
                            {degree}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors[`education.${item.id}.degree`] && <p className="text-[11px] text-err">{fieldErrors[`education.${item.id}.degree`]}</p>}
                    <Input
                      ref={registerFieldRef(`education.${item.id}.field`)}
                      placeholder="Domaine (ex: Informatique, Gestion)"
                      value={item.field}
                      onChange={(e) => updateEducation(item.id, 'field', e.target.value)}
                      onBlur={() => validateEducationBlur(item.id, 'field', item.field)}
                    />
                    {fieldErrors[`education.${item.id}.field`] && <p className="text-[11px] text-err">{fieldErrors[`education.${item.id}.field`]}</p>}
                    <Input
                      ref={registerFieldRef(`education.${item.id}.institution`)}
                      placeholder="Établissement (ex: ESPRIT, IHEC)"
                      value={item.institution}
                      onChange={(e) => updateEducation(item.id, 'institution', e.target.value)}
                      onBlur={() => validateEducationBlur(item.id, 'institution', item.institution)}
                    />
                    {fieldErrors[`education.${item.id}.institution`] && <p className="text-[11px] text-err">{fieldErrors[`education.${item.id}.institution`]}</p>}
                    <Input
                      ref={registerFieldRef(`education.${item.id}.year`)}
                      placeholder="Année (ex: 2026)"
                      value={item.year}
                      onChange={(e) => updateEducation(item.id, 'year', e.target.value)}
                      onBlur={() => validateEducationBlur(item.id, 'year', item.year)}
                    />
                    {fieldErrors[`education.${item.id}.year`] && <p className="text-[11px] text-err">{fieldErrors[`education.${item.id}.year`]}</p>}
                  </div>
                ))}
                {fieldErrors['education'] && <p className="text-[11px] text-err">{fieldErrors['education']}</p>}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={form.education.length >= 10}
                  onClick={addEducation}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une formation
                </Button>
                <p className="text-[11px] text-ink4 text-center">{form.education.length}/10 entries</p>
                <Button className="w-full mt-4" disabled={!stepValidation.educationValid} onClick={() => validateStep(2) && setStep(3)}>Suivant : Experience</Button>
                {!stepValidation.educationValid && (
                  <p className="text-[11px] text-ink4">{stepValidation.educationError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Experience professionnelle</CardTitle>
                <p className="text-[11px] text-ink4">Optionnel si vous êtes débutant, mais fortement recommandé.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.experience.map((item, index) => (
                  <div key={item.id} className="relative space-y-2 rounded-lg border border-border bg-card2 p-3">
                    <div className="absolute right-2 top-2 flex gap-1">
                      <button type="button" onClick={() => moveItem('experience', index, 'up')} disabled={index === 0} className="text-ink4 hover:text-ink disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                      <button type="button" onClick={() => moveItem('experience', index, 'down')} disabled={index === form.experience.length - 1} className="text-ink4 hover:text-ink disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({
                          ...prev,
                          experience: prev.experience.filter((entry) => entry.id !== item.id),
                        }))}
                        className="text-ink4 hover:text-err ml-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Input
                      ref={registerFieldRef(`experience.${item.id}.title`)}
                      placeholder="Titre du poste (ex: Ingénieur Logiciel)"
                      value={item.title}
                      className="w-[calc(100%-80px)]"
                      onChange={(e) => updateExperience(item.id, 'title', e.target.value)}
                      onBlur={() => validateExperienceBlur(item.id, 'title', item.title, item)}
                    />
                    {fieldErrors[`experience.${item.id}.title`] && <p className="text-[11px] text-err">{fieldErrors[`experience.${item.id}.title`]}</p>}
                    <Input
                      ref={registerFieldRef(`experience.${item.id}.company`)}
                      placeholder="Entreprise"
                      value={item.company}
                      onChange={(e) => updateExperience(item.id, 'company', e.target.value)}
                      onBlur={() => validateExperienceBlur(item.id, 'company', item.company, item)}
                    />
                    {fieldErrors[`experience.${item.id}.company`] && <p className="text-[11px] text-err">{fieldErrors[`experience.${item.id}.company`]}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[11px]">Date de debut *</Label>
                        <Input
                          ref={registerFieldRef(`experience.${item.id}.startDate`)}
                          type="month"
                          value={item.startDate}
                          onChange={(e) => updateExperience(item.id, 'startDate', e.target.value)}
                          onBlur={() => validateExperienceBlur(item.id, 'startDate', item.startDate, item)}
                        />
                        {fieldErrors[`experience.${item.id}.startDate`] && <p className="text-[11px] text-err">{fieldErrors[`experience.${item.id}.startDate`]}</p>}
                      </div>
                      <div>
                        <Label className="text-[11px]">Date de fin *</Label>
                        <Input
                          ref={registerFieldRef(`experience.${item.id}.endDate`)}
                          type="month"
                          value={item.endDate}
                          disabled={item.isCurrent}
                          onChange={(e) => updateExperience(item.id, 'endDate', e.target.value)}
                          onBlur={() => validateExperienceBlur(item.id, 'endDate', item.endDate, item)}
                        />
                        {fieldErrors[`experience.${item.id}.endDate`] && <p className="text-[11px] text-err">{fieldErrors[`experience.${item.id}.endDate`]}</p>}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-ink3">
                      <input
                        type="checkbox"
                        checked={item.isCurrent}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setForm((prev) => ({
                            ...prev,
                            experience: prev.experience.map((entry) =>
                              entry.id === item.id
                                ? {
                                    ...entry,
                                    isCurrent: checked,
                                    endDate: checked ? '' : entry.endDate,
                                  }
                                : entry,
                            ),
                          }))
                          if (checked) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              [`experience.${item.id}.endDate`]: '',
                            }))
                          }
                        }}
                      />
                      J'occupe ce poste actuellement
                    </label>
                    <p className="text-[11px] text-ink4">
                      Periode affichee: {buildExperienceDuration(item.startDate, item.endDate, item.isCurrent, item.duration) || '-'}
                    </p>
                    <Textarea
                      ref={registerFieldRef(`experience.${item.id}.description`)}
                      placeholder="Ex: Développé une plateforme web augmentant les ventes de 20%. Mettez en avant vos résultats et technologies utilisées..."
                      value={item.description}
                      className="min-h-[100px]"
                      onChange={(e) => updateExperience(item.id, 'description', e.target.value)}
                      onBlur={() => validateExperienceBlur(item.id, 'description', item.description, item)}
                    />
                    {fieldErrors[`experience.${item.id}.description`] && <p className="text-[11px] text-err">{fieldErrors[`experience.${item.id}.description`]}</p>}
                  </div>
                ))}
                {fieldErrors['experience'] && <p className="text-[11px] text-err">{fieldErrors['experience']}</p>}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={form.experience.length >= 20}
                  onClick={addExperience}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter une experience
                </Button>
                <p className="text-[11px] text-ink4 text-center">{form.experience.length}/20 entries</p>
                <Button className="w-full mt-4" disabled={!stepValidation.experienceValid} onClick={() => validateStep(3) && setStep(4)}>Suivant : Competences</Button>
                {!stepValidation.experienceValid && (
                  <p className="text-[11px] text-ink4">{stepValidation.experienceError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Competences, langues et modele</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label>Compétences *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      ref={registerFieldRef('skills.input')}
                      value={form.skillInput}
                      placeholder="Ex: React, Gestion de Projet, SEO..."
                      onChange={(e) => setForm((prev) => ({ ...prev, skillInput: e.target.value }))}
                      onBlur={() => {
                        const value = form.skillInput.trim()
                        if (!value) return
                        if (!skillPattern.test(value)) {
                          setFieldErrors((prev) => ({ ...prev, skills: 'Compétence invalide — utilisez des lettres ou chiffres' }))
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>Ajouter</Button>
                  </div>
                  {fieldErrors['skills'] && <p className="text-[11px] text-err mt-1">{fieldErrors['skills']}</p>}
                  <p className="text-[11px] text-ink4 mt-1 mb-2">{form.skills.length}/25 skills</p>
                  <div className="flex flex-wrap gap-2">
                    {form.skills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="rounded-lg border border-border bg-card2 px-2 py-1 text-[11px] text-ink hover:bg-card"
                        title="Remove skill"
                      >
                        {skill} <X className="inline w-3 h-3 ml-1"/>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label>Langues (Optionnel)</Label>
                  <div className="space-y-2 mt-2">
                    {form.languages.map((item, index) => (
                      <div key={item.id} className="relative flex gap-2 rounded-lg border border-border bg-card2 p-2 pr-8">
                        <button type="button" onClick={() => setForm(prev => ({...prev, languages: prev.languages.filter(l => l.id !== item.id)}))} className="absolute right-2 top-3 text-ink4 hover:text-err"><X className="h-4 w-4" /></button>
                        <Input className="h-8 text-sm" placeholder="Langue (ex: Anglais)" value={item.name} onChange={e => {
                          const copy = [...form.languages]; copy[index].name = e.target.value; setForm(prev => ({...prev, languages: copy}))
                        }} />
                        <Input className="h-8 text-sm" placeholder="Niveau (ex: B2, Courant)" value={item.level} onChange={e => {
                          const copy = [...form.languages]; copy[index].level = e.target.value; setForm(prev => ({...prev, languages: copy}))
                        }} />
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="w-full text-[12px]" onClick={addLanguage} disabled={form.languages.length >= 10}>
                      <Plus className="h-3 w-3 mr-1"/> Ajouter une langue
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label>Note de Motivation (Profil)</Label>
                  <p className="text-[11px] text-ink4 mb-2">Un court paragraphe (3-4 lignes) pour vous présenter et expliquer ce que vous recherchez.</p>
                  <Textarea
                    ref={registerFieldRef('coverNote')}
                    value={form.coverNote}
                    onChange={(e) => setForm((prev) => ({ ...prev, coverNote: e.target.value }))}
                    onBlur={() => {
                      if (form.coverNote.trim().length > 1000) {
                        setFieldErrors((prev) => ({ ...prev, coverNote: 'Cover note is too long' }))
                      }
                    }}
                    placeholder="Ex: Passionné par l'innovation, je suis à la recherche d'un poste où je pourrai appliquer mes compétences..."
                    className="min-h-[100px]"
                  />
                  {fieldErrors['coverNote'] && <p className="text-[11px] text-err">{fieldErrors['coverNote']}</p>}
                </div>

                <div className="pt-4 border-t">
                  <Label>Design Template</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={form.template === 'modern' ? 'default' : 'outline'}
                      onClick={() => setForm((prev) => ({ ...prev, template: 'modern' }))}
                      className="flex-1"
                    >
                      Modern
                    </Button>
                    <Button
                      type="button"
                      variant={form.template === 'classic' ? 'default' : 'outline'}
                      onClick={() => setForm((prev) => ({ ...prev, template: 'classic' }))}
                      className="flex-1"
                    >
                      Classic
                    </Button>
                  </div>
                </div>

                <Button className="w-full mt-4" disabled={!stepValidation.skillsValid} onClick={() => validateStep(4) && setStep(5)}>Suivant : Validation</Button>
                {!stepValidation.skillsValid && (
                  <p className="text-[11px] text-ink4">{stepValidation.skillsError}</p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Verifier et enregistrer</CardTitle>
                <p className="text-[11px] text-ink4">Vérifiez l'aperçu avant d'enregistrer.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" disabled={saving || !stepValidation.allValid} onClick={saveGeneratedCV}>
                  {saving ? 'Sauvegarde en cours...' : 'Enregistrer mon CV dans la bibliothèque'}
                </Button>
                {!stepValidation.allValid && (
                  <p className="text-[11px] text-err">Veuillez corriger les erreurs dans les étapes précédentes.</p>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      {/* Desktop Live Preview Section */}
      <div className="hidden lg:block lg:w-1/2 border-l border-border bg-card2 overflow-y-auto h-screen p-8 relative">
          <div className="sticky top-0 mb-4 flex justify-between items-center z-10 bg-card2/90 backdrop-blur pb-2">
            <h2 className="text-[15px] font-semibold">Aperçu en direct</h2>
            <Badge variant="outline" className="bg-card">Modèle : {form.template}</Badge>
          </div>
          <div className="max-w-[800px] mx-auto shadow-[0_16px_40px_rgba(15,23,42,0.12)] rounded-sm overflow-hidden bg-white ring-1 ring-black/5">
             <CVPreview data={normalizedPayload} template={form.template} />
          </div>
      </div>
    </div>
  )
}

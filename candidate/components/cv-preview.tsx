import { Mail, MapPin, Phone, ExternalLink } from "lucide-react"

interface CVPreviewProps {
  data: any
  template: 'modern' | 'classic'
}

export function CVPreview({ data, template }: CVPreviewProps) {
  const safeData = data ?? {}
  const { personal, education, experience, skills, languages, links, coverNote } = safeData

  const name = personal?.name || "Votre Nom"
  const email = personal?.email || "email@exemple.com"
  const phone = personal?.phone || "+216 XX XXX XXX"
  const city = personal?.city || "Ville"

  if (template === 'classic') {
    return (
      <div className="w-full bg-white text-black p-6 sm:p-8 min-h-[800px] shadow-sm border font-serif text-sm">
        <div className="text-center mb-8 border-b-2 border-black pb-6">
          <h1 className="text-3xl font-bold uppercase tracking-widest mb-3">{name}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {email}</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {phone}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {city}</span>
          </div>
          {links && links.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2 text-xs">
              {links.map((link: any, i: number) => (
                <a key={link.id || i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                  <ExternalLink className="w-3 h-3" /> {link.name}: {link.url}
                </a>
              ))}
            </div>
          )}
        </div>

        {coverNote && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2 pb-1">Profil</h2>
            <p className="text-xs leading-relaxed text-slate-900 whitespace-pre-wrap">{coverNote}</p>
          </div>
        )}

        {experience && experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1">Expérience Professionnelle</h2>
            <div className="space-y-4">
              {experience.map((exp: any, i: number) => (
                <div key={exp.id || i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-sm">{exp.title || 'Poste'} <span className="font-normal italic">chez {exp.company || 'Entreprise'}</span></h3>
                    <span className="text-xs font-semibold whitespace-nowrap">{exp.duration || 'Durée'}</span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-slate-200">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1">Formation</h2>
            <div className="space-y-3">
              {education.map((edu: any, i: number) => (
                <div key={edu.id || i} className="flex justify-between items-baseline">
                  <div>
                    <h3 className="font-bold text-sm">{edu.degree || 'Diplôme'} {edu.field && `en ${edu.field}`}</h3>
                    <p className="text-xs text-black italic">{edu.institution || 'Établissement'}</p>
                  </div>
                  <span className="text-xs font-semibold">{edu.year || 'Année'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2 pb-1">Compétences</h2>
              <ul className="list-disc list-inside text-xs space-y-1 text-slate-900">
                {skills.map((skill: string, i: number) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase border-b border-gray-300 mb-2 pb-1">Langues</h2>
              <ul className="text-xs space-y-1 text-slate-900">
                {languages.map((lang: any, i: number) => (
                  <li key={i} className="flex justify-between">
                    <span className="font-semibold">{lang.name || 'Langue'}</span>
                    <span>{lang.level || 'Niveau'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Modern Template
  return (
    <div className="w-full bg-white text-black min-h-[800px] shadow-sm border font-sans text-sm flex flex-col">
      <div className="bg-[#1e293b] text-white p-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">{name}</h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-300 text-xs mt-4">
          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-blue-400" /> {email}</span>
          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-400" /> {phone}</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-400" /> {city}</span>
        </div>
        {links && links.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
            {links.map((link: any, i: number) => (
              <a key={link.id || i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                <ExternalLink className="w-3 h-3" /> {link.name}: {link.url}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1">
        {/* Left Column */}
        <div className="w-2/3 p-8 border-r border-slate-100">
          {coverNote && (
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-blue-500"></span> Profil
              </h2>
              <p className="text-xs leading-relaxed text-slate-900 whitespace-pre-wrap">{coverNote}</p>
            </div>
          )}

          {experience && experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-px bg-blue-500"></span> Expérience Professionnelle
              </h2>
              <div className="space-y-6">
                {experience.map((exp: any, i: number) => (
                  <div key={exp.id || i} className="relative pl-4 border-l-2 border-slate-200">
                    <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                    <h3 className="font-bold text-sm text-black">{exp.title || 'Poste'}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-blue-600">{exp.company || 'Entreprise'}</span>
                      <span className="text-[10px] uppercase font-bold text-black bg-slate-100 px-2 py-0.5 rounded">{exp.duration || 'Durée'}</span>
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="w-1/3 bg-slate-50 p-6">
          {skills && skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-2">Compétences</h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill: string, i: number) => (
                  <span key={i} className="bg-white border border-slate-200 text-black px-2 py-1 text-[10px] font-medium rounded-md">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education && education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-2">Formation</h2>
              <div className="space-y-4">
                {education.map((edu: any, i: number) => (
                  <div key={edu.id || i}>
                    <h3 className="font-bold text-xs text-black">{edu.degree || 'Diplôme'}</h3>
                    <p className="text-[10px] text-black font-medium">{edu.field && `${edu.field}`}</p>
                    <p className="text-[10px] text-black mt-1">{edu.institution || 'Établissement'}</p>
                    <p className="text-[10px] text-blue-500 font-bold mt-0.5">{edu.year || 'Année'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 border-b border-slate-200 pb-2">Langues</h2>
              <ul className="text-[11px] space-y-2">
                {languages.map((lang: any, i: number) => (
                  <li key={i} className="flex justify-between items-center border-b border-slate-200/50 pb-1 last:border-0">
                    <span className="font-semibold text-black">{lang.name || 'Langue'}</span>
                    <span className="text-black">{lang.level || 'Niveau'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

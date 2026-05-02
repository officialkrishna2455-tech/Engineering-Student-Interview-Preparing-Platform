"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

interface Education {
  college: string;
  degree: string;
  cgpa: string;
  gradYear: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  techStack: string;
  link: string;
}

interface Experience {
  id: number;
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Certification {
  id: number;
  name: string;
  issuer: string;
  year: string;
}

/* ------------------------------------------------------------------ */
/* Reusable Form Components                                            */
/* ------------------------------------------------------------------ */
const InputLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-white/70 mb-1.5">{children}</label>
);

const InputField = ({ ...props }: any) => (
  <input
    {...props}
    className={`w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all ${props.className || ''}`}
  />
);

const TextAreaField = ({ ...props }: any) => (
  <textarea
    {...props}
    className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-y min-h-[100px]"
  />
);

/* ------------------------------------------------------------------ */
/* Resume Builder Component                                            */
/* ------------------------------------------------------------------ */
export default function ResumeBuilderPage() {
  const { data: session } = useSession();

  // State
  const [step, setStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const totalSteps = 6;

  // Track resume visit on page load
  useEffect(() => {
    if (!session?.user?.email) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/api/user/activity`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: session.user.email, action: "resume_visited" }),
    }).catch(() => {});
  }, [session]);

  // Form Data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "", email: "", phone: "", linkedin: "", github: ""
  });
  const [education, setEducation] = useState<Education>({
    college: "", degree: "", cgpa: "", gradYear: ""
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [skillInput, setSkillInput] = useState("");

  // Handlers
  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else setIsPreview(true);
  };
  const prevStep = () => setStep(step - 1);

  // Array Handlers
  const addProject = () => setProjects([...projects, { id: Date.now(), title: "", description: "", techStack: "", link: "" }]);
  const updateProject = (id: number, field: string, value: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const removeProject = (id: number) => setProjects(projects.filter(p => p.id !== id));

  const addExperience = () => setExperience([...experience, { id: Date.now(), company: "", role: "", duration: "", description: "" }]);
  const updateExperience = (id: number, field: string, value: string) => {
    setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };
  const removeExperience = (id: number) => setExperience(experience.filter(e => e.id !== id));

  const addCertification = () => setCertifications([...certifications, { id: Date.now(), name: "", issuer: "", year: "" }]);
  const updateCertification = (id: number, field: string, value: string) => {
    setCertifications(certifications.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const removeCertification = (id: number) => setCertifications(certifications.filter(c => c.id !== id));

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim() !== "") {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const removeSkill = (skillToRemove: string) => setSkills(skills.filter(s => s !== skillToRemove));

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      let y = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15
      const contentWidth = pageWidth - margin * 2

      // Header background
      doc.setFillColor(26, 26, 26)
      doc.rect(0, 0, pageWidth, 35, 'F')

      // Name
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text(
        (personalInfo.name || 'Your Name').toUpperCase(),
        margin, 15
      )

      // Contact
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const contact = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.linkedin ? 'LinkedIn' : '',
        personalInfo.github ? 'GitHub' : ''
      ].filter(Boolean).join('  |  ')
      doc.text(contact, margin, 25)

      y = 45
      doc.setTextColor(0, 0, 0)

      // Helper functions
      const addSectionTitle = (title: string) => {
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(title.toUpperCase(), margin, y)
        doc.setDrawColor(0, 0, 0)
        doc.line(margin, y + 1, pageWidth - margin, y + 1)
        y += 8
      }

      const addText = (
        text: string,
        fontSize: number,
        bold: boolean = false,
        color: number[] = [0, 0, 0]
      ) => {
        doc.setFontSize(fontSize)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setTextColor(color[0], color[1], color[2])
        const lines = doc.splitTextToSize(text, contentWidth)
        doc.text(lines, margin, y)
        y += lines.length * (fontSize * 0.4) + 2
      }

      const checkNewPage = () => {
        if (y > 270) {
          doc.addPage()
          y = 20
        }
      }

      // EDUCATION
      addSectionTitle('Education')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(education.college || '', margin, y)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(education.gradYear || '', pageWidth - margin, y,
        { align: 'right' })
      y += 5
      doc.setFontSize(10)
      doc.text(education.degree || '', margin, y)
      doc.text(`CGPA: ${education.cgpa || ''}`,
        pageWidth - margin, y, { align: 'right' })
      y += 12
      checkNewPage()

      // PROJECTS
      if (projects.length > 0) {
        addSectionTitle('Projects')
        projects.forEach(p => {
          checkNewPage()
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(0, 0, 0)
          doc.text(p.title || '', margin, y)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.text(p.techStack || '', pageWidth - margin, y,
            { align: 'right' })
          y += 5
          doc.setFontSize(10)
          doc.setTextColor(50, 50, 50)
          const desc = doc.splitTextToSize(
            p.description || '', contentWidth
          )
          doc.text(desc, margin, y)
          y += desc.length * 4 + 6
          checkNewPage()
        })
      }

      // SKILLS
      if (skills.length > 0) {
        addSectionTitle('Skills')
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        const skillText = skills.join('  •  ')
        const skillLines = doc.splitTextToSize(
          skillText, contentWidth
        )
        doc.text(skillLines, margin, y)
        y += skillLines.length * 5 + 8
        checkNewPage()
      }

      // EXPERIENCE
      if (experience.length > 0) {
        addSectionTitle('Experience')
        experience.forEach(e => {
          checkNewPage()
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(0, 0, 0)
          doc.text(
            `${e.role || ''} at ${e.company || ''}`,
            margin, y
          )
          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          doc.text(e.duration || '', pageWidth - margin, y,
            { align: 'right' })
          y += 5
          doc.setFontSize(10)
          doc.setTextColor(50, 50, 50)
          const desc = doc.splitTextToSize(
            e.description || '', contentWidth
          )
          doc.text(desc, margin, y)
          y += desc.length * 4 + 6
        })
      }

      // CERTIFICATIONS
      if (certifications.length > 0) {
        addSectionTitle('Certifications')
        certifications.forEach(c => {
          checkNewPage()
          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(0, 0, 0)
          doc.text(c.name || '', margin, y)
          doc.setFontSize(10)
          doc.text(c.year || '', pageWidth - margin, y,
            { align: 'right' })
          y += 5
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(100, 100, 100)
          doc.text(c.issuer || '', margin, y)
          y += 8
        })
      }

      // Save PDF
      doc.save('resume.pdf')

    } catch (error) {
      console.error('PDF Error:', error)
      alert('PDF export failed. Please try again.')
    }
  }

  if (isPreview) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-16">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <div className="flex items-center justify-between glass-card p-6">
            <h1 className="text-2xl font-bold text-white">Your Resume</h1>
            <div className="flex gap-4">
              <button onClick={() => setIsPreview(false)} className="btn-ghost">Edit Content</button>
              <button onClick={handleExportPDF} className="btn-primary">Export as PDF</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-2xl mx-auto w-full max-w-[816px] text-black">
            <div id="resume-preview" className="bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Template 1: Clean Minimal with Dark Header */}
              <div className="bg-[#030303] text-white p-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase">{personalInfo.name || "Your Name"}</h1>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: '#e9ecef' }}>
                  {personalInfo.email && <span>{personalInfo.email}</span>}
                  {personalInfo.phone && <span>{personalInfo.phone}</span>}
                  {personalInfo.linkedin && (
                    <span>
                      <a href={personalInfo.linkedin} className="hover:text-brand-400">LinkedIn</a>
                    </span>
                  )}
                  {personalInfo.github && (
                    <span>
                      <a href={personalInfo.github} className="hover:text-brand-400">GitHub</a>
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Education */}
                {(education.college || education.degree) && (
                  <section>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #e9ecef', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#212529' }}>Education</h2>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '14px' }}>{education.college}</strong>
                        <span style={{ fontSize: '12px' }}>{education.gradYear}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px' }}>{education.degree}</span>
                        <span style={{ fontSize: '12px' }}>CGPA: {education.cgpa}</span>
                      </div>
                    </div>
                  </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                  <section>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #e9ecef', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#212529' }}>Experience</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {experience.map(exp => (
                        <div key={exp.id}>
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong style={{ fontSize: '14px' }}>{exp.company}</strong>
                              <span style={{ fontSize: '12px' }}>{exp.duration}</span>
                            </div>
                            <div style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '4px' }}>{exp.role}</div>
                            <p style={{ fontSize: '12px', marginTop: '4px', whiteSpace: 'pre-line' }}>{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                  <section>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #e9ecef', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#212529' }}>Projects</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {projects.map(proj => (
                        <div key={proj.id}>
                          <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <strong style={{ fontSize: '14px' }}>
                                {proj.title}
                                {proj.link && <a href={proj.link} style={{ fontSize: '11px', color: '#666', marginLeft: '8px', fontWeight: 'normal', textDecoration: 'none' }}>(Link)</a>}
                              </strong>
                              <span style={{ fontSize: '11px', color: '#666' }}>{proj.techStack}</span>
                            </div>
                            <p style={{ fontSize: '12px', marginTop: '4px', whiteSpace: 'pre-line' }}>{proj.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                  <section>
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '13px' }}>Skills</strong>
                      <p style={{ fontSize: '12px', marginTop: '4px' }}>
                        {skills.join(" • ")}
                      </p>
                    </div>
                  </section>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <section>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #e9ecef', paddingBottom: '4px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#212529' }}>Certifications</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {certifications.map(cert => (
                        <div key={cert.id} style={{ marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ fontSize: '13px' }}>{cert.name}</strong>
                            <span style={{ fontSize: '12px' }}>{cert.year}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {cert.issuer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen pt-24 px-4 pb-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-brand-400 hover:text-brand-300 text-sm font-medium mb-6 inline-flex items-center gap-1">
          ← Back to Dashboard
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Resume Builder</h1>
          <p className="text-surface-300">Create a professional resume in minutes.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-500"
              style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs font-medium text-white/40">
            <span>Personal</span>
            <span>Education</span>
            <span>Projects</span>
            <span>Skills</span>
            <span>Experience</span>
            <span>Certifications</span>
          </div>
        </div>

        <div className="glass-card p-8">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="animate-fade-in space-y-5">
              <h2 className="text-xl font-bold text-white mb-4">Personal Information</h2>
              <div>
                <InputLabel>Full Name</InputLabel>
                <InputField value={personalInfo.name} onChange={(e: any) => setPersonalInfo({ ...personalInfo, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <InputLabel>Email Address</InputLabel>
                  <InputField type="email" value={personalInfo.email} onChange={(e: any) => setPersonalInfo({ ...personalInfo, email: e.target.value })} placeholder="john@example.com" />
                </div>
                <div>
                  <InputLabel>Phone Number</InputLabel>
                  <InputField type="tel" value={personalInfo.phone} onChange={(e: any) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <InputLabel>LinkedIn URL</InputLabel>
                  <InputField value={personalInfo.linkedin} onChange={(e: any) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })} placeholder="linkedin.com/in/johndoe" />
                </div>
                <div>
                  <InputLabel>GitHub URL</InputLabel>
                  <InputField value={personalInfo.github} onChange={(e: any) => setPersonalInfo({ ...personalInfo, github: e.target.value })} placeholder="github.com/johndoe" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Education */}
          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <h2 className="text-xl font-bold text-white mb-4">Education</h2>
              <div>
                <InputLabel>College / University</InputLabel>
                <InputField value={education.college} onChange={(e: any) => setEducation({ ...education, college: e.target.value })} placeholder="Harvard University" />
              </div>
              <div>
                <InputLabel>Degree</InputLabel>
                <InputField value={education.degree} onChange={(e: any) => setEducation({ ...education, degree: e.target.value })} placeholder="B.S. in Computer Science" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <InputLabel>CGPA / Grade</InputLabel>
                  <InputField value={education.cgpa} onChange={(e: any) => setEducation({ ...education, cgpa: e.target.value })} placeholder="3.8/4.0" />
                </div>
                <div>
                  <InputLabel>Graduation Year</InputLabel>
                  <InputField value={education.gradYear} onChange={(e: any) => setEducation({ ...education, gradYear: e.target.value })} placeholder="2024" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Projects */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Projects</h2>
                <button onClick={addProject} className="btn-ghost py-1.5 px-4 text-xs font-semibold">+ Add Project</button>
              </div>

              {projects.length === 0 && (
                <p className="text-white/40 text-center py-6 italic text-sm">No projects added yet.</p>
              )}

              {projects.map((proj, i) => (
                <div key={proj.id} className="relative p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                  <button onClick={() => removeProject(proj.id)} className="absolute top-4 right-4 text-white/40 hover:text-red-400 p-1">
                    ✕
                  </button>
                  <h3 className="text-sm font-bold text-brand-300">Project #{i + 1}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <InputLabel>Project Title</InputLabel>
                      <InputField value={proj.title} onChange={(e: any) => updateProject(proj.id, "title", e.target.value)} placeholder="E-commerce App" />
                    </div>
                    <div>
                      <InputLabel>Tech Stack</InputLabel>
                      <InputField value={proj.techStack} onChange={(e: any) => updateProject(proj.id, "techStack", e.target.value)} placeholder="React, Node.js, MongoDB" />
                    </div>
                  </div>
                  <div>
                    <InputLabel>Project Link</InputLabel>
                    <InputField value={proj.link} onChange={(e: any) => updateProject(proj.id, "link", e.target.value)} placeholder="https://..." />
                  </div>
                  <div>
                    <InputLabel>Description (bullet points)</InputLabel>
                    <TextAreaField value={proj.description} onChange={(e: any) => updateProject(proj.id, "description", e.target.value)} placeholder="• Built a full-stack e-commerce app...&#10;• Increased load speed by 20%..." />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Skills */}
          {step === 4 && (
            <div className="animate-fade-in space-y-5">
              <h2 className="text-xl font-bold text-white mb-4">Core Skills</h2>
              <div>
                <InputLabel>Add a Skill</InputLabel>
                <InputField
                  value={skillInput}
                  onChange={(e: any) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. Python, React, AWS (Press Enter)"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm font-medium">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors">✕</button>
                  </div>
                ))}
                {skills.length === 0 && <span className="text-white/40 text-sm italic">No skills added yet.</span>}
              </div>
            </div>
          )}

          {/* Step 5: Experience */}
          {step === 5 && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Experience</h2>
                <button onClick={addExperience} className="btn-ghost py-1.5 px-4 text-xs font-semibold">+ Add Experience</button>
              </div>

              {experience.length === 0 && (
                <p className="text-white/40 text-center py-6 italic text-sm">No experience added yet.</p>
              )}

              {experience.map((exp, i) => (
                <div key={exp.id} className="relative p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-white/40 hover:text-red-400 p-1">
                    ✕
                  </button>
                  <h3 className="text-sm font-bold text-brand-300">Experience #{i + 1}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <InputLabel>Company</InputLabel>
                      <InputField value={exp.company} onChange={(e: any) => updateExperience(exp.id, "company", e.target.value)} placeholder="Tech Corp" />
                    </div>
                    <div>
                      <InputLabel>Role / Title</InputLabel>
                      <InputField value={exp.role} onChange={(e: any) => updateExperience(exp.id, "role", e.target.value)} placeholder="Software Engineer Intern" />
                    </div>
                  </div>
                  <div>
                    <InputLabel>Duration</InputLabel>
                    <InputField value={exp.duration} onChange={(e: any) => updateExperience(exp.id, "duration", e.target.value)} placeholder="June 2023 - Aug 2023" />
                  </div>
                  <div>
                    <InputLabel>Description (bullet points)</InputLabel>
                    <TextAreaField value={exp.description} onChange={(e: any) => updateExperience(exp.id, "description", e.target.value)} placeholder="• Developed scalable REST APIs...&#10;• Collaborated with UX team..." />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 6: Certifications */}
          {step === 6 && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Certifications</h2>
                <button onClick={addCertification} className="btn-ghost py-1.5 px-4 text-xs font-semibold">+ Add Certification</button>
              </div>

              {certifications.length === 0 && (
                <p className="text-white/40 text-center py-6 italic text-sm">No certifications added yet.</p>
              )}

              {certifications.map((cert, i) => (
                <div key={cert.id} className="relative p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
                  <button onClick={() => removeCertification(cert.id)} className="absolute top-4 right-4 text-white/40 hover:text-red-400 p-1">
                    ✕
                  </button>
                  <h3 className="text-sm font-bold text-brand-300">Certification #{i + 1}</h3>
                  <div>
                    <InputLabel>Certification Name</InputLabel>
                    <InputField value={cert.name} onChange={(e: any) => updateCertification(cert.id, "name", e.target.value)} placeholder="AWS Certified Solutions Architect" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <InputLabel>Issuer</InputLabel>
                      <InputField value={cert.issuer} onChange={(e: any) => updateCertification(cert.id, "issuer", e.target.value)} placeholder="Amazon Web Services" />
                    </div>
                    <div>
                      <InputLabel>Year</InputLabel>
                      <InputField value={cert.year} onChange={(e: any) => updateCertification(cert.id, "year", e.target.value)} placeholder="2023" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-10 border-t border-white/10 pt-6">
            <button
              onClick={prevStep}
              className={`btn-ghost ${step === 1 ? "invisible" : ""}`}
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="btn-primary"
            >
              {step === totalSteps ? "Generate Resume" : "Next Step"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

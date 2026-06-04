'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Plus, Trash2 } from 'lucide-react'

interface Row {
  id: string
  title: string
  stage: string
  stadium: string
  when: string
  seats: number
  from: string
}

interface FormValues {
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  stage: string
  stadium: string
  city: string
  date: string
}

export default function AdminMatches({ matches }: { matches: Row[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { stage: 'Group Stage', homeFlag: '🏳️', awayFlag: '🏳️' },
  })

  async function onCreate(values: FormValues) {
    setBusy(true)
    const res = await fetch('/api/admin/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setBusy(false)
    if (res.ok) {
      toast.success('Match created with seating')
      reset()
      setShowForm(false)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Could not create match')
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this match and all its seats/orders references?')) return
    const res = await fetch(`/api/admin/matches/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Match deleted')
      router.refresh()
    } else {
      toast.error('Could not delete')
    }
  }

  return (
    <div className="mt-8">
      <Button onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'primary'}>
        <Plus className="h-4 w-4" /> {showForm ? 'Close form' : 'Add match'}
      </Button>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} className="mt-5 rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Home team" error={errors.homeTeam && 'Required'}><input className="field" {...register('homeTeam', { required: true })} /></Field>
            <Field label="Away team" error={errors.awayTeam && 'Required'}><input className="field" {...register('awayTeam', { required: true })} /></Field>
            <Field label="Home flag (emoji)"><input className="field" {...register('homeFlag')} /></Field>
            <Field label="Away flag (emoji)"><input className="field" {...register('awayFlag')} /></Field>
            <Field label="Stage"><input className="field" {...register('stage')} /></Field>
            <Field label="Stadium" error={errors.stadium && 'Required'}><input className="field" {...register('stadium', { required: true })} /></Field>
            <Field label="City"><input className="field" {...register('city')} /></Field>
            <Field label="Date & time" error={errors.date && 'Required'}><input type="datetime-local" className="field" {...register('date', { required: true })} /></Field>
          </div>
          <Button type="submit" className="mt-5" disabled={busy}>{busy ? 'Creating…' : 'Create match'}</Button>
        </form>
      )}

      <div className="mt-8 space-y-3">
        {matches.map((m) => (
          <div key={m.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-white/80 p-5 shadow-card">
            <div>
              <p className="font-display text-lg font-bold">{m.title}</p>
              <p className="mt-0.5 text-sm text-ink-500">{m.stage} · {m.stadium} · {m.when}</p>
              <p className="mt-1 text-xs text-ink-400">{m.seats} seats · from {m.from}</p>
            </div>
            <Button variant="ghost" className="text-rose-600" onClick={() => remove(m.id)}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string | false; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
    </div>
  )
}

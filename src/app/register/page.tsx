'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Ticket } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'

interface FormValues {
  name: string
  email: string
  phone: string
  country: string
  nationality: string
  password: string
  confirm: string
}

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(values: FormValues) {
    if (values.password !== values.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        phone: values.phone,
        country: values.country,
        nationality: values.nationality,
        password: values.password,
      }),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Welcome aboard! You are signed in.')
      router.push('/matches')
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Could not create account')
    }
  }

  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-lg animate-fade-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-lime">
            <Ticket className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold">Create your account</h1>
          <p className="mt-1 text-ink-500">Join to reserve seats in seconds.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-ink/10 bg-white/80 p-7 shadow-card">
          <div className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input className="field" autoComplete="name" {...register('name', { required: true })} />
              {errors.name && <p className="mt-1 text-sm text-rose-600">Name is required</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Email</label>
                <input type="email" className="field" autoComplete="email" {...register('email', { required: true })} />
                {errors.email && <p className="mt-1 text-sm text-rose-600">Email is required</p>}
              </div>
              <div>
                <label className="label">Phone (WhatsApp)</label>
                <input
                  type="tel"
                  className="field"
                  placeholder="+1 573 691 3098"
                  autoComplete="tel"
                  {...register('phone', { required: true, pattern: /^[+0-9()\-\s]{7,20}$/ })}
                />
                {errors.phone && <p className="mt-1 text-sm text-rose-600">Enter a valid phone number</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Country of residence</label>
                <select className="field" defaultValue="" {...register('country', { required: true })}>
                  <option value="" disabled>Select country</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.country && <p className="mt-1 text-sm text-rose-600">Required</p>}
              </div>
              <div>
                <label className="label">Nationality</label>
                <select className="field" defaultValue="" {...register('nationality', { required: true })}>
                  <option value="" disabled>Select nationality</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.nationality && <p className="mt-1 text-sm text-rose-600">Required</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Password</label>
                <input type="password" className="field" autoComplete="new-password" {...register('password', { required: true, minLength: 8 })} />
                {errors.password && <p className="mt-1 text-sm text-rose-600">At least 8 characters</p>}
              </div>
              <div>
                <label className="label">Confirm password</label>
                <input type="password" className="field" autoComplete="new-password" {...register('confirm', { required: true })} />
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-pitch hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
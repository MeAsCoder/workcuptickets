'use client'

import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Ticket } from 'lucide-react'

interface FormValues {
  email: string
  password: string
}

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>()
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/matches'
  const [loading, setLoading] = useState(false)

  async function onSubmit(values: FormValues) {
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setLoading(false)
    if (res.ok) {
      toast.success('Signed in')
      router.push(redirect)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error || 'Invalid credentials')
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-lime">
          <Ticket className="h-6 w-6" />
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-ink-500">Sign in to manage your seats and orders.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-ink/10 bg-white/80 p-7 shadow-card">
        <div className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="field" {...register('email', { required: true })} />
            {errors.email && <p className="mt-1 text-sm text-rose-600">Email is required</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="field" {...register('password', { required: true })} />
            {errors.password && <p className="mt-1 text-sm text-rose-600">Password is required</p>}
          </div>
        </div>
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
       
      </form>
      <p className="mt-5 text-center text-sm text-ink-500">
        New here?{' '}
        <Link href="/register" className="font-semibold text-pitch hover:underline">Create an account</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Suspense fallback={<div className="text-ink-500">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}

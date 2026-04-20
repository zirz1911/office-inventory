'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import type { Computer, ComputerInsert, ComputerStatus } from '@/lib/types'

interface ComputerFormProps {
  mode: 'add' | 'edit'
  initialData?: Computer
}

const emptyForm: ComputerInsert = {
  computer_name: '',
  brand: '',
  model: '',
  cpu: '',
  gpu: null,
  ram_gb: 8,
  storage: '',
  os: '',
  department: '',
  assigned_to: '',
  status: 'Active',
  notes: null,
}

const STATUS_OPTIONS: ComputerStatus[] = ['Active', 'Maintenance', 'Retired']

const BRAND_OPTIONS = [
  'Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer', 'Microsoft', 'Samsung', 'Other',
]

const OS_OPTIONS = [
  'Windows 11 Pro',
  'Windows 11 Home',
  'Windows 10 Pro',
  'Windows 10 Home',
  'Ubuntu 22.04 LTS',
  'Ubuntu 20.04 LTS',
  'macOS Sonoma',
  'macOS Ventura',
  'macOS Monterey',
  'Other',
]

export default function ComputerForm({ mode, initialData }: ComputerFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<ComputerInsert>(
    initialData
      ? {
          computer_name: initialData.computer_name,
          brand: initialData.brand,
          model: initialData.model,
          cpu: initialData.cpu,
          gpu: initialData.gpu,
          ram_gb: initialData.ram_gb,
          storage: initialData.storage,
          os: initialData.os,
          department: initialData.department,
          assigned_to: initialData.assigned_to,
          status: initialData.status,
          notes: initialData.notes,
        }
      : emptyForm
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ComputerInsert, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ComputerInsert, string>> = {}
    const required: (keyof ComputerInsert)[] = [
      'computer_name', 'brand', 'model', 'cpu',
      'storage', 'os', 'department', 'assigned_to',
    ]
    for (const field of required) {
      const value = form[field]
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = 'This field is required'
      }
    }
    if (!form.ram_gb || form.ram_gb <= 0) {
      newErrors.ram_gb = 'RAM must be a positive number'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'ram_gb' ? parseInt(value) || 0 : value,
    }))
    // Clear error on change
    if (errors[name as keyof ComputerInsert]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    setServerError(null)

    try {
      const payload = {
        ...form,
        gpu: form.gpu?.trim() || null,
        notes: form.notes?.trim() || null,
      }

      if (mode === 'add') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (getSupabase().from('computers') as any).insert([payload])
        if (error) throw error
      } else if (mode === 'edit' && initialData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (getSupabase().from('computers') as any)
          .update(payload)
          .eq('id', initialData.id)
        if (error) throw error
      }

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">Error saving computer</p>
          <p className="text-sm text-red-600 mt-0.5">{serverError}</p>
        </div>
      )}

      {/* Computer Name */}
      <section className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Computer Name
        </h2>
        <div>
          <label htmlFor="computer_name" className="form-label">
            Computer Name <span className="text-red-500">*</span>
          </label>
          <input
            id="computer_name"
            name="computer_name"
            type="text"
            className={`form-input ${errors.computer_name ? 'border-red-400 focus:ring-red-400' : ''}`}
            placeholder="DESKTOP-FINANCE01"
            value={form.computer_name}
            onChange={handleChange}
          />
          {errors.computer_name && (
            <p className="mt-1 text-xs text-red-600">{errors.computer_name}</p>
          )}
        </div>
      </section>

      {/* Hardware */}
      <section className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Hardware Specs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="form-label">
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              id="brand"
              name="brand"
              className={`form-input ${errors.brand ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.brand}
              onChange={handleChange}
            >
              <option value="">Select brand...</option>
              {BRAND_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {errors.brand && (
              <p className="mt-1 text-xs text-red-600">{errors.brand}</p>
            )}
          </div>
          <div>
            <label htmlFor="model" className="form-label">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              id="model"
              name="model"
              type="text"
              className={`form-input ${errors.model ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="OptiPlex 7090"
              value={form.model}
              onChange={handleChange}
            />
            {errors.model && (
              <p className="mt-1 text-xs text-red-600">{errors.model}</p>
            )}
          </div>
          <div>
            <label htmlFor="cpu" className="form-label">
              CPU <span className="text-red-500">*</span>
            </label>
            <input
              id="cpu"
              name="cpu"
              type="text"
              className={`form-input ${errors.cpu ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Intel Core i7-11700"
              value={form.cpu}
              onChange={handleChange}
            />
            {errors.cpu && (
              <p className="mt-1 text-xs text-red-600">{errors.cpu}</p>
            )}
          </div>
          <div>
            <label htmlFor="ram_gb" className="form-label">
              RAM (GB) <span className="text-red-500">*</span>
            </label>
            <input
              id="ram_gb"
              name="ram_gb"
              type="number"
              min={1}
              className={`form-input ${errors.ram_gb ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="16"
              value={form.ram_gb}
              onChange={handleChange}
            />
            {errors.ram_gb && (
              <p className="mt-1 text-xs text-red-600">{errors.ram_gb}</p>
            )}
          </div>
          <div>
            <label htmlFor="storage" className="form-label">
              Storage <span className="text-red-500">*</span>
            </label>
            <input
              id="storage"
              name="storage"
              type="text"
              className={`form-input ${errors.storage ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="512GB SSD"
              value={form.storage}
              onChange={handleChange}
            />
            {errors.storage && (
              <p className="mt-1 text-xs text-red-600">{errors.storage}</p>
            )}
          </div>
          <div>
            <label htmlFor="gpu" className="form-label">
              GPU <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="gpu"
              name="gpu"
              type="text"
              className="form-input"
              placeholder="NVIDIA RTX 4060, Integrated..."
              value={form.gpu ?? ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="os" className="form-label">
              Operating System <span className="text-red-500">*</span>
            </label>
            <select
              id="os"
              name="os"
              className={`form-input ${errors.os ? 'border-red-400 focus:ring-red-400' : ''}`}
              value={form.os}
              onChange={handleChange}
            >
              <option value="">Select OS...</option>
              {OS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {errors.os && (
              <p className="mt-1 text-xs text-red-600">{errors.os}</p>
            )}
          </div>
        </div>
      </section>

      {/* Assignment */}
      <section className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Assignment & Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="department" className="form-label">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              id="department"
              name="department"
              type="text"
              className={`form-input ${errors.department ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Finance, HR, IT..."
              value={form.department}
              onChange={handleChange}
            />
            {errors.department && (
              <p className="mt-1 text-xs text-red-600">{errors.department}</p>
            )}
          </div>
          <div>
            <label htmlFor="assigned_to" className="form-label">
              Assigned To <span className="text-red-500">*</span>
            </label>
            <input
              id="assigned_to"
              name="assigned_to"
              type="text"
              className={`form-input ${errors.assigned_to ? 'border-red-400 focus:ring-red-400' : ''}`}
              placeholder="Employee name or Unassigned"
              value={form.assigned_to}
              onChange={handleChange}
            />
            {errors.assigned_to && (
              <p className="mt-1 text-xs text-red-600">{errors.assigned_to}</p>
            )}
          </div>
          <div>
            <label htmlFor="status" className="form-label">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="card p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-100">
          Additional Notes
        </h2>
        <div>
          <label htmlFor="notes" className="form-label">
            Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="form-input resize-none"
            placeholder="Any additional details about this computer..."
            value={form.notes ?? ''}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 justify-end">
        <Link href="/" className="btn-secondary">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : mode === 'add' ? (
            'Add Computer'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}

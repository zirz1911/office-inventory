'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import type { Computer, ComputerStatus } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'

type SortField = 'asset_tag' | 'computer_name' | 'department' | 'status' | 'brand'
type SortDir = 'asc' | 'desc'

export default function InventoryPage() {
  const router = useRouter()
  const [computers, setComputers] = useState<Computer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComputerStatus | 'All'>('All')
  const [sortField, setSortField] = useState<SortField>('asset_tag')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchComputers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await getSupabase()
        .from('computers')
        .select('*')
        .order('asset_tag', { ascending: true })

      if (error) throw error
      setComputers(data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load computers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchComputers()
  }, [fetchComputers])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const handleDelete = async (computer: Computer) => {
    const confirmed = window.confirm(
      `Delete computer "${computer.asset_tag} — ${computer.computer_name}"?\n\nThis action cannot be undone.`
    )
    if (!confirmed) return

    setDeletingId(computer.id)
    try {
      const { error } = await getSupabase().from('computers').delete().eq('id', computer.id)
      if (error) throw error
      setComputers((prev) => prev.filter((c) => c.id !== computer.id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete computer')
    } finally {
      setDeletingId(null)
    }
  }

  // Derived data
  const filtered = computers
    .filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        c.asset_tag.toLowerCase().includes(q) ||
        c.computer_name.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.brand.toLowerCase().includes(q) ||
        c.assigned_to.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || c.status === statusFilter
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const av = a[sortField] ?? ''
      const bv = b[sortField] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  const counts = {
    total: computers.length,
    active: computers.filter((c) => c.status === 'Active').length,
    maintenance: computers.filter((c) => c.status === 'Maintenance').length,
    retired: computers.filter((c) => c.status === 'Retired').length,
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <span className="ml-1 text-gray-300">&#8597;</span>
    return (
      <span className="ml-1 text-blue-600">
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Computer Inventory</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track and manage all office computer assets
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'border-blue-200 bg-blue-50', num: 'text-blue-700' },
          { label: 'Active', value: counts.active, color: 'border-green-200 bg-green-50', num: 'text-green-700' },
          { label: 'Maintenance', value: counts.maintenance, color: 'border-yellow-200 bg-yellow-50', num: 'text-yellow-700' },
          { label: 'Retired', value: counts.retired, color: 'border-red-200 bg-red-50', num: 'text-red-700' },
        ].map(({ label, value, color, num }) => (
          <div key={label} className={`card border ${color} p-4`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${num}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by asset tag, name, department, user..."
            className="form-input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {(['All', 'Active', 'Maintenance', 'Retired'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {error ? (
        <div className="card p-8 text-center">
          <p className="text-red-600 font-medium">Failed to load data</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button onClick={fetchComputers} className="btn-secondary mt-4">
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="card p-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500">
            <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading inventory...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">
            {computers.length === 0 ? 'No computers yet' : 'No results match your search'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {computers.length === 0
              ? 'Add your first computer to get started.'
              : 'Try adjusting your search or filter.'}
          </p>
          {computers.length === 0 && (
            <Link href="/add" className="btn-primary mt-4 inline-flex">
              Add First Computer
            </Link>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    { label: 'Asset Tag', field: 'asset_tag' as SortField },
                    { label: 'Computer Name', field: 'computer_name' as SortField },
                    { label: 'Brand / Model', field: 'brand' as SortField },
                    { label: 'Specs', field: null },
                    { label: 'Department', field: 'department' as SortField },
                    { label: 'Assigned To', field: null },
                    { label: 'Status', field: 'status' as SortField },
                    { label: 'Actions', field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                        field ? 'cursor-pointer hover:text-gray-700 select-none' : ''
                      }`}
                      onClick={() => field && handleSort(field)}
                    >
                      {label}
                      {field && <SortIcon field={field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((computer) => (
                  <tr
                    key={computer.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-blue-700 whitespace-nowrap">
                      {computer.asset_tag}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {computer.computer_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{computer.brand}</div>
                      <div className="text-gray-400 text-xs">{computer.model}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-gray-700">{computer.cpu}</div>
                      <div className="text-gray-400 text-xs">
                        {computer.ram_gb}GB RAM · {computer.storage}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {computer.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {computer.assigned_to}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={computer.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/edit/${computer.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(computer)}
                          disabled={deletingId === computer.id}
                          className="btn-danger text-xs disabled:opacity-50"
                        >
                          {deletingId === computer.id ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
            Showing {filtered.length} of {computers.length} computers
          </div>
        </div>
      )}
    </div>
  )
}

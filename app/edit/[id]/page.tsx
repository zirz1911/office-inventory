export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ComputerForm from '@/components/ComputerForm'
import type { Computer } from '@/lib/types'

interface EditPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: EditPageProps) {
  return {
    title: `Edit Computer — Office Inventory`,
  }
}

async function getComputer(id: string): Promise<Computer | null> {
  const { data, error } = await supabase
    .from('computers')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Computer
}

export default async function EditComputerPage({ params }: EditPageProps) {
  const computer = await getComputer(params.id)

  if (!computer) {
    notFound()
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900 transition-colors">
          Inventory
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          Edit {computer.asset_tag}
        </span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Computer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update details for{' '}
          <span className="font-mono font-medium text-blue-700">{computer.asset_tag}</span>
          {' '}— {computer.computer_name}
        </p>
      </div>

      <ComputerForm mode="edit" initialData={computer} />
    </div>
  )
}

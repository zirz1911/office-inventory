import Link from 'next/link'
import ComputerForm from '@/components/ComputerForm'

export const metadata = {
  title: 'Add Computer — Office Inventory',
}

export default function AddComputerPage() {
  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900 transition-colors">
          Inventory
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Add Computer</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Computer</h1>
        <p className="text-gray-500 text-sm mt-1">
          Register a new computer asset in the inventory
        </p>
      </div>

      <ComputerForm mode="add" />
    </div>
  )
}

export type ComputerStatus = 'Active' | 'Maintenance' | 'Retired'

export interface Computer {
  id: string
  computer_name: string
  brand: string
  model: string
  cpu: string
  gpu: string | null
  ram_gb: number
  storage: string
  os: string
  department: string
  assigned_to: string
  status: ComputerStatus
  notes: string | null
  created_at: string
}

export type ComputerInsert = Omit<Computer, 'id' | 'created_at'>
export type ComputerUpdate = Partial<ComputerInsert>

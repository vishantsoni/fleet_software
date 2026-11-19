'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { deleteRoleAction, listRolesAction, saveRoleAction } from '@/server/actions/staff'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

const modules = [
  ['dashboard', 'Dashboard'],
  ['vehicles', 'Vehicles'],
  ['drivers', 'Drivers'],
  ['trips', 'Trips'],
  ['expenses', 'Expenses'],
  ['bank_accounts', 'Bank Accounts'],
  ['fuel', 'Fuel'],
  ['maintenance', 'Maintenance'],
  ['tyres', 'Tyres'],
  ['batteries', 'Batteries'],
  ['compliance', 'Compliance'],
  ['analytics', 'Analytics'],
  ['staff', 'Staff'],
  ['roles', 'Roles'],
] as const

export default function RolesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [roles, setRoles] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [permissions, setPermissions] = useState<string[]>([])

  async function load() {
    const result = await listRolesAction()
    if (result.success && 'roles' in result) setRoles(result.roles ?? [])
  }

  useEffect(() => { load() }, [])

  function edit(role?: any) {
    setEditing(role || null)
    setName(role?.name || '')
    setDescription(role?.description || '')
    setPermissions(role ? (Array.isArray(role.permissions) ? role.permissions : []) : [])
  }

  async function save() {
    const result = await saveRoleAction({
      id: editing?.id,
      name,
      description,
      permissions,
    })
    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: 'Role saved' })
    edit(null)
    await load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this role?')) return
    const result = await deleteRoleAction(id)
    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    await load()
  }

  if (session?.user?.role !== 'ADMIN') {
    return <div className="text-red-600">Admin access required</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
        <p className="text-muted-foreground">Create roles and manually assign module permissions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit Role' : 'New Role'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Role name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fleet Manager" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Role description" />
            </div>
            <div className="space-y-2">
              <Label>Module permissions</Label>
              <div className="grid grid-cols-1 gap-2 rounded-md border p-3">
                {modules.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={permissions.includes(key) || permissions.includes('*')}
                      disabled={permissions.includes('*')}
                      onChange={(e) => setPermissions((current) =>
                        e.target.checked ? [...current, key] : current.filter((item) => item !== key)
                      )}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={save}>Save Role</Button>
              {editing && <Button variant="outline" onClick={() => edit()}>Cancel</Button>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Configured Roles</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{role.name}</span>
                    {role.isSystem && <Badge variant="secondary">System</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description || 'No description'}</p>
                  <p className="mt-1 text-xs">
                    {Array.isArray(role.permissions) && role.permissions.includes('*')
                      ? 'All permissions'
                      : `${Array.isArray(role.permissions) ? role.permissions.length : 0} modules`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => edit(role)}>Edit</Button>
                  {!role.isSystem && <Button variant="destructive" size="sm" onClick={() => remove(role.id)}>Delete</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

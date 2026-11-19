'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { listRolesAction, listStaffAction, saveStaffAction, setStaffActiveAction } from '@/server/actions/staff'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

type UserRole = 'ADMIN' | 'MANAGER' | 'DRIVER' | 'ACCOUNTANT' | 'OPERATIONS'

export default function StaffPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [staff, setStaff] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [editing, setEditing] = useState<any | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('OPERATIONS')
  const [roleId, setRoleId] = useState('')
  const [isActive, setIsActive] = useState(true)

  async function load() {
    const [staffResult, rolesResult] = await Promise.all([listStaffAction(), listRolesAction()])
    if (staffResult.success && 'users' in staffResult) setStaff(staffResult.users ?? [])
    if (rolesResult.success && 'roles' in rolesResult) setRoles(rolesResult.roles ?? [])
  }

  useEffect(() => { load() }, [])

  function edit(user?: any) {
    setEditing(user || null)
    setName(user?.name || '')
    setEmail(user?.email || '')
    setPassword('')
    setRole(user?.role || 'OPERATIONS')
    setRoleId(user?.roleId || '')
    setIsActive(user?.isActive ?? true)
  }

  async function save() {
    const result = await saveStaffAction({
      id: editing?.id,
      name,
      email,
      password: password || undefined,
      role,
      roleId: roleId || undefined,
      isActive,
    })
    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: editing ? 'Staff updated' : 'Staff created' })
    edit()
    await load()
  }

  async function toggleActive(user: any) {
    const result = await setStaffActiveAction(user.id, !user.isActive)
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
        <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
        <p className="text-muted-foreground">Create staff accounts and assign roles</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>{editing ? 'Edit Staff' : 'New Staff'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>{editing ? 'New password (optional)' : 'Password'}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Base role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['ADMIN', 'MANAGER', 'DRIVER', 'ACCOUNTANT', 'OPERATIONS'] as UserRole[]).map((value) =>
                    <SelectItem key={value} value={value}>{value}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Custom role</Label>
              <Select value={roleId || 'none'} onValueChange={(value) => setRoleId(value === 'none' ? '' : value)}>
                <SelectTrigger><SelectValue placeholder="No custom role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No custom role</SelectItem>
                  {roles.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Account active
            </label>
            <div className="flex gap-2">
              <Button onClick={save}>Save Staff</Button>
              {editing && <Button variant="outline" onClick={() => edit()}>Cancel</Button>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Staff Members</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {staff.map((user) => (
              <div key={user.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                <div>
                  <div className="font-medium">{user.name || user.email}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="secondary">{user.assignedRole?.name || user.role}</Badge>
                    <Badge variant={user.isActive ? 'success' : 'outline'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => edit(user)}>Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(user)}>
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

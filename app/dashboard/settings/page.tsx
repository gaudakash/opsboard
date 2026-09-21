import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">Settings & Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your admin account details and store preferences.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Profile Information</CardTitle>
          <CardDescription>Update your personal account credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            defaultValue={profile?.full_name || ''}
            <Input defaultValue={profile?.full_name || ''} readOnly className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input defaultValue={user?.email || ''} readOnly className="bg-slate-50" />
          </div>
          <div className="space-y-2">
            <Label>Assigned Role</Label>
            <Input defaultValue={profile?.role?.toUpperCase() || 'STAFF'} readOnly className="bg-slate-50 uppercase font-semibold text-primary" />
          </div>
          <p className="text-xs text-slate-400 pt-2">Note: Role permissions are managed securely at the database level.</p>
        </CardContent>
      </Card>
    </div>
  )
}
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">OpsBoard</CardTitle>
          <CardDescription>E-commerce Operations & Admin Dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Internal tool for store staff and administrators to manage inventory, process orders, and track store analytics.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="/login" className="flex-1">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/signup" className="flex-1">
              <Button variant="outline" className="w-full">Sign Up</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
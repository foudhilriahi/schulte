'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Mocked for the frontend for now, in a real implementation we would hit a PATCH /api/users/:id endpoint
      await new Promise(r => setTimeout(r, 1000))
      toast.success('Settings updated successfully!')
      setPassword('')
    } catch (e) {
      toast.error('Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-3 flex items-center">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-muted-foreground min-h-[44px] touch-manipulation -ml-1"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="ml-4 font-semibold text-foreground">Account Settings</h1>
        </div>
      </header>
      
      <main className="flex-1 px-4 py-8 max-w-md mx-auto w-full">
        <div className="space-y-6">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-4">Personal Details</h2>
            
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="nom@exemple.com"
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>New Password</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Leave blank to keep current"
                className="bg-slate-50"
              />
              <p className="text-[10px] text-muted-foreground mt-1">Min 8 characters, 1 digit.</p>
            </div>
            
            <Button 
              className="w-full mt-4 gap-2" 
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
            </Button>
          </div>
          
          <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Danger Zone</h3>
              <p className="text-xs text-red-600 mt-1">Delete your account and all associated applications permanently.</p>
              <Button variant="outline" className="mt-3 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 h-9" onClick={() => toast.error('Action blocked during demo mode.')}>
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

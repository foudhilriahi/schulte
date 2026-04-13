'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-6 w-40 mt-3" />
        <Skeleton className="h-4 w-32 mt-2" />
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfileScreen() {
  const { user, isLoading, isAuthenticated, logout, fetchUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully')
    router.push('/login')
  }

  const cityColor = user?.city === 'Bouarada'
    ? 'bg-bou/10 border-bou/25 text-bou'
    : 'bg-zag/10 border-zag/25 text-zag'

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 safe-area-pt">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Profile</h1>
          <Image
            src="/logo.png"
            alt="Schulte & Co"
            width={100}
            height={30}
            className="h-6 w-auto"
          />
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {isLoading ? (
          <ProfileSkeleton />
        ) : !isAuthenticated || !user ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">You are not logged in.</p>
            <Button onClick={() => router.push('/login')}>
              Log In
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center space-y-2">
              <div className="h-20 w-20 rounded-full bg-s3 border border-input flex items-center justify-center text-foreground text-2xl font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {user.name}
              </h2>
              {user.city && (
                <Badge className={`${cityColor} mt-1`}>
                  {user.city}
                </Badge>
              )}
            </div>

            {/* Contact Info */}
            <Card className="mt-6">
              <CardContent className="p-0 divide-y divide-border">
                <div className="flex items-center gap-4 p-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm text-foreground truncate">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Phone</p>
                      <p className="text-sm text-foreground">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.city && (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <p className="text-sm text-foreground">{user.city}, Tunisia</p>
                    </div>
                  </div>
                )}
                {user.experience && (
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">Experience</p>
                      <p className="text-sm text-foreground">{user.experience}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-foreground mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Menu Items */}
            <Card className="mt-6">
              <CardContent className="p-0 divide-y divide-border">
                <button 
                  className="flex items-center gap-4 p-4 w-full text-left min-h-[56px] touch-manipulation hover:bg-muted/50 transition-colors"
                  onClick={() => router.push('/profile/cv')}
                >
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm text-foreground">My CV</span>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
                <button 
                  className="flex items-center gap-4 p-4 w-full text-left min-h-[56px] touch-manipulation hover:bg-muted/50 transition-colors"
                  onClick={() => router.push('/profile/settings')}
                >
                  <div className="flex-shrink-0">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="flex-1 text-sm text-foreground">Settings</span>
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Logout */}
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full min-h-[48px] border-err/30 text-err hover:bg-err/10 hover:text-err touch-manipulation"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log Out</span>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { isOfficerAuthenticated, getOfficerSession } from '@/lib/adminAuth'
import { ShieldAlert, Lock, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isOfficerAuthenticated())
  const location = useLocation()

  useEffect(() => {
    setIsAuthenticated(isOfficerAuthenticated())
  }, [location])

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200 dark:border-red-800">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="inline-block px-3 py-1 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-full text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider mb-2">
            Restricted RTO Official Zone
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Officer Authentication Required
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            The Scrutiny & Approval Desk is strictly restricted to designated Transport Department Officers under the Motor Vehicles Act 1988. Normal applicants and citizens cannot access this portal to self-verify or approve licence applications.
          </p>

          <div className="space-y-3">
            <Link to={`/admin/login?redirect=${encodeURIComponent(location.pathname)}`} className="block">
              <Button className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Sign in as RTO Officer <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/" className="block">
              <Button variant="outline" className="w-full h-11 rounded-xl flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300">
                <Home className="w-4 h-4" /> Return to Citizen Homepage
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
            Unauthorized access attempts are monitored under the IT Act 2000.
          </div>
        </div>
      </div>
    )
  }

  return children
}

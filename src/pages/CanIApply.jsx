'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button' // shadcn button
import { useStickyState } from '@/hooks/useStickyState'

export default function CanIApply() {
  const [age, setAge] = useStickyState('', 'user-age')
  const [vehicle, setVehicle] = useStickyState('', 'user-vehicle')
  const [step, setStep] = useState(1)

  const checkEligibility = () => {
    const numAge = Number(age)
    if (numAge >= 18 && vehicle === 'motorcycle-gear') return true
    if (numAge >= 16 && vehicle === 'gearless-50cc') return true
    return false
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 bg-white">
      <Link href="/" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
      </Link>

      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1"
      >
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">How old are you?</h1>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-blue-600 focus:outline-none"
              placeholder="Enter your age"
            />
            <Button 
              onClick={() => setStep(2)}
              disabled={!age}
              className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              Next <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Which vehicle do you want to drive?</h1>
            <div className="space-y-3">
              <button 
                onClick={() => setVehicle('motorcycle-gear')}
                className={`w-full p-4 text-left border-2 rounded-xl transition-all ${vehicle === 'motorcycle-gear' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}
              >
                <div className="font-semibold text-slate-900">Motorcycle with gear</div>
                <div className="text-sm text-slate-500">Standard bikes & scooters</div>
              </button>
              <button 
                onClick={() => setVehicle('gearless-50cc')}
                className={`w-full p-4 text-left border-2 rounded-xl transition-all ${vehicle === 'gearless-50cc' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}
              >
                <div className="font-semibold text-slate-900">Gearless up to 50cc</div>
                <div className="text-sm text-slate-500">Electric scooters, mopeds</div>
              </button>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 w-16 rounded-xl">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => setStep(3)}
                disabled={!vehicle}
                className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 flex-1"
              >
                Check Eligibility
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 mt-10">
            {checkEligibility() ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 font-bold">✓</div>
                <h1 className="text-2xl font-bold text-slate-900">Yes, you can apply!</h1>
                <p className="text-slate-500">Based on your age, you are eligible for this licence.</p>
                <Link href="/documents">
                  <Button className="w-full h-12 text-lg rounded-xl bg-green-600 hover:bg-green-700 mt-6">
                    See required documents
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 font-bold">✗</div>
                <h1 className="text-2xl font-bold text-slate-900">Not just yet</h1>
                <p className="text-slate-500">You must be 18 to apply for a motorcycle with gears, or 16 for a gearless 50cc vehicle with parental consent.</p>
                <Button variant="outline" onClick={() => setStep(1)} className="w-full h-12 text-lg rounded-xl mt-6">
                  Start over
                </Button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

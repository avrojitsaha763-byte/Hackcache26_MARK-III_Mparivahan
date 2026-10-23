'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useStickyState } from '@/hooks/useStickyState'
import { supabase } from '@/lib/supabase'

export default function Apply() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useStickyState('', 'user-phone')
  const [name, setName] = useStickyState('', 'user-name')
  const [vehicle] = useStickyState('motorcycle-gear', 'user-vehicle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (supabase) {
        // Insert into Supabase citizens table
        const { data: citizen, error: citizenError } = await supabase
          .from('citizens')
          .insert([{ phone_number: phone, full_name: name }])
          .select()
          .single()

        if (!citizenError && citizen) {
          // Insert into applications table
          await supabase
            .from('applications')
            .insert([{ 
              citizen_id: citizen.id, 
              vehicle_class: vehicle,
              application_no: `APP${Math.floor(Math.random() * 1000000)}`
            }])
        }
      }
    } catch (err) {
      console.warn('Supabase submission fallback:', err)
    }
    setStep(3) // Success screen
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen flex flex-col p-6 pt-12 pb-24 bg-white">
      <Link href="/can-i-apply" className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-slate-800">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <div className="mb-6 h-2 bg-slate-100 rounded-full">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Personal Details</h1>
            <input 
              type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-blue-600 outline-none"
            />
            <input 
              type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl text-lg focus:border-blue-600 outline-none"
            />
            <Button onClick={() => setStep(2)} disabled={!name || !phone} className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700">
              Next Step <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Simulated Payment</h1>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between mb-2 text-slate-600"><span>Learner's Licence Fee</span><span>₹150</span></div>
              <div className="flex justify-between mb-2 text-slate-600"><span>Learner's Test Fee</span><span>₹50</span></div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-slate-200 mt-2 text-slate-900"><span>Total</span><span>₹200</span></div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 w-16 rounded-xl"><ChevronLeft className="w-5 h-5" /></Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-12 text-lg rounded-xl bg-green-600 hover:bg-green-700 flex-1">
                {isSubmitting ? 'Processing...' : 'Pay (Simulated)'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4 mt-10">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-4xl font-bold">✓</div>
            <h1 className="text-2xl font-bold text-slate-900">Application Submitted</h1>
            <p className="text-slate-500">Your details are saved. Next step: Learner's Test.</p>
            <Link href="/mock-test">
              <Button className="w-full h-12 text-lg rounded-xl mt-6 bg-blue-600 hover:bg-blue-700">Take Mock Test</Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}

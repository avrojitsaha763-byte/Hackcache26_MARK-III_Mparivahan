-- ==============================================================================
-- Licence Saathi (EasyDL) — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- ==============================================================================

-- 1. Applications Table (Citizen Form 2 & Tracking)
CREATE TABLE IF NOT EXISTS public.applications (
    application_number TEXT PRIMARY KEY,
    applicant_name TEXT NOT NULL,
    dob TEXT DEFAULT '2004-06-15',
    rto_code TEXT NOT NULL DEFAULT 'DL-01',
    vehicle_class TEXT NOT NULL DEFAULT 'MCWG, LMV',
    current_stage TEXT DEFAULT 'Document Scrutiny',
    stage_index INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Under Scrutiny',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Policies for public demo access (Anon / Publishable Key)
DROP POLICY IF EXISTS "Allow public read applications" ON public.applications;
CREATE POLICY "Allow public read applications" ON public.applications
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert applications" ON public.applications;
CREATE POLICY "Allow public insert applications" ON public.applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update applications" ON public.applications;
CREATE POLICY "Allow public update applications" ON public.applications
    FOR UPDATE USING (true);

-- 2. STALL Knowledge Test Questions Table (Optional - Falls back to questions.json if empty)
CREATE TABLE IF NOT EXISTS public.questions (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'General',
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_option INTEGER NOT NULL DEFAULT 0,
    explanation TEXT DEFAULT 'Statutory rule under Motor Vehicles Act 1988 & CMVR 1989.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read questions" ON public.questions;
CREATE POLICY "Allow public read questions" ON public.questions
    FOR SELECT USING (true);

-- 3. Seed Starter Test Application
INSERT INTO public.applications (application_number, applicant_name, dob, rto_code, vehicle_class, current_stage, stage_index, status)
VALUES 
    ('DL-2026-98124', 'Demo Applicant', '2004-05-14', 'DL-01', 'MCWG, LMV', 'Document Scrutiny', 2, 'Under Scrutiny'),
    ('MH-2026-11492', 'Test User', '2003-11-20', 'MH-02', 'LMV', 'Document Scrutiny', 1, 'Under Scrutiny'),
    ('KA-2026-55319', 'Sample Citizen', '2002-08-09', 'KA-01', 'MCWG', 'Learner Licence Issued', 3, 'Approved & LL Issued (Form 3)')
ON CONFLICT (application_number) DO NOTHING;

CREATE TABLE public.study_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id TEXT NOT NULL UNIQUE,
  subject_name TEXT NOT NULL,
  tip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.study_tips TO anon;
GRANT SELECT ON public.study_tips TO authenticated;
GRANT ALL ON public.study_tips TO service_role;
ALTER TABLE public.study_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read study tips" ON public.study_tips FOR SELECT TO anon, authenticated USING (true);
CREATE OR REPLACE FUNCTION public.update_study_tips_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER update_study_tips_updated_at BEFORE UPDATE ON public.study_tips FOR EACH ROW EXECUTE FUNCTION public.update_study_tips_updated_at();
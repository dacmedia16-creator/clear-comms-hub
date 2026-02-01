-- Add sms_sent column to syndic_referrals table
ALTER TABLE public.syndic_referrals 
ADD COLUMN sms_sent boolean DEFAULT false;
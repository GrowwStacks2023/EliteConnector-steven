-- supabase/migrations/create_lead_notification_trigger.sql

-- Step 1: Create a function to notify service providers about new leads
CREATE OR REPLACE FUNCTION notify_service_providers_of_new_lead()
RETURNS TRIGGER AS $$
DECLARE
  provider RECORD;
  function_url TEXT;
BEGIN
  -- Get the Supabase function URL from environment or hardcode it
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-lead-notification';
  
  -- Find all service providers who:
  -- 1. Match the job category
  -- 2. Are in the same area (or within operating radius)
  -- 3. Are active and verified
  FOR provider IN 
    SELECT 
      u.id,
      u.email,
      u.full_name,
      u.serviceType,
      u.zipcode
    FROM 
      "user" u
    WHERE 
      u.role = 'service_provider'
      AND u.is_active = true
      AND u.is_verified = true
      AND u.serviceType = NEW.category
      AND (
        u.zipcode = NEW.zipcode 
        OR u.postcode_areas && ARRAY[NEW.zipcode]  -- If they serve multiple postcodes
      )
  LOOP
    -- Call the edge function to send email
    -- This is done asynchronously via pg_net extension
    PERFORM
      net.http_post(
        url := function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'to', provider.email,
          'serviceProviderName', provider.full_name,
          'jobTitle', NEW.title,
          'jobCategory', NEW.category,
          'location', NEW.location,
          'zipcode', NEW.zipcode,
          'budget', COALESCE(NEW.budget, 0),
          'description', NEW.description,
          'jobId', NEW.id
        )
      );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger
DROP TRIGGER IF EXISTS trigger_notify_new_lead ON client_jobs;

CREATE TRIGGER trigger_notify_new_lead
  AFTER INSERT ON client_jobs
  FOR EACH ROW
  WHEN (NEW.is_active = true)  -- Only trigger for active jobs
  EXECUTE FUNCTION notify_service_providers_of_new_lead();

-- Step 3: Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

COMMENT ON TRIGGER trigger_notify_new_lead ON client_jobs IS 
  'Automatically notifies matching service providers when a new lead is posted';
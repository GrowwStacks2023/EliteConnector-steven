import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ✅ SECURITY: Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    console.warn('⚠️ Rate limit exceeded for IP:', ip);
    return false;
  }

  record.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔵 Edge Function Started')

    // ✅ SECURITY: Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log('📍 Client IP:', clientIP);

    // ✅ SECURITY: Rate limiting
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Rate limit exceeded. Please try again later.' 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get GHL credentials
    const GHL_API_URL = Deno.env.get('GHL_API_URL')!
    const GHL_BEARER_TOKEN = Deno.env.get('GHL_BEARER_TOKEN')!
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID')!
    const GHL_TRADES_FIELD_ID = Deno.env.get('GHL_TRADES_FIELD_ID')!
    const GHL_COVERAGE_FIELD_ID = Deno.env.get('GHL_COVERAGE_FIELD_ID')!
    const GHL_PIPELINE_ID = Deno.env.get('GHL_PIPELINE_ID')!
    const GHL_PIPELINE_STAGE_ID = Deno.env.get('GHL_PIPELINE_STAGE_ID')!

    // Parse request
    const { user } = await req.json()
    
    console.log('👤 Processing contact for:', user?.email);

    // ✅ SECURITY: Validate required fields
    if (!user || !user.fullName || !user.email) {
      console.error('❌ Missing required fields')
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required user data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ✅ SECURITY: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      console.error('❌ Invalid email format:', user.email)
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ✅ SECURITY: Validate phone format (if provided)
    if (user.phone && user.phone.length > 0 && user.phone.length < 10) {
      console.error('❌ Invalid phone format')
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid phone number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 📋 Prepare contact data for CREATE
    const createContactData = {
      name: user.fullName,
      email: user.email,
      locationId: GHL_LOCATION_ID,
      gender: user.gender?.toLowerCase() || undefined,
      phone: user.phone || '',
      address1: user.address || '',
      postalCode: user.zipcode || '',
      customFields: [
        {
          id: GHL_TRADES_FIELD_ID,
          value: Array.isArray(user.tradeTypes) ? user.tradeTypes.join(',') : ''
        },
        {
          id: GHL_COVERAGE_FIELD_ID,
          value: Array.isArray(user.postcode_areas) ? user.postcode_areas.join(',') : ''
        }
      ]
    }

    // 📝 Prepare contact data for UPDATE
    const updateContactData = {
      name: user.fullName,
      email: user.email,
      phone: user.phone || '',
      address1: user.address || '',
      postalCode: user.zipcode || '',
      customFields: [
        {
          id: GHL_TRADES_FIELD_ID,
          value: Array.isArray(user.tradeTypes) ? user.tradeTypes.join(',') : ''
        },
        {
          id: GHL_COVERAGE_FIELD_ID,
          value: Array.isArray(user.postcode_areas) ? user.postcode_areas.join(',') : ''
        }
      ]
    }

    // 🎯 STEP 1: CREATE/UPDATE CONTACT
    console.log('➕ Attempting to create contact');

    let ghlResponse = await fetch(`${GHL_API_URL}/contacts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': GHL_BEARER_TOKEN,
        'Version': '2021-07-28'
      },
      body: JSON.stringify(createContactData)
    });

    let responseText = await ghlResponse.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Failed to parse GHL response');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid GHL response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let operation = 'CREATE';
    let finalContactId = null;

    // ✅ If CREATE succeeds
    if (ghlResponse.ok) {
      finalContactId = responseData.contact?.id;
      console.log('✅ Contact created:', finalContactId);
    }
    // ❌ If duplicate error → Extract contact ID and UPDATE
    else if (
      ghlResponse.status === 400 && 
      responseData.message?.includes('duplicate') &&
      responseData.meta?.contactId
    ) {
      operation = 'UPDATE';
      const existingContactId = responseData.meta.contactId;
      
      console.log('📝 Duplicate found, updating contact:', existingContactId);

      ghlResponse = await fetch(`${GHL_API_URL}/contacts/${existingContactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': GHL_BEARER_TOKEN,
          'Version': '2021-07-28'
        },
        body: JSON.stringify(updateContactData)
      });

      responseText = await ghlResponse.text();

      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Failed to parse UPDATE response');
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid GHL response on update' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!ghlResponse.ok) {
        console.error('❌ UPDATE failed:', responseData);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: responseData.message || 'Failed to update contact',
            details: responseData
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      finalContactId = existingContactId;
      console.log('✅ Contact updated:', finalContactId);
    }
    // ❌ Other errors
    else {
      console.error('❌ GHL Error:', {
        status: ghlResponse.status,
        error: responseData
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: responseData.message || 'GHL API Error',
          details: responseData
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ ${operation} Success! Contact ID:`, finalContactId);

    // 🎯 STEP 2: CREATE OPPORTUNITY (ONLY IF NEW CONTACT)
    if (operation === 'CREATE') {
      console.log('💼 Creating opportunity for new contact:', finalContactId);

      const opportunityData = {
        pipelineId: GHL_PIPELINE_ID,
        locationId: GHL_LOCATION_ID,
        name: user.fullName,
        pipelineStageId: GHL_PIPELINE_STAGE_ID,
        status: 'open',
        contactId: finalContactId
      };

      const oppResponse = await fetch(`${GHL_API_URL}/opportunities/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': GHL_BEARER_TOKEN,
          'Version': '2021-07-28'
        },
        body: JSON.stringify(opportunityData)
      });

      const oppResponseText = await oppResponse.text();
      let oppResponseData;

      try {
        oppResponseData = JSON.parse(oppResponseText);
      } catch (e) {
        console.warn('⚠️ Failed to parse opportunity response');
      }

      if (oppResponse.ok) {
        console.log('✅ Opportunity created:', oppResponseData.opportunity?.id);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            contactId: finalContactId,
            opportunityId: oppResponseData.opportunity?.id,
            operation: operation,
            message: 'Contact and opportunity created successfully'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        console.warn('⚠️ Opportunity creation failed:', oppResponseData);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            contactId: finalContactId,
            operation: operation,
            opportunityCreated: false,
            opportunityError: oppResponseData?.message || 'Failed to create opportunity',
            message: 'Contact created successfully, but opportunity creation failed'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } else {
      // UPDATE operation - skip opportunity creation
      console.log('📝 Contact updated, skipping opportunity creation');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          contactId: finalContactId,
          operation: operation,
          message: 'Contact updated successfully'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('❌ Exception:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
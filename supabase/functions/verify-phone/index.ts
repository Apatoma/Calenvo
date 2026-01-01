import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, phone, otp } = await req.json();

    if (action === 'request') {
      if (!phone) {
        return new Response(
          JSON.stringify({ error: 'Phone number is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const generatedOtp = Math.random().toString().slice(2, 8).padStart(6, '0');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase
        .from('phone_verifications')
        .upsert(
          {
            user_id: user.id,
            phone,
            otp_code: generatedOtp,
            verified: false,
            attempts: 0,
            expires_at: expiresAt,
          },
          { onConflict: 'user_id,phone' }
        );

      if (insertError) {
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const message = `Tu código de verificación es: ${generatedOtp}`;

      try {
        await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phone,
            message,
            type: 'otp',
          }),
        });
      } catch (smsError) {
        console.error('Error sending OTP SMS:', smsError);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'OTP sent to phone' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'verify') {
      if (!phone || !otp) {
        return new Response(
          JSON.stringify({ error: 'Phone and OTP are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: verification, error: fetchError } = await supabase
        .from('phone_verifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('phone', phone)
        .maybeSingle();

      if (fetchError || !verification) {
        return new Response(
          JSON.stringify({ error: 'Verification record not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (new Date(verification.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'OTP has expired' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (verification.attempts >= 3) {
        return new Response(
          JSON.stringify({ error: 'Too many attempts' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (verification.otp_code !== otp) {
        await supabase
          .from('phone_verifications')
          .update({ attempts: verification.attempts + 1 })
          .eq('id', verification.id);

        return new Response(
          JSON.stringify({ error: 'Invalid OTP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      await supabase
        .from('phone_verifications')
        .update({ verified: true })
        .eq('id', verification.id);

      await supabase
        .from('profiles')
        .update({ phone, phone_verified: true })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({ success: true, message: 'Phone verified successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

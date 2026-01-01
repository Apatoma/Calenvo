import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendSmsRequest {
  to: string;
  message: string;
  type: 'otp' | 'booking' | 'reminder' | 'confirmation';
}

async function sendViaTwilio(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    const credentials = btoa(`${accountSid}:${authToken}`);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('From', fromNumber);
    formData.append('To', to);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

async function sendViaVonage(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = Deno.env.get('VONAGE_API_KEY');
    const apiSecret = Deno.env.get('VONAGE_API_SECRET');
    const fromNumber = Deno.env.get('VONAGE_FROM_NUMBER');

    if (!apiKey || !apiSecret || !fromNumber) {
      return { success: false, error: 'Vonage credentials not configured' };
    }

    const url = 'https://rest.nexmo.com/sms/json';
    const formData = new URLSearchParams();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('to', to);
    formData.append('from', fromNumber);
    formData.append('text', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    if (data.messages?.[0]?.status !== '0') {
      return { success: false, error: 'Vonage API error' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, message, type }: SendSmsRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const provider = Deno.env.get('SMS_PROVIDER') || 'twilio';
    let result;

    if (provider === 'twilio') {
      result = await sendViaTwilio(to, message);
    } else if (provider === 'vonage') {
      result = await sendViaVonage(to, message);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid SMS provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: result.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, type }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

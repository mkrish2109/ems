// app/api/content/route.js
import Cookie from 'js-cookie';


// app/api/content/route.js
export async function GET(request) {
  const accessToken = Cookie.get('invitation_token');

  const { searchParams } = new URL(request.url);
  const pageType = searchParams.get('type');
  
  const endpoints = {
    'terms': '/terms-and-conditions',
    'privacy': '/privacy-policy',
    'help': '/page/help-center'
  };

  // Validate page type
  if (!endpoints[pageType]) {
    return new Response(JSON.stringify({ error: 'Invalid page type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoints[pageType]}`, {
       headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract content based on response structure for each page type
    let content = '';
    switch (pageType) {
      case 'privacy':
        content = data.privacyPolicy?.privacy_policy || 
                 data.privacy_policy || 
                 data.content ||
                 'Privacy policy content not available.';
        break;
     case 'terms':
        content = data.terms_conditions?.terms_and_condition ||
                 data.terms_and_condition ||
                 data.content ||
                 'Terms and conditions content not available.';
        break;
      case 'help':
        // Extract from help center response structure
        content = data.page?.description ||
                 data.help_content ||
                 data.content ||
                 'Help center content not available.';
        break;
      default:
        content = 'Content not available.';
    }

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    
    let errorMessage = 'Failed to fetch content';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (error.message.includes('HTTP error')) {
      errorMessage = 'Server error. Please try again later.';
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
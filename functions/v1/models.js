export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  // Only allow GET requests
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({
      error: {
        message: "Method not allowed",
        type: "invalid_request_error",
        param: null,
        code: "method_not_allowed"
      }
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Allow': 'GET, HEAD, OPTIONS'
      }
    });
  }

  // Verify API key
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      error: {
        message: "Missing bearer authentication in header",
        type: "invalid_request_error",
        param: null,
        code: "invalid_auth"
      }
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  const API_KEY = 'sk-test-123456789';
  const providedKey = authHeader.split(' ')[1];
  if (providedKey !== API_KEY) {
    return new Response(JSON.stringify({
      error: {
        message: "Invalid API key",
        type: "invalid_request_error",
        param: null,
        code: "invalid_api_key"
      }
    }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const responseObj = {
    object: "list",
    data: [
      {
        id: "claude-3-5-sonnet",
        object: "model",
        created: timestamp,
        owned_by: "anthropic",
        permission: [
          {
            id: `modelperm-${timestamp}`,
            object: "model_permission",
            created: timestamp,
            allow_create_engine: false,
            allow_sampling: true,
            allow_logprobs: true,
            allow_search_indices: false,
            allow_view: true,
            allow_fine_tuning: false,
            organization: "*",
            group: null,
            is_blocking: false
          }
        ],
        root: null,
        parent: null,
        pricing: {
          prompt: "0.0000",
          completion: "0.0000"
        }
      }
    ]
  };

  // For HEAD requests, return just headers
  if (request.method === 'HEAD') {
    return new Response(null, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // For GET requests, return full response
  return new Response(JSON.stringify(responseObj), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

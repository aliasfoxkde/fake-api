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

  const responseObj = {
    object: "list",
    data: [
      {
        id: "claude-3-5-sonnet",
        object: "model",
        created: 1677610602,
        owned_by: "puter",
        permission: [{
          id: "modelperm-1234",
          object: "model_permission",
          created: 1677610602,
          allow_create_engine: false,
          allow_sampling: true,
          allow_logprobs: true,
          allow_search_indices: false,
          allow_view: true,
          allow_fine_tuning: false,
          organization: "*",
          group: null,
          is_blocking: false
        }],
        root: "claude-3-5-sonnet",
        parent: null
      }
    ]
  };

  // For HEAD requests, return just headers
  if (request.method === 'HEAD') {
    return new Response(null, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }

  // For GET requests, return full response
  return new Response(JSON.stringify(responseObj), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

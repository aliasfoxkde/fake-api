export async function onRequestGet(context) {
  const { request } = context;

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

  return new Response(JSON.stringify({
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
    ],
    object: "list"
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

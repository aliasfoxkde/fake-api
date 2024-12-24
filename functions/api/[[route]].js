// Common headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

// API key for authentication
const API_KEY = 'sk-test-123456789';

// Helper function to verify API key
function verifyApiKey(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      error: {
        message: "Missing bearer authentication in header",
        type: "invalid_request_error",
        param: null,
        code: "invalid_auth"
      },
      status: 401
    };
  }

  const providedKey = authHeader.split(' ')[1];
  if (providedKey !== API_KEY) {
    return {
      error: {
        message: "Invalid API key",
        type: "invalid_request_error",
        param: null,
        code: "invalid_api_key"
      },
      status: 401
    };
  }

  return null;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // API key verification for all non-OPTIONS requests
  if (request.method !== "OPTIONS") {
    const authError = verifyApiKey(request);
    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.error }),
        { status: authError.status, headers: jsonHeaders }
      );
    }
  }

  // Handle models endpoint
  if (request.method === "GET" && pathname.endsWith("/v1/models")) {
    return new Response(
      JSON.stringify({
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
      }),
      { headers: jsonHeaders }
    );
  }

  // Handle chat completions endpoint
  if (request.method === "POST" && pathname.endsWith("/v1/chat/completions")) {
    try {
      const body = await request.json();
      const { messages } = body;

      if (!messages || !Array.isArray(messages)) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Invalid messages format",
              type: "invalid_request_error",
              param: "messages",
              code: "invalid_messages"
            }
          }),
          { status: 400, headers: jsonHeaders }
        );
      }

      const lastMessage = messages[messages.length - 1];
      const content = lastMessage.content;

      // Set up streaming response
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      const encoder = new TextEncoder();

      // Start streaming response
      const response = new Response(stream.readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });

      // Process response in chunks
      (async () => {
        try {
          const words = content.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = {
              id: `chatcmpl-${Date.now()}`,
              object: 'chat.completion.chunk',
              created: Math.floor(Date.now() / 1000),
              model: 'claude-3-5-sonnet',
              choices: [{
                index: 0,
                delta: {
                  content: words[i] + ' '
                },
                finish_reason: null
              }]
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const finalChunk = {
            id: `chatcmpl-${Date.now()}`,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'claude-3-5-sonnet',
            choices: [{
              index: 0,
              delta: {},
              finish_reason: 'stop'
            }]
          };
          await writer.write(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
          await writer.write(encoder.encode('data: [DONE]\n\n'));
          await writer.close();
        } catch (error) {
          console.error('Streaming error:', error);
          await writer.abort(error);
        }
      })();

      return response;
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Internal server error occurred",
            type: "internal_error",
            param: null,
            code: "internal_error"
          }
        }),
        { status: 500, headers: jsonHeaders }
      );
    }
  }

  // Handle unknown routes
  return new Response(
    JSON.stringify({
      error: {
        message: "Not found",
        type: "invalid_request_error",
        param: null,
        code: "resource_not_found"
      }
    }),
    { status: 404, headers: jsonHeaders }
  );
}

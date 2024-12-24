export async function onRequestPost(context) {
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

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({
        error: {
          message: "Invalid messages format",
          type: "invalid_request_error",
          param: "messages",
          code: "invalid_messages"
        }
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content;

    // Set up streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

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

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: {
        message: "Internal server error occurred",
        type: "internal_error",
        param: null,
        code: "internal_error"
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

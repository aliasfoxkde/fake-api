# README

# IMPORVEMENTS
- Load balance between multiple sessions
- Automatically handle "puter" authentication
- Full API documentation on landing page
- Ability to test the API right through the landing page.
- Validation that the authentication is working.
- Add simple Chat interface UI (for testing, etc.)
- Documentation
  - Create nice landing page with basic info (link to github, etc.).
  - Add JSON & Markdown formatting
  - Add ability to API copy code snippets.
  - Extract API Key and impliment basic security.
  - Improve README.md documentation
  - Add LICENSE

# USAGE

## Without auth
curl http://localhost:8788/api/v1/models

## With auth
curl http://localhost:8788/api/v1/models \
  -H "Authorization: Bearer sk-test-123456789"

## Chat completion
curl http://localhost:8788/api/v1/chat/completions \
  -H "Authorization: Bearer sk-test-123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
 
### Expected non-auth behavior: /api/v1/models
{
  "error": {
    "message": "Error description",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_auth"
  }
}

## Local Development:
cd sonnet_api
npm install
npm start

# Test endpoints
curl http://localhost:3000/api/v1/models \
  -H "Authorization: Bearer sk-test-123456789"

# Production (with SSL bypass):
## Models endpoint
curl -k https://api.cyopsys.com/v1/models \
  -H "Authorization: Bearer sk-test-123456789"

## Chat completions
curl -k https://api.cyopsys.com/v1/chat/completions \
  -H "Authorization: Bearer sk-test-123456789" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'

## Using with OpenAI clients:
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://api.cyopsys.com',
  apiKey: 'sk-test-123456789'
});

// List models
const models = await openai.models.list();

// Create chat completion
const stream = await openai.chat.completions.create({
  model: 'claude-3-5-sonnet',
  messages: [{ role: 'user', content: 'Hello!' }],
  stream: true
});

Note: The implementation now provides a robust OpenAI-compatible API that works in both local development and production environments, with proper error handling and SSL support.
# README

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
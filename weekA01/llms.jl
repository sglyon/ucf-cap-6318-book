module LLMs

export call_claude, call_gpt

using HTTP, JSON3, DotEnv

"""
    call_claude(prompt; model="claude-haiku-4-5", max_tokens=1024)

Call the Anthropic Claude API with a prompt.

# Arguments
- `prompt`: The text prompt to send to Claude
- `model`: Which Claude model to use. Options:
  - "claude-haiku-4-5" (default) - Fast and cost-effective
  - "claude-sonnet-4-5" - Most intelligent, best for complex tasks
  - "claude-opus-4" - Premium model with 200K context window
- `max_tokens`: Maximum length of response (default: 1024)

# Returns
- String containing Claude's response

# Note
Check https://docs.anthropic.com/en/docs/models-overview for exact model identifiers
as they may include version dates (e.g., "claude-haiku-4-5-20250101")
"""
function call_claude(prompt; model="claude-haiku-4-5", max_tokens=1024)
    url = "https://api.anthropic.com/v1/messages"

    headers = [
        "x-api-key" => ANTHROPIC_API_KEY,
        "anthropic-version" => "2023-06-01",
        "content-type" => "application/json"
    ]

    body = JSON3.write(Dict(
        "model" => model,
        "max_tokens" => max_tokens,
        "messages" => [
            Dict("role" => "user", "content" => prompt)
        ]
    ))

    response = HTTP.post(url, headers, body)
    result = JSON3.read(String(response.body))

    return result.content[1].text
end

"""
    call_gpt(input; instructions="", model="gpt-5-mini", reasoning_effort="low")

Call the OpenAI Responses API with a user input and optional instructions.

# Arguments
- `input`: The user input/query to send to the model
- `instructions`: Optional system-level instructions for the model's behavior
- `model`: Which OpenAI model to use. Options:
  - "gpt-5-mini" (default) - Cost-effective, 5x cheaper than GPT-5
  - "gpt-5" - Flagship model with advanced reasoning
  - "o3-mini" - Specialized reasoning model (cost-effective)
  - "o3" - Advanced reasoning model
- `reasoning_effort`: Reasoning effort level for faster responses. Options:
  - "low" (default) - Faster responses
  - "medium" - Balanced
  - "high" - Maximum reasoning quality

# Returns
- String containing the model's response (using the convenience `output_text` field)

# Notes
- Uses the Responses API endpoint: /v1/responses
- The response has an `output` array, but we use the convenience `output_text` property
- The `output` array can contain multiple items (not just text), so always check structure
- For system instructions, use the `instructions` parameter (replaces the "system" role)
- Check https://platform.openai.com/docs/models for the latest model names
- API documentation: https://platform.openai.com/docs/api-reference/responses

# Example
```julia
# Simple query
response = call_gpt("What is emergence?")

# With instructions
response = call_gpt(
    "Explain the Schelling model",
    instructions="You are an expert in agent-based modeling"
)

# Different model and reasoning effort
response = call_gpt(
    "Solve this complex problem: ...",
    model="gpt-5",
    reasoning_effort="high"
)
```
"""
function call_gpt(input::String; instructions::String="", model::String="gpt-5-nano", reasoning_effort::String="low")
    url = "https://api.openai.com/v1/responses"

    # OPENAI_API_KEY should be loaded from ENV via DotEnv
    headers = [
        "Authorization" => "Bearer $(ENV["OPENAI_API_KEY"])",
        "Content-Type" => "application/json"
    ]

    # Build request body with Responses API format
    request_body = Dict(
        "model" => model,
        "input" => input,
        "reasoning" => Dict("effort" => reasoning_effort)
    )

    # Add instructions if provided
    if !isempty(instructions)
        request_body["instructions"] = instructions
    end

    body = JSON3.write(request_body)

    response = HTTP.post(url, headers, body)
    result = JSON3.read(String(response.body))

    # NOTE: result.output is an array that can have multiple items. We are assuming a simple case here...
    return result.output[end].content[1].text
end


end  # module LLMs

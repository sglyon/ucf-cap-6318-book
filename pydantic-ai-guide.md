# PydanticAI Implementation Guide for CAP-6318 AI Lectures

## Overview

PydanticAI is a Python agent framework designed to make production-grade generative AI applications less painful to build. The framework brings the "FastAPI feeling" to GenAI development, emphasizing type safety, dependency injection, and validation-first design.

### Core Philosophy

1. **Type Safety First**: Uses Python type hints and Pydantic validation to catch errors at write-time rather than runtime
2. **Dependency Injection**: Structured system for passing data, connections, and logic to agents
3. **Model Agnosticism**: Supports multiple LLM providers (OpenAI, Anthropic, Google, etc.) without vendor lock-in
4. **Validation-First**: All agent responses validated against Pydantic models

### Why PydanticAI?

- **Source vs. Derivative**: Pydantic Validation underpins most major LLM SDKs - using PydanticAI eliminates unnecessary abstraction layers
- **Superior IDE Support**: Full type checking with mypy/pyright
- **Production Ready**: Built-in support for retries, error handling, streaming, and observability
- **Pythonic**: Leverages existing Python patterns rather than inventing new paradigms

---

## Core Concepts

### 1. Creating Agents

Agents are the primary interface for interacting with LLMs in PydanticAI. They serve as containers for instructions, tools, dependencies, and output types.

#### Basic Agent Creation

```python
from pydantic_ai import Agent

# Simplest form - model name only
agent = Agent('openai:gpt-5')

# With instructions
agent = Agent(
    'openai:gpt-5',
    instructions='Be concise, reply with one sentence.'
)

# Type-safe agent with dependencies and output type
from pydantic_ai import Agent, RunContext

roulette_agent = Agent(
    'openai:gpt-5',
    deps_type=int,
    output_type=bool,
    system_prompt='Use the roulette_wheel function to evaluate winning squares.'
)
```

#### Agent Type Safety

Agents are generic over dependency and output types:
- `Agent[None, str]` - No dependencies, returns string
- `Agent[DatabaseConn, dict]` - Takes DatabaseConn dependency, returns dict
- `Agent[int, bool]` - Takes int dependency, returns bool

#### System Prompts vs Instructions

**System Prompts**:
- Persist across multiple runs with different agents
- Useful for maintaining conversation context
- Included when using `message_history`

**Instructions**:
- Apply only to current agent
- Excluded when `message_history` is provided
- Better for agent-specific behavior

```python
# Static system prompt
agent = Agent(
    'openai:gpt-5',
    system_prompt="Use the customer's name while replying."
)

# Dynamic system prompt
@agent.system_prompt
def add_the_date() -> str:
    from datetime import date
    return f'The date is {date.today()}.'

# Static instructions
agent = Agent(
    'openai:gpt-5',
    instructions="Use the customer's name while replying."
)

# Dynamic instructions with dependencies
@agent.instructions
def add_user_name(ctx: RunContext[str]) -> str:
    return f"The user's name is {ctx.deps}."
```

#### Running Agents

Five execution methods available:

```python
# 1. Synchronous execution
result = agent.run_sync('What is the capital of Italy?')
print(result.output)

# 2. Asynchronous execution
result = await agent.run('What is the capital of France?')

# 3. Streaming text output
async with agent.run_stream('What is the capital of the UK?') as response:
    async for text in response.stream_text():
        print(text)

# 4. Streaming events
async for event in agent.run_stream_events('What is the capital of Mexico?'):
    print(event)

# 5. Graph node iteration
async with agent.iter('What is the capital of France?') as agent_run:
    async for node in agent_run:
        print(node)
```

#### Model Configuration

```python
from pydantic_ai import Agent, ModelSettings

# Model-level defaults
agent = Agent(
    'openai:gpt-5',
    model_settings=ModelSettings(temperature=0.5, max_tokens=1000)
)

# Run-time overrides (highest priority)
result = agent.run_sync(
    'What is the capital of Italy?',
    model_settings=ModelSettings(temperature=0.0)
)
```

#### Usage Limits

Prevent runaway costs and infinite loops:

```python
from pydantic_ai import Agent, UsageLimits, UsageLimitExceeded

agent = Agent('openai:gpt-5')

try:
    result = agent.run_sync(
        'Answer in one word.',
        usage_limits=UsageLimits(
            response_tokens_limit=100,
            request_limit=5,  # Max model turns
            tool_calls_limit=10  # Max tool executions
        )
    )
except UsageLimitExceeded as e:
    print(f'Exceeded limit: {e}')
```

---

### 2. Tool Registration and Function Calling

Tools enable agents to perform actions and retrieve information beyond their training data. PydanticAI automatically generates JSON schemas from function signatures.

#### Tool Registration Methods

Three primary approaches:

```python
from pydantic_ai import Agent, RunContext
import random

agent = Agent('openai:gpt-5')

# 1. @agent.tool decorator (with context access)
@agent.tool
def get_player_name(ctx: RunContext[str]) -> str:
    """Get the player's name."""
    return ctx.deps

# 2. @agent.tool_plain decorator (without context)
@agent.tool_plain
def roll_dice() -> str:
    """Roll a six-sided die and return the result."""
    return str(random.randint(1, 6))

# 3. Keyword argument registration
def another_tool() -> str:
    """Another tool function."""
    return "result"

agent = Agent(
    'openai:gpt-5',
    tools=[roll_dice, another_tool]
)
```

#### Automatic Schema Generation

PydanticAI uses the Griffe library to extract parameter descriptions from docstrings:

```python
@agent.tool
def calculate_distance(
    ctx: RunContext[None],
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float
) -> float:
    """
    Calculate the distance between two coordinates.

    Args:
        lat1: Latitude of first location
        lon1: Longitude of first location
        lat2: Latitude of second location
        lon2: Longitude of second location

    Returns:
        Distance in kilometers
    """
    # Implementation
    return distance
```

Supported docstring formats:
- Google style (recommended)
- NumPy style
- Sphinx style

#### Tool Parameters

When a tool has a single structured parameter, the schema simplifies:

```python
from pydantic import BaseModel

class SearchParams(BaseModel):
    query: str
    limit: int = 10

@agent.tool
def search(ctx: RunContext[None], params: SearchParams) -> list[dict]:
    """Search with structured parameters."""
    # Implementation
    return results
```

#### Tool Execution Flow

1. Model receives tool schemas
2. Model decides to call tool(s)
3. PydanticAI validates parameters
4. Function executes
5. Result returns to model as ToolReturn
6. Model either calls more tools or generates final response

#### Advanced Tool Features

**Retry Configuration**:
```python
@agent.tool(retries=3)
def flaky_api_call(ctx: RunContext[None], query: str) -> dict:
    """Call an unreliable API."""
    # If this raises ModelRetry, it will be retried up to 3 times
    response = api.call(query)
    if not response.ok:
        from pydantic_ai import ModelRetry
        raise ModelRetry('API call failed, please try again')
    return response.data
```

**Tool with Metadata**:
```python
from pydantic_ai.messages import ToolReturn

@agent.tool
def screenshot_tool(ctx: RunContext[None], action: str) -> ToolReturn:
    """Take a screenshot and return both visual and data."""
    screenshot = take_screenshot()
    metadata = {"timestamp": time.time(), "action": action}

    return ToolReturn(
        return_value={"status": "success"},
        content=screenshot,  # Image shown to LLM
        metadata=metadata    # Available to app, not LLM
    )
```

---

### 3. Structured Outputs

Structured outputs enable agents to return validated data beyond plain text.

#### Output Types

PydanticAI supports multiple structured formats:

```python
from pydantic import BaseModel
from typing import TypedDict

# Pydantic models (recommended)
class CityInfo(BaseModel):
    city: str
    country: str
    population: int

agent = Agent('openai:gpt-5', output_type=CityInfo)

# TypedDict
class PersonDict(TypedDict):
    name: str
    age: int

agent = Agent('openai:gpt-5', output_type=PersonDict)

# Scalar types
agent = Agent('openai:gpt-5', output_type=int)

# Collections
agent = Agent('openai:gpt-5', output_type=list[str])
```

#### Result Access

```python
result = agent.run_sync('Where were the 2012 Olympics held?')

# Access structured output
print(result.output)  # CityInfo(city='London', country='United Kingdom', population=9000000)

# Access usage metrics
print(result.usage())  # Token counts and request metrics

# Access message history
print(result.all_messages())  # Complete conversation
print(result.new_messages())  # Only from this run
```

#### Output Modes

Three implementation strategies:

**1. Tool Output (default)**: Uses tool calls for structured data
```python
from pydantic_ai.output import ToolOutput

class Response(BaseModel):
    answer: str

agent = Agent('openai:gpt-5', output_type=ToolOutput[Response])
```

**2. Native Output**: Leverages model-specific structured output features
```python
from pydantic_ai.output import NativeOutput

agent = Agent('openai:gpt-5', output_type=NativeOutput[Response])
```

**3. Prompted Output**: Injects JSON schema into instructions
```python
from pydantic_ai.output import PromptedOutput

agent = Agent('openai:gpt-5', output_type=PromptedOutput[Response])
```

#### Output Validation

```python
from pydantic_ai import Agent, ModelRetry, RunContext

class AnalysisResult(BaseModel):
    sentiment: str
    confidence: float

agent = Agent('openai:gpt-5', output_type=AnalysisResult)

@agent.output_validator
async def validate_confidence(ctx: RunContext[None], output: AnalysisResult) -> AnalysisResult:
    """Ensure confidence is reasonable."""
    if output.confidence < 0.5:
        raise ModelRetry('Confidence too low, please reconsider.')
    return output
```

#### Streaming Structured Data

```python
from pydantic import BaseModel

class UserProfile(BaseModel):
    name: str
    age: int
    interests: list[str]

agent = Agent('openai:gpt-5', output_type=UserProfile)

async with agent.run_stream('Generate a user profile') as result:
    async for profile in result.stream_output():
        # Profile progressively builds as data arrives
        print(f"Current: {profile}")
```

---

### 4. Dependencies and State Management

Dependencies provide runtime context to agents, tools, and instructions through type-safe dependency injection.

#### Defining Dependencies

```python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

# Simple dependency - single value
agent = Agent[str, str]('openai:gpt-5', deps_type=str)

@agent.tool
def greet(ctx: RunContext[str]) -> str:
    """Greet the user."""
    return f"Hello, {ctx.deps}!"

result = agent.run_sync('Greet me', deps='Alice')

# Complex dependencies - dataclass
@dataclass
class AppDeps:
    database: DatabaseConnection
    api_key: str
    user_id: int

agent = Agent[AppDeps, dict]('openai:gpt-5', deps_type=AppDeps)

@agent.tool
async def fetch_user_data(ctx: RunContext[AppDeps]) -> dict:
    """Fetch user data from database."""
    return await ctx.deps.database.query(
        'SELECT * FROM users WHERE id = ?',
        ctx.deps.user_id
    )
```

#### RunContext Features

`RunContext[DepsType]` provides:
- `.deps` - Access to dependencies
- `.usage` - Token usage tracking (can be passed to delegate agents)
- `.retry` - Current retry attempt number
- `.partial_output` - For validation during streaming

```python
@agent.tool
async def complex_tool(ctx: RunContext[AppDeps]) -> dict:
    """Tool using multiple context features."""
    # Access dependencies
    db = ctx.deps.database

    # Check retry attempt
    if ctx.retry > 0:
        print(f"Retry attempt {ctx.retry}")

    # Use database
    result = await db.query('SELECT ...')
    return result
```

#### Async vs Sync Dependencies

Both work regardless of whether you use `run()` or `run_sync()`:

```python
# Sync dependency
@agent.tool
def sync_tool(ctx: RunContext[str]) -> str:
    """Synchronous tool."""
    return ctx.deps.upper()

# Async dependency
@agent.tool
async def async_tool(ctx: RunContext[DatabaseConn]) -> dict:
    """Asynchronous tool."""
    return await ctx.deps.query('SELECT ...')
```

#### Dependency Override for Testing

```python
from pydantic_ai.models.test import TestModel

# Production dependencies
prod_deps = AppDeps(
    database=ProductionDB(),
    api_key='prod-key',
    user_id=123
)

# Test dependencies
test_deps = AppDeps(
    database=MockDB(),
    api_key='test-key',
    user_id=999
)

# Override in tests
with agent.override(deps=test_deps, model=TestModel()):
    result = agent.run_sync('Test query')
```

---

### 5. Multi-Agent Communication

PydanticAI supports multiple patterns for multi-agent systems, from simple delegation to complex orchestration.

#### Architecture Levels

1. **Single Agent** - Standard agent usage
2. **Agent Delegation** - Parent agent invokes child agents via tools
3. **Programmatic Hand-off** - Application code sequences agents
4. **Graph-Based Control Flow** - State machine orchestration

#### Agent Delegation Pattern

Parent agent delegates work to specialist agents:

```python
from pydantic_ai import Agent, RunContext
from dataclasses import dataclass

@dataclass
class Deps:
    api_key: str

# Specialist agent for weather
weather_agent = Agent[Deps, dict](
    'openai:gpt-5',
    output_type=dict,
    instructions='Provide weather information in JSON format.'
)

# Main agent that delegates
main_agent = Agent[Deps, str](
    'openai:gpt-5',
    output_type=str
)

@main_agent.tool
async def get_weather_report(ctx: RunContext[Deps], location: str) -> dict:
    """Get detailed weather report for a location."""
    # Delegate to specialist agent
    result = await weather_agent.run(
        f'Get weather for {location}',
        deps=ctx.deps,
        usage=ctx.usage  # Aggregate usage tracking
    )
    return result.output

# Usage
result = await main_agent.run(
    'What is the weather in Paris and London?',
    deps=Deps(api_key='key')
)
```

**Key Characteristics**:
- Agents can be module-level globals (stateless)
- Usage tracking aggregates via `ctx.usage`
- Control returns to parent after delegation
- Dependencies can be shared or subset

#### Programmatic Hand-off Pattern

Application code explicitly sequences agents:

```python
from pydantic_ai import Agent, RunUsage

# Agent 1: Extract entities
entity_agent = Agent[None, list[str]](
    'openai:gpt-5',
    output_type=list[str],
    instructions='Extract named entities from text.'
)

# Agent 2: Classify sentiment
sentiment_agent = Agent[None, str](
    'openai:gpt-5',
    output_type=str,
    instructions='Classify sentiment as positive, negative, or neutral.'
)

# Agent 3: Summarize
summary_agent = Agent[None, str](
    'openai:gpt-5',
    output_type=str
)

# Application orchestrates
async def process_text(text: str) -> dict:
    """Process text through multiple agents."""
    usage = RunUsage()

    # Step 1: Extract entities
    entities_result = await entity_agent.run(text, usage=usage)
    entities = entities_result.output

    # Step 2: Analyze sentiment
    sentiment_result = await sentiment_agent.run(
        text,
        message_history=entities_result.new_messages(),
        usage=usage
    )
    sentiment = sentiment_result.output

    # Step 3: Summarize with context
    summary_result = await summary_agent.run(
        f"Summarize this text considering entities {entities} and sentiment {sentiment}: {text}",
        usage=usage
    )

    return {
        "entities": entities,
        "sentiment": sentiment,
        "summary": summary_result.output,
        "total_usage": usage
    }
```

**Key Characteristics**:
- Application logic coordinates workflow
- Message history can be passed between agents
- Unified usage tracking via `RunUsage` object
- Supports human-in-the-loop
- Agents can have different dependency types

#### A2A Protocol (Agent2Agent)

PydanticAI supports the A2A open standard for agent interoperability:

```python
from pydantic_ai import Agent

# Create agent
agent = Agent('openai:gpt-5', instructions='Be helpful!')

# Convert to A2A server
app = agent.to_a2a()

# Deploy: uvicorn my_agent:app --host 0.0.0.0 --port 8000
```

**A2A Features**:
- HTTP-based communication
- Context-based conversations (`context_id`)
- Task management (individual executions)
- Framework-agnostic interoperability

---

### 6. Message History

Message history enables conversation context and multi-turn interactions.

#### Accessing Messages

```python
result1 = agent.run_sync('What is 2+2?')

# Get all messages (includes system prompt + conversation)
all_msgs = result1.all_messages()

# Get only new messages from this run
new_msgs = result1.new_messages()

# JSON variants
json_msgs = result1.all_messages_json()
```

#### Maintaining Conversation Context

```python
# First interaction
result1 = agent.run_sync('My name is Alice.')

# Follow-up with context
result2 = agent.run_sync(
    'What is my name?',
    message_history=result1.new_messages()
)
# Agent remembers: "Your name is Alice."

# Continue conversation
result3 = agent.run_sync(
    'What did we talk about?',
    message_history=result2.all_messages()
)
```

**Important**: When `message_history` is provided and non-empty, a new system prompt is NOT generated (assumes history includes one).

#### Persisting Conversations

```python
from pydantic_ai import ModelMessagesTypeAdapter
from pydantic_core import to_jsonable_python
import json

# Save to JSON
history = result.all_messages()
json_data = json.dumps(to_jsonable_python(history))

# Store in database
db.save_conversation(user_id, json_data)

# Load from database
loaded_json = db.load_conversation(user_id)
restored_history = ModelMessagesTypeAdapter.validate_python(
    json.loads(loaded_json)
)

# Continue conversation
result = agent.run_sync(
    'Continue from where we left off',
    message_history=restored_history
)
```

#### Processing Message History

Use `history_processors` to modify messages before sending to model:

```python
from pydantic_ai.messages import ModelMessage, ModelRequest

def keep_recent_only(messages: list[ModelMessage]) -> list[ModelMessage]:
    """Keep only last 10 messages to manage token usage."""
    return messages[-10:]

def filter_sensitive_info(messages: list[ModelMessage]) -> list[ModelMessage]:
    """Remove messages containing sensitive data."""
    return [
        msg for msg in messages
        if not contains_sensitive_data(msg)
    ]

agent = Agent(
    'openai:gpt-5',
    history_processors=[keep_recent_only, filter_sensitive_info]
)
```

**With Context**:
```python
from pydantic_ai import RunContext

def context_aware_processor(
    ctx: RunContext[AppDeps],
    messages: list[ModelMessage]
) -> list[ModelMessage]:
    """Process based on user permissions."""
    if ctx.deps.user_role == 'admin':
        return messages
    else:
        return filter_admin_messages(messages)

agent = Agent(
    'openai:gpt-5',
    history_processors=[context_aware_processor]
)
```

**Important**: Ensure tool calls and their returns remain paired when slicing history.

---

### 7. Error Handling and Retries

PydanticAI provides comprehensive error handling with automatic retries and custom retry logic.

#### ModelRetry Exception

Signal the model to retry with corrected information:

```python
from pydantic_ai import Agent, ModelRetry, RunContext

@agent.tool(retries=3)
def get_user_id(ctx: RunContext[DatabaseConn], name: str) -> int:
    """Look up user ID by name."""
    user = ctx.deps.query_user(name)
    if user is None:
        raise ModelRetry(f'No user found with name {name!r}. Try a different name.')
    return user.id
```

#### Tool-Level Retries

Configure retries per tool:

```python
@agent.tool(retries=5)
async def call_external_api(ctx: RunContext[None], query: str) -> dict:
    """Call flaky external API."""
    try:
        response = await api.call(query)
        return response.data
    except NetworkError as e:
        raise ModelRetry(f'Network error: {e}. Please try again.')
```

#### HTTP Retry Configuration

For production-ready HTTP retries with exponential backoff:

```bash
pip install 'pydantic-ai-slim[retries]'
```

```python
from httpx import AsyncClient, HTTPStatusError
from tenacity import (
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential
)
from pydantic_ai.retries import (
    AsyncTenacityTransport,
    RetryConfig,
    wait_retry_after
)

def create_retrying_client() -> AsyncClient:
    """Create HTTP client with intelligent retry logic."""
    def should_retry_status(response):
        # Raise on rate limits and server errors
        if response.status_code in (429, 502, 503, 504):
            response.raise_for_status()

    transport = AsyncTenacityTransport(
        config=RetryConfig(
            retry=retry_if_exception_type((HTTPStatusError, ConnectionError)),
            wait=wait_retry_after(
                fallback_strategy=wait_exponential(multiplier=1, max=60),
                max_wait=300  # 5 minutes max
            ),
            stop=stop_after_attempt(5),
            reraise=True
        ),
        validate_response=should_retry_status
    )
    return AsyncClient(transport=transport)

# Use with OpenAI
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

client = create_retrying_client()
model = OpenAIChatModel('gpt-5', provider=OpenAIProvider(http_client=client))
agent = Agent(model)
```

#### Smart Retry-After Header Handling

```python
from pydantic_ai.retries import wait_retry_after

# Automatically respects HTTP Retry-After headers
wait_strategy = wait_retry_after(
    fallback_strategy=wait_exponential(multiplier=1, max=60),
    max_wait=300
)
```

#### Capturing Messages During Errors

```python
from pydantic_ai import capture_run_messages, UnexpectedModelBehavior

with capture_run_messages() as messages:
    try:
        result = agent.run_sync('prompt')
    except UnexpectedModelBehavior as e:
        print(f'Error: {e}')
        print(f'Messages exchanged: {messages}')
        # Debug or log the conversation that led to error
```

#### Usage Limits

Prevent infinite loops and runaway costs:

```python
from pydantic_ai import UsageLimits, UsageLimitExceeded

try:
    result = agent.run_sync(
        'Complex query',
        usage_limits=UsageLimits(
            request_limit=10,        # Max model turns
            response_tokens_limit=5000,  # Max output tokens
            tool_calls_limit=20      # Max tool executions
        )
    )
except UsageLimitExceeded as e:
    print(f'Limit exceeded: {e}')
```

---

### 8. Testing

PydanticAI makes testing agents straightforward with mock models and dependency overrides.

#### Test Setup

```python
import pytest
from pydantic_ai.models.test import TestModel

# Mark async tests
pytestmark = pytest.mark.anyio

# Prevent accidental API calls
import os
os.environ['ALLOW_MODEL_REQUESTS'] = 'False'
```

#### TestModel

Simplest approach - generates valid but synthetic data:

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent('openai:gpt-5', output_type=dict)

async def test_agent_basic():
    """Test basic agent execution."""
    with agent.override(model=TestModel()):
        result = await agent.run('Get weather')
        assert isinstance(result.output, dict)
```

**TestModel Characteristics**:
- Calls all registered tools by default
- Generates data matching JSON schemas
- Not realistic but validates workflow
- No actual LLM calls

#### FunctionModel

More sophisticated testing with custom logic:

```python
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.messages import (
    ModelMessage,
    ModelResponse,
    TextPart,
    ToolCallPart
)
from pydantic_ai import AgentInfo

def custom_model_logic(
    messages: list[ModelMessage],
    info: AgentInfo
) -> ModelResponse:
    """Custom logic for test scenarios."""
    # Check what's in the conversation
    if len(messages) == 1:
        # First call - trigger tool
        return ModelResponse(parts=[
            ToolCallPart(
                'weather_forecast',
                args={'location': 'London'}
            )
        ])
    else:
        # After tool call - return final answer
        return ModelResponse(parts=[
            TextPart('The weather in London is sunny.')
        ])

async def test_agent_with_function_model():
    """Test with controlled tool calling."""
    with agent.override(model=FunctionModel(custom_model_logic)):
        result = await agent.run('Weather in London?')
        assert 'sunny' in result.output
```

#### Dependency Override

Test with mock dependencies without changing application code:

```python
from dataclasses import dataclass

@dataclass
class Deps:
    database: DatabaseConnection
    api_key: str

# Production code
prod_deps = Deps(database=RealDB(), api_key='prod-key')

# Test code
class MockDB:
    def query(self, sql: str) -> list[dict]:
        return [{'id': 1, 'name': 'Test User'}]

test_deps = Deps(database=MockDB(), api_key='test-key')

async def test_with_mock_deps():
    """Test with mocked database."""
    with agent.override(model=TestModel(), deps=test_deps):
        result = await agent.run('Get user data')
        assert result.output['name'] == 'Test User'
```

#### Message Capture for Assertions

```python
from pydantic_ai import capture_run_messages
from pydantic_ai.messages import ModelRequest, ModelResponse

async def test_message_flow():
    """Verify exact message exchange."""
    with capture_run_messages() as messages:
        with agent.override(model=TestModel()):
            result = await agent.run('Test query')

    # Assert message structure
    assert len(messages) >= 2
    assert isinstance(messages[0], ModelRequest)
    assert isinstance(messages[-1], ModelResponse)

    # Check tool calls
    tool_calls = [
        msg for msg in messages
        if isinstance(msg, ModelResponse)
        and any(hasattr(part, 'tool_name') for part in msg.parts)
    ]
    assert len(tool_calls) > 0
```

#### Pytest Fixtures

Reusable test setup:

```python
@pytest.fixture
def override_agent():
    """Fixture to override agent with test model."""
    with agent.override(model=TestModel()):
        yield

async def test_with_fixture(override_agent: None):
    """Test using fixture."""
    result = await agent.run('Test')
    assert result.output is not None

# Fixture with custom dependencies
@pytest.fixture
def test_deps():
    """Provide test dependencies."""
    return Deps(database=MockDB(), api_key='test-key')

@pytest.fixture
def override_agent_with_deps(test_deps):
    """Override with model and deps."""
    with agent.override(model=TestModel(), deps=test_deps):
        yield

async def test_complete(override_agent_with_deps: None):
    """Test with mocked model and dependencies."""
    result = await agent.run('Query')
    assert result.output is not None
```

#### Testing Streaming

```python
async def test_streaming():
    """Test streaming output."""
    with agent.override(model=TestModel()):
        outputs = []
        async with agent.run_stream('Generate data') as result:
            async for chunk in result.stream_output():
                outputs.append(chunk)

        assert len(outputs) > 0
        assert result.output == outputs[-1]
```

---

## Code Patterns for Common Tasks

### Pattern 1: Simple Agent with Tools

Complete example showing basic tool integration:

```python
from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
import httpx

# Define dependencies
@dataclass
class WeatherDeps:
    api_key: str
    http_client: httpx.AsyncClient

# Create agent
weather_agent = Agent[WeatherDeps, str](
    'openai:gpt-5',
    deps_type=WeatherDeps,
    output_type=str,
    instructions='Provide concise weather information.'
)

# Register tools
@weather_agent.tool
async def get_coordinates(
    ctx: RunContext[WeatherDeps],
    location: str
) -> dict:
    """
    Get latitude and longitude for a location.

    Args:
        location: City name or address

    Returns:
        Dictionary with 'lat' and 'lon' keys
    """
    response = await ctx.deps.http_client.get(
        'https://geocoding-api.com/search',
        params={'q': location, 'key': ctx.deps.api_key}
    )
    data = response.json()
    return {'lat': data['lat'], 'lon': data['lon']}

@weather_agent.tool
async def get_weather(
    ctx: RunContext[WeatherDeps],
    lat: float,
    lon: float
) -> dict:
    """
    Get current weather for coordinates.

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        Weather data including temperature and conditions
    """
    response = await ctx.deps.http_client.get(
        'https://weather-api.com/current',
        params={'lat': lat, 'lon': lon, 'key': ctx.deps.api_key}
    )
    return response.json()

# Usage
async def main():
    deps = WeatherDeps(
        api_key='your-api-key',
        http_client=httpx.AsyncClient()
    )

    result = await weather_agent.run(
        'What is the weather like in Paris?',
        deps=deps
    )

    print(result.output)
    print(f"Tokens used: {result.usage()}")
```

---

### Pattern 2: Agent with Structured Output

Example showing validated, structured responses:

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext, ModelRetry
from typing import Literal
from dataclasses import dataclass

# Define structured output
class SentimentAnalysis(BaseModel):
    sentiment: Literal['positive', 'negative', 'neutral']
    confidence: float = Field(ge=0.0, le=1.0)
    key_phrases: list[str]
    summary: str

# Dependencies
@dataclass
class AnalysisDeps:
    min_confidence: float = 0.6

# Create agent with structured output
analysis_agent = Agent[AnalysisDeps, SentimentAnalysis](
    'openai:gpt-5',
    deps_type=AnalysisDeps,
    output_type=SentimentAnalysis,
    instructions='Analyze sentiment with supporting evidence.'
)

# Optional: Add validation
@analysis_agent.output_validator
async def validate_analysis(
    ctx: RunContext[AnalysisDeps],
    output: SentimentAnalysis
) -> SentimentAnalysis:
    """Ensure analysis meets quality standards."""
    if output.confidence < ctx.deps.min_confidence:
        raise ModelRetry(
            f'Confidence {output.confidence} is below minimum '
            f'{ctx.deps.min_confidence}. Please reconsider.'
        )

    if len(output.key_phrases) < 2:
        raise ModelRetry('Please provide at least 2 key phrases.')

    return output

# Usage
async def analyze_text(text: str) -> SentimentAnalysis:
    """Analyze sentiment of text."""
    deps = AnalysisDeps(min_confidence=0.7)

    result = await analysis_agent.run(
        f'Analyze the sentiment of this text: {text}',
        deps=deps
    )

    # Type-safe access to structured output
    analysis: SentimentAnalysis = result.output

    print(f"Sentiment: {analysis.sentiment}")
    print(f"Confidence: {analysis.confidence:.2%}")
    print(f"Key phrases: {', '.join(analysis.key_phrases)}")
    print(f"Summary: {analysis.summary}")

    return analysis

# With streaming
async def analyze_streaming(text: str):
    """Stream partial results as they're generated."""
    deps = AnalysisDeps(min_confidence=0.7)

    async with analysis_agent.run_stream(
        f'Analyze: {text}',
        deps=deps
    ) as result:
        async for partial in result.stream_output():
            print(f"Partial analysis: {partial}")

        final = result.output
        print(f"Final: {final}")
```

---

### Pattern 3: Multi-Agent System

Example showing agent delegation and coordination:

```python
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from dataclasses import dataclass
from typing import Optional

# Shared dependencies
@dataclass
class SystemDeps:
    database: 'DatabaseConnection'
    user_id: int

# Output types
class ResearchResult(BaseModel):
    sources: list[str]
    summary: str
    confidence: float

class AnalysisResult(BaseModel):
    insights: list[str]
    recommendations: list[str]

class FinalReport(BaseModel):
    research: ResearchResult
    analysis: AnalysisResult
    conclusion: str

# Specialist agent 1: Research
research_agent = Agent[SystemDeps, ResearchResult](
    'openai:gpt-5',
    deps_type=SystemDeps,
    output_type=ResearchResult,
    instructions='Conduct thorough research and cite sources.'
)

@research_agent.tool
async def search_database(
    ctx: RunContext[SystemDeps],
    query: str
) -> list[dict]:
    """Search internal database."""
    return await ctx.deps.database.search(query)

# Specialist agent 2: Analysis
analysis_agent = Agent[SystemDeps, AnalysisResult](
    'openai:gpt-5',
    deps_type=SystemDeps,
    output_type=AnalysisResult,
    instructions='Provide actionable insights and recommendations.'
)

@analysis_agent.tool
async def get_user_context(
    ctx: RunContext[SystemDeps]
) -> dict:
    """Get user-specific context."""
    return await ctx.deps.database.get_user(ctx.deps.user_id)

# Main coordinator agent
coordinator_agent = Agent[SystemDeps, FinalReport](
    'openai:gpt-5',
    deps_type=SystemDeps,
    output_type=FinalReport,
    instructions='Coordinate research and analysis to produce comprehensive reports.'
)

@coordinator_agent.tool
async def conduct_research(
    ctx: RunContext[SystemDeps],
    topic: str
) -> ResearchResult:
    """Delegate to research agent."""
    result = await research_agent.run(
        f'Research this topic: {topic}',
        deps=ctx.deps,
        usage=ctx.usage  # Aggregate usage
    )
    return result.output

@coordinator_agent.tool
async def perform_analysis(
    ctx: RunContext[SystemDeps],
    research: ResearchResult
) -> AnalysisResult:
    """Delegate to analysis agent."""
    result = await analysis_agent.run(
        f'Analyze this research: {research.summary}',
        deps=ctx.deps,
        usage=ctx.usage
    )
    return result.output

# Usage
async def generate_report(topic: str, user_id: int) -> FinalReport:
    """Generate comprehensive report using multi-agent system."""
    deps = SystemDeps(
        database=get_database(),
        user_id=user_id
    )

    result = await coordinator_agent.run(
        f'Generate a comprehensive report on: {topic}',
        deps=deps
    )

    report: FinalReport = result.output
    print(f"Total tokens used: {result.usage()}")

    return report

# Programmatic hand-off alternative (no coordinator)
async def generate_report_sequential(topic: str, user_id: int) -> dict:
    """Generate report with sequential agent calls."""
    from pydantic_ai import RunUsage

    deps = SystemDeps(database=get_database(), user_id=user_id)
    usage = RunUsage()

    # Step 1: Research
    research_result = await research_agent.run(
        f'Research: {topic}',
        deps=deps,
        usage=usage
    )
    research = research_result.output

    # Step 2: Analysis (with context from research)
    analysis_result = await analysis_agent.run(
        f'Analyze this research: {research.summary}',
        deps=deps,
        message_history=research_result.new_messages(),
        usage=usage
    )
    analysis = analysis_result.output

    # Step 3: Generate conclusion (application logic)
    conclusion = f"Based on {len(research.sources)} sources, {analysis.recommendations[0]}"

    return {
        'research': research,
        'analysis': analysis,
        'conclusion': conclusion,
        'total_usage': usage
    }
```

---

### Pattern 4: Agent with State/Dependencies

Example showing complex state management:

```python
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext, ModelRetry
from dataclasses import dataclass, field
from typing import Optional
import asyncio

# Complex state
@dataclass
class ConversationState:
    user_id: int
    session_id: str
    conversation_history: list[dict] = field(default_factory=list)
    user_profile: Optional[dict] = None
    context_data: dict = field(default_factory=dict)

@dataclass
class ServiceDeps:
    database: 'DatabaseConnection'
    cache: 'CacheService'
    state: ConversationState

# Output
class AssistantResponse(BaseModel):
    message: str
    suggested_actions: list[str]
    updated_context: dict

# Create agent
assistant_agent = Agent[ServiceDeps, AssistantResponse](
    'openai:gpt-5',
    deps_type=ServiceDeps,
    output_type=AssistantResponse,
    retries=2
)

# Dynamic instructions with state
@assistant_agent.instructions
async def personalized_instructions(ctx: RunContext[ServiceDeps]) -> str:
    """Generate personalized instructions based on user profile."""
    # Lazy load user profile
    if ctx.deps.state.user_profile is None:
        profile = await ctx.deps.database.get_user_profile(
            ctx.deps.state.user_id
        )
        ctx.deps.state.user_profile = profile

    profile = ctx.deps.state.user_profile
    return f"""
    You are assisting {profile['name']}.
    User preferences: {profile['preferences']}
    Previous interactions: {len(ctx.deps.state.conversation_history)}
    """

# Tools with state access
@assistant_agent.tool
async def retrieve_context(
    ctx: RunContext[ServiceDeps],
    key: str
) -> Optional[str]:
    """Retrieve context data from current session."""
    # Check in-memory state first
    if key in ctx.deps.state.context_data:
        return ctx.deps.state.context_data[key]

    # Fall back to cache
    cached = await ctx.deps.cache.get(
        f"session:{ctx.deps.state.session_id}:{key}"
    )
    if cached:
        ctx.deps.state.context_data[key] = cached
        return cached

    raise ModelRetry(f'No context found for key: {key}')

@assistant_agent.tool
async def store_context(
    ctx: RunContext[ServiceDeps],
    key: str,
    value: str
) -> str:
    """Store context data for current session."""
    # Update in-memory state
    ctx.deps.state.context_data[key] = value

    # Persist to cache
    await ctx.deps.cache.set(
        f"session:{ctx.deps.state.session_id}:{key}",
        value,
        ttl=3600
    )

    return f"Stored {key}"

@assistant_agent.tool
async def search_history(
    ctx: RunContext[ServiceDeps],
    query: str
) -> list[dict]:
    """Search conversation history."""
    history = ctx.deps.state.conversation_history

    # Simple keyword search
    results = [
        msg for msg in history
        if query.lower() in msg['content'].lower()
    ]

    return results[:5]  # Top 5 results

# Validation with state updates
@assistant_agent.output_validator
async def update_state(
    ctx: RunContext[ServiceDeps],
    output: AssistantResponse
) -> AssistantResponse:
    """Update state with response and validate."""
    # Update context from response
    ctx.deps.state.context_data.update(output.updated_context)

    # Ensure response quality
    if len(output.message) < 10:
        raise ModelRetry('Response too short, please elaborate.')

    return output

# Usage
async def chat(user_id: int, session_id: str, message: str) -> AssistantResponse:
    """Handle a chat interaction with state management."""
    # Initialize dependencies with state
    state = ConversationState(
        user_id=user_id,
        session_id=session_id
    )

    # Load previous conversation from database
    state.conversation_history = await database.load_history(session_id)

    deps = ServiceDeps(
        database=get_database(),
        cache=get_cache(),
        state=state
    )

    # Build message history from state
    message_history = [
        msg for msg in state.conversation_history
    ]

    # Run agent
    result = await assistant_agent.run(
        message,
        deps=deps,
        message_history=message_history if message_history else None
    )

    response = result.output

    # Save conversation update
    new_messages = result.new_messages()
    await database.append_history(session_id, new_messages)

    # Update state in cache
    await cache.set(
        f"state:{session_id}",
        state.context_data,
        ttl=3600
    )

    return response

# Session manager
class SessionManager:
    """Manage multiple concurrent sessions."""

    def __init__(self):
        self.sessions: dict[str, ServiceDeps] = {}

    async def get_or_create(
        self,
        user_id: int,
        session_id: str
    ) -> ServiceDeps:
        """Get existing session or create new one."""
        if session_id in self.sessions:
            return self.sessions[session_id]

        state = ConversationState(
            user_id=user_id,
            session_id=session_id
        )

        # Load history
        state.conversation_history = await database.load_history(session_id)

        deps = ServiceDeps(
            database=get_database(),
            cache=get_cache(),
            state=state
        )

        self.sessions[session_id] = deps
        return deps

    async def cleanup(self, session_id: str):
        """Clean up session resources."""
        if session_id in self.sessions:
            deps = self.sessions[session_id]
            # Persist state
            await cache.set(
                f"state:{session_id}",
                deps.state.context_data,
                ttl=3600
            )
            del self.sessions[session_id]
```

---

## Mapping Julia Concepts to PydanticAI

Based on the lecture analysis, here's how Julia patterns map to PydanticAI:

| Julia Concept | PydanticAI Equivalent | Notes |
|---------------|----------------------|--------|
| **Structs** | `pydantic.BaseModel` or `@dataclass` | Pydantic preferred for validation |
| `mutable struct` | Pydantic model with mutable fields or dataclass | Use for dependencies |
| `@enum` | `enum.Enum` or `Literal` | Literal preferred in Pydantic models |
| `Union{T, Nothing}` | `Optional[T]` | Type-safe nullability |
| `Vector{T}` | `list[T]` | Python 3.9+ type hints |
| `Dict{K, V}` | `dict[K, V]` | Python 3.9+ type hints |
| **Multiple Dispatch** | Type hints + Pydantic validation | Not identical but serves similar validation purpose |
| **Function Tools** | `@agent.tool` decorator | Automatic schema generation from signatures |
| Tool parameters | Function parameters with type hints | Docstrings → schema descriptions |
| **Type Annotations** | Python type hints | `::Type` → `: Type` |
| **Parametric Types** | `Generic[T]` from typing | Agent is `Generic[DepsType, OutputType]` |
| **HTTP.jl** | `httpx` library | Async-first, similar API |
| **JSON3** | `json` standard library or `pydantic.parse_obj` | Pydantic for validation |
| **DataFrames.jl** | `pandas` | Similar tabular operations |
| **Graphs.jl** | `networkx` | See mapping table below |
| **Agents.jl (ABM)** | `mesa` | See ABM mapping table below |
| **State Management** | `RunContext[DepsType]` | Dependency injection pattern |
| Global GRAPHS dict | Dependencies with dict field | Inject via RunContext |
| **String Interpolation** | f-strings | `$var` → `f"{var}"` |
| Triple-quoted strings | Triple-quoted strings | Compatible |
| **Async/Await** | `asyncio` | `@async` → `async def`, `await` |
| `@sync` | `asyncio.gather()` | Parallel execution |
| **Concurrency** | `asyncio`, `concurrent.futures` | Task-based concurrency |

### Graphs.jl → NetworkX Mapping

| Graphs.jl | NetworkX | Notes |
|-----------|----------|-------|
| `SimpleGraph()` | `nx.Graph()` | Undirected graph |
| `SimpleDiGraph()` | `nx.DiGraph()` | Directed graph |
| `add_edge!(g, u, v)` | `g.add_edge(u, v)` | Add edge |
| `add_vertex!(g)` | `g.add_node(n)` | Add node |
| `nv(g)` | `len(g.nodes())` | Number of vertices |
| `ne(g)` | `len(g.edges())` | Number of edges |
| `neighbors(g, v)` | `list(g.neighbors(v))` | Node neighbors |
| `degree(g, v)` | `g.degree(v)` | Node degree |
| `complete_graph(n)` | `nx.complete_graph(n)` | Complete graph |
| `cycle_graph(n)` | `nx.cycle_graph(n)` | Cycle graph |
| `watts_strogatz(n, k, p)` | `nx.watts_strogatz_graph(n, k, p)` | Small-world |
| `barabasi_albert(n, k)` | `nx.barabasi_albert_graph(n, k)` | Scale-free |
| `betweenness_centrality(g)` | `nx.betweenness_centrality(g)` | Centrality |
| `dijkstra_shortest_paths(g, s)` | `nx.shortest_path(g, s)` | Shortest paths |
| `density(g)` | `nx.density(g)` | Graph density |
| `global_clustering_coefficient(g)` | `nx.average_clustering(g)` | Clustering |

### Agents.jl → Mesa Mapping

| Agents.jl | Mesa | Notes |
|-----------|------|-------|
| `@agent struct` | `class MyAgent(Agent)` | Agent definition |
| `StandardABM` | `class MyModel(Model)` | Model class |
| `add_agent!(model)` | `agent = MyAgent(...); model.schedule.add(agent)` | Add agent |
| `agent_step!(agent, model)` | `def step(self)` method | Agent step |
| `model_step!(model)` | `def step(self)` on Model | Model step |
| `run!(model, n)` | `for i in range(n): model.step()` | Run simulation |
| `nearby_ids(agent, model)` | Network/space methods | Neighbor access |
| GraphAgent | Mesa agent + NetworkX | Graph-based agents |
| Properties dict | Model attributes | Model parameters |
| Data collection | `DataCollector` | Metrics collection |

---

## Best Practices

### 1. Agent Design

**Reuse Agents**: Create agents once (typically as module globals) and reuse throughout your application:
```python
# Good: Module-level agent
weather_agent = Agent('openai:gpt-5', deps_type=Deps)

async def get_weather(location: str, deps: Deps):
    return await weather_agent.run(location, deps=deps)
```

**Prefer Instructions Over System Prompts**: Use instructions for agent-specific behavior:
```python
# Good: Instructions
agent = Agent('openai:gpt-5', instructions='Be concise.')

# Use system_prompt only when needed across multiple agents
```

**Type Safety**: Always specify dependency and output types:
```python
# Good: Type-safe
agent = Agent[AppDeps, UserProfile]('openai:gpt-5', deps_type=AppDeps, output_type=UserProfile)

# Avoid: No types
agent = Agent('openai:gpt-5')
```

### 2. Tool Design

**Descriptive Docstrings**: Write clear docstrings for automatic schema generation:
```python
@agent.tool
async def search_products(
    ctx: RunContext[Deps],
    query: str,
    category: Optional[str] = None,
    max_results: int = 10
) -> list[dict]:
    """
    Search for products in the catalog.

    Args:
        query: Search keywords or product name
        category: Optional category filter (electronics, clothing, etc.)
        max_results: Maximum number of results to return (1-50)

    Returns:
        List of product dictionaries with name, price, and description
    """
```

**Tool Retries**: Configure retries for unreliable operations:
```python
@agent.tool(retries=3)
async def call_external_api(ctx: RunContext[Deps], query: str) -> dict:
    """Call external API with automatic retries."""
```

**Use ModelRetry**: Signal the model when inputs need correction:
```python
@agent.tool
def lookup_user(ctx: RunContext[Deps], user_id: int) -> dict:
    """Look up user by ID."""
    user = ctx.deps.database.get(user_id)
    if user is None:
        raise ModelRetry(f'User {user_id} not found. Please verify the ID.')
    return user
```

### 3. Structured Outputs

**Always Use Pydantic Models**: For complex outputs, use Pydantic for validation:
```python
class Analysis(BaseModel):
    sentiment: Literal['positive', 'negative', 'neutral']
    confidence: float = Field(ge=0.0, le=1.0)
    entities: list[str]

agent = Agent('openai:gpt-5', output_type=Analysis)
```

**Validation**: Add output validators for business logic:
```python
@agent.output_validator
async def validate_output(ctx: RunContext[Deps], output: Analysis) -> Analysis:
    if output.confidence < 0.6:
        raise ModelRetry('Confidence too low.')
    return output
```

### 4. Dependencies

**Use Dataclasses**: Organize dependencies in dataclasses:
```python
@dataclass
class AppDeps:
    database: DatabaseConnection
    cache: CacheService
    api_key: str
    user_id: int
```

**Dependency Injection**: Pass everything through deps rather than globals:
```python
# Good
@agent.tool
async def fetch_data(ctx: RunContext[AppDeps]) -> dict:
    return await ctx.deps.database.query(...)

# Avoid global state
global_db = Database()  # Don't do this
```

**Testing with Overrides**: Use `agent.override()` for testing:
```python
with agent.override(deps=test_deps, model=TestModel()):
    result = await agent.run('test')
```

### 5. Error Handling

**Set Usage Limits**: Always set limits to prevent runaway costs:
```python
result = agent.run_sync(
    prompt,
    usage_limits=UsageLimits(
        request_limit=10,
        response_tokens_limit=5000,
        tool_calls_limit=20
    )
)
```

**HTTP Retries**: Use retry transports in production:
```python
from pydantic_ai.retries import AsyncTenacityTransport, RetryConfig

transport = AsyncTenacityTransport(
    config=RetryConfig(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, max=60),
        reraise=True
    )
)
client = httpx.AsyncClient(transport=transport)
```

**Capture Messages on Errors**: Debug failures by capturing message history:
```python
from pydantic_ai import capture_run_messages

with capture_run_messages() as messages:
    try:
        result = await agent.run(prompt)
    except Exception as e:
        logger.error(f"Error: {e}, Messages: {messages}")
```

### 6. Multi-Agent Systems

**Aggregate Usage**: Pass usage context when delegating:
```python
@main_agent.tool
async def delegate_task(ctx: RunContext[Deps], task: str) -> str:
    result = await specialist_agent.run(
        task,
        deps=ctx.deps,
        usage=ctx.usage  # Aggregate usage tracking
    )
    return result.output
```

**Message History**: Maintain context across agents:
```python
result1 = await agent1.run('First query')
result2 = await agent2.run(
    'Follow up',
    message_history=result1.new_messages()
)
```

### 7. Production Deployment

**Environment Variables**: Use environment variables for API keys:
```bash
export OPENAI_API_KEY='your-key'
export ANTHROPIC_API_KEY='your-key'
```

**Async Preferred**: Use async methods for better concurrency:
```python
# Preferred
result = await agent.run(prompt, deps=deps)

# Only use sync when necessary
result = agent.run_sync(prompt, deps=deps)
```

**Monitoring**: Integrate with Pydantic Logfire for observability:
```python
import logfire

logfire.configure()
# Automatic instrumentation of PydanticAI agents
```

---

## Common Pitfalls

### 1. Type Checking Issues

**Problem**: Union types and lists require special handling with type checkers.

```python
# May require type: ignore with some type checkers
agent = Agent[None, Foo | Bar]('openai:gpt-5', output_type=Foo | Bar)  # type: ignore
```

**Solution**: Use explicit generic parameters or conditional types where needed.

### 2. Message History Management

**Problem**: Forgetting that system prompts aren't regenerated when `message_history` is provided.

```python
# First run - system prompt generated
result1 = agent.run_sync('Hello')

# Second run - NO new system prompt
result2 = agent.run_sync('Continue', message_history=result1.new_messages())
```

**Solution**: Be aware of this behavior or use `all_messages()` to include original system prompt.

### 3. Tool Call/Return Pairing

**Problem**: Breaking tool call/return pairs when slicing message history.

```python
# Bad: May break tool pairs
messages = result.all_messages()[::2]  # Every other message

# Good: Keep recent messages intact
messages = result.all_messages()[-20:]
```

**Solution**: When filtering history, ensure tool calls and their returns stay together.

### 4. Dependency Mutability

**Problem**: Mutating shared dependencies across concurrent requests.

```python
# Dangerous with concurrent requests
shared_deps = AppDeps(state={})

await asyncio.gather(
    agent.run('Query 1', deps=shared_deps),  # Both modify shared_deps.state
    agent.run('Query 2', deps=shared_deps)
)
```

**Solution**: Create separate dependency instances per request or use thread-safe state management.

### 5. Forgetting Usage Limits

**Problem**: No limits can lead to infinite loops with multi-tool agents.

```python
# Risky: No limits
agent = Agent('openai:gpt-5')
result = agent.run_sync(prompt)  # Could loop forever
```

**Solution**: Always set usage limits, especially with multiple tools:
```python
result = agent.run_sync(
    prompt,
    usage_limits=UsageLimits(request_limit=10, tool_calls_limit=20)
)
```

### 6. Testing Without Mocks

**Problem**: Accidentally calling real LLM APIs during tests.

```python
# Bad: Real API calls in tests
async def test_agent():
    result = await agent.run('test')  # Costs money!
```

**Solution**: Always override with test models:
```python
async def test_agent():
    with agent.override(model=TestModel()):
        result = await agent.run('test')  # Free!
```

Set environment variable to prevent accidental API calls:
```python
import os
os.environ['ALLOW_MODEL_REQUESTS'] = 'False'
```

### 7. Ignoring Stream Deltas

**Problem**: Using `stream_text(delta=True)` means final result won't include complete text.

```python
async with agent.run_stream(prompt) as result:
    async for text in result.stream_text(delta=True):
        print(text)  # Only prints changes

    # result.output may not have complete text!
```

**Solution**: Either use `delta=False` or accumulate text yourself if you need the complete output.

### 8. Over-Engineering Multi-Agent Systems

**Problem**: Creating complex multi-agent hierarchies when a single agent would suffice.

```python
# Over-engineered
coordinator → planner → researcher → analyst → formatter
```

**Solution**: Start simple, add agents only when there's clear benefit:
```python
# Often sufficient
single_agent with multiple tools
```

---

## References

### Documentation Pages Consulted

1. **Core Concepts**
   - [Agents](https://ai.pydantic.dev/agents/index.md) - Agent creation, configuration, and execution
   - [Function Tools](https://ai.pydantic.dev/tools/index.md) - Tool registration and schema generation
   - [Dependencies](https://ai.pydantic.dev/dependencies/index.md) - RunContext and dependency injection
   - [Structured Outputs](https://ai.pydantic.dev/output/index.md) - Pydantic models and validation
   - [Advanced Tool Features](https://ai.pydantic.dev/tools-advanced/index.md) - Retries, prepare methods, metadata

2. **Multi-Agent Systems**
   - [Agent2Agent (A2A)](https://ai.pydantic.dev/a2a/index.md) - A2A protocol for agent communication
   - [Multi-Agent Patterns](https://ai.pydantic.dev/multi-agent-applications/index.md) - Delegation and hand-off patterns
   - [Message History](https://ai.pydantic.dev/message-history/index.md) - Conversation management

3. **Production Features**
   - [HTTP Request Retries](https://ai.pydantic.dev/retries/index.md) - Retry configuration and error handling
   - [Testing](https://ai.pydantic.dev/testing/index.md) - TestModel, FunctionModel, mocking
   - [Models: OpenAI](https://ai.pydantic.dev/models/openai/index.md) - OpenAI integration

4. **Tool Organization**
   - [Toolsets](https://ai.pydantic.dev/toolsets/index.md) - Tool collections and composition
   - [Common Tools](https://ai.pydantic.dev/common-tools/index.md) - Built-in tools (DuckDuckGo, Tavily)

5. **Examples**
   - [Weather Agent](https://ai.pydantic.dev/examples/weather-agent/index.md) - Basic tool integration
   - [Bank Support](https://ai.pydantic.dev/examples/bank-support/index.md) - State management and structured outputs

6. **Introduction**
   - [Pydantic AI Overview](https://ai.pydantic.dev/index.md) - Core philosophy and design principles

### Related Resources

- **PydanticAI GitHub**: https://github.com/pydantic/pydantic-ai
- **Pydantic Documentation**: https://docs.pydantic.dev/
- **Pydantic Logfire**: https://docs.pydantic.dev/logfire/ (monitoring)
- **FastAPI** (similar design philosophy): https://fastapi.tiangolo.com/

### Python Libraries Referenced

- **httpx**: Async HTTP client - https://www.python-httpx.org/
- **tenacity**: Retry library - https://github.com/jd/tenacity
- **pytest**: Testing framework - https://pytest.org/
- **NetworkX**: Graph algorithms - https://networkx.org/
- **Mesa**: Agent-based modeling - https://mesa.readthedocs.io/
- **pandas**: Data manipulation - https://pandas.pydata.org/

---

## Additional Notes for Course Migration

### Key Differences from Course Content

1. **No Direct Julia Equivalent**: PydanticAI is Python-first, so Julia examples need complete rewrites, not translations
2. **Automatic Schema Generation**: PydanticAI eliminates manual JSON schema creation (major simplification vs course Week A2.01)
3. **Type Safety**: Much stronger type checking than typical Python code shown in current lectures
4. **Dependencies vs Global State**: Course uses global dicts (e.g., `GRAPHS = {}`), PydanticAI uses dependency injection

### Migration Strategy Recommendations

1. **Week A02 (Agent Fundamentals)**
   - Replace manual JSON schema definitions with `@agent.tool` decorators
   - Convert global GRAPHS dict to dependency injection
   - Show automatic schema generation from docstrings
   - Demonstrate type-safe structured outputs

2. **Week A03 (Multi-Agent Systems)**
   - Use delegation pattern for swarm infrastructure
   - NetworkX for graph topologies (straightforward replacement)
   - Dependencies for agent state and memory
   - Message history for conversation tracking

3. **Week A04 (Production)**
   - Built-in retry configuration replaces manual implementation
   - Usage limits prevent infinite loops
   - TestModel for deterministic testing
   - Dependency override for test fixtures

### Features to Emphasize

1. **Type Safety**: Catches errors before runtime
2. **Automatic Validation**: Pydantic models ensure correctness
3. **Simplified Tool Definition**: No manual JSON schemas
4. **Production Ready**: Built-in retries, limits, monitoring
5. **Testing Support**: TestModel, FunctionModel, overrides
6. **Model Agnostic**: Easy to switch between OpenAI, Anthropic, etc.

### Topics Requiring Custom Implementation

Some course topics don't have direct PydanticAI equivalents and need custom code:

1. **Game Theory** (Week A3.02): Use nashpy or custom implementation
2. **Agent-Based Modeling** (Week A3.03): Use Mesa framework
3. **Swarm Topologies** (Week A3.01): NetworkX + custom swarm manager
4. **Constitutional AI** (Week A4.02): Custom implementation with output validators

These can be integrated with PydanticAI agents but require additional libraries or custom logic.

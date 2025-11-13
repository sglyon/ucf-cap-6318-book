# AI and Agentic Systems Lecture Series

This 4-week module extends CAP-6318's computational analysis of social complexity into the realm of artificial intelligence and multi-agent systems. Building on the course's foundation in networks, game theory, and agent-based models, we explore how modern AI systems—particularly Large Language Models (LLMs) and agentic architectures—create new forms of social and economic complexity. Students will learn to design, implement, and analyze AI agents that can reason, collaborate, and solve complex problems in distributed environments.

## Week A1: Foundations of AI Agents and LLMs

We begin by establishing the conceptual and technical foundations for understanding AI agents in complex systems. This week bridges the course's existing ABM framework to modern AI agents powered by neural networks and language models.

**Assignment:** Implement a simple LLM-powered agent that can play one of the games from Week 8-9, comparing its behavior to traditional game-theoretic predictions.

### Lecture A1.01: From Rule-Based to Learning Agents

**Prerequisites:** Agent-Based Models (Weeks 6-7), Basic Julia programming

**Learning Outcomes:**
- Distinguish between rule-based agents (traditional ABMs) and learning agents
- Understand how LLMs function as general-purpose reasoning engines
- Implement basic LLM API calls in Julia
- Compare emergent behaviors of AI agents vs. programmed agents

**Topics:**
1. **Evolution of Agent Architectures**
   - Review: Schelling model and rule-based agents
   - Introduction to neural agents: from fixed rules to learned behaviors
   - LLMs as universal function approximators for text

2. **Understanding Modern LLMs**
   - Transformer architecture intuition (attention mechanisms)
   - Prompting as programming: instruction following vs. traditional code
   - Temperature, tokens, and stochastic outputs
   - The "context window" as agent memory

3. **Hands-On: Your First AI Agent**
   - Setting up OpenAI/Anthropic API access
   - Julia HTTP client for API calls
   - Building a simple conversational agent
   - Parsing and handling structured outputs

4. **Emergent Capabilities**
   - In-context learning without weight updates
   - Chain-of-thought reasoning
   - Tool use and function calling
   - Comparison to emergence in traditional ABMs

### Lecture A1.02: The RAG Pattern - Augmenting AI with External Knowledge

**Prerequisites:** L.A1.01, Basic understanding of vector spaces

**Learning Outcomes:**
- Implement a Retrieval-Augmented Generation (RAG) system
- Understand embeddings and vector similarity search
- Design knowledge bases for domain-specific AI agents
- Analyze the trade-offs between parametric and retrieval-based knowledge

**Topics:**
1. **The Knowledge Problem**
   - LLM knowledge cutoffs and hallucination
   - Static vs. dynamic knowledge requirements
   - Connection to network information flow (Week 3-4)

2. **Embeddings and Vector Databases**
   - Text embeddings as semantic representations
   - Cosine similarity and nearest neighbor search
   - Vector databases: architecture and operations
   - Julia implementation using DuckDB or similar

3. **Building a RAG Pipeline**
   - Document chunking strategies
   - Embedding generation and storage
   - Query expansion and reranking
   - Context injection and prompt engineering

4. **Application: Network Analysis Assistant**
   - Create embeddings for academic papers on networks
   - Build an AI that can answer questions about graph theory
   - Compare to traditional search methods
   - Evaluate accuracy and relevance

### Lecture A1.03: Multi-Agent Conversations and Emergent Collaboration

**Prerequisites:** L.A1.01, Game Theory basics (Week 8)

**Learning Outcomes:**
- Design multi-agent conversation systems
- Implement agent coordination patterns
- Analyze emergent behaviors in AI agent groups
- Apply game-theoretic concepts to AI agent interactions

**Topics:**
1. **Agent Communication Protocols**
   - Message passing between AI agents
   - Structured vs. natural language communication
   - Turn-taking and conversation management
   - Connection to network communication patterns

2. **Coordination Without Central Control**
   - Implementing Microsoft AutoGen patterns in Julia
   - Role-based agent design (Planner, Executor, Critic)
   - Consensus mechanisms for AI agents
   - Emergence of leadership and specialization

3. **Collaborative Problem Solving**
   - Debate and discussion formats
   - Voting and aggregation mechanisms
   - Handling disagreement and conflict resolution
   - Connection to social choice theory

4. **Case Study: Disaster Response Team**
   - Building on student suggestion: Google ADK-style simulation
   - Multiple specialized agents (logistics, medical, communication)
   - Emergent coordination during crisis scenarios
   - Comparison to centralized planning

---

## Week A2: Agentic Workflows and Tool Integration

This week focuses on making AI agents capable of taking actions in the real world through tool use and workflow orchestration. We connect to the course's emphasis on networks and system interactions. We use PydanticAI—a minimalist, type-safe framework from the creators of Pydantic—to learn production-ready patterns for building AI agents.

**Note on Implementation:** This week's lectures use Python and PydanticAI directly (rather than Julia) to leverage the mature ecosystem and demonstrate industry-standard patterns. The principles covered (type safety, validation-first development, dependency injection) are language-agnostic and can be adapted to any production system.

**Assignment:** Build a multi-agent system that can analyze a social network dataset, identify influential nodes using methods from Week 3-5, and generate a report with visualizations.

### Lecture A2.01: Function Calling and Tool Use

**Prerequisites:** L.A1.01 (LLMs and API calls), L.A1.02 (RAG systems), Graph theory/Network Science (Week 3-5)

**Learning Outcomes:**
- Implement function calling with modern LLM APIs
- Design JSON schemas for tool definitions
- Build agents that execute code and analyze computational results
- Create a network analysis toolkit accessible to AI agents

**Topics:**
1. **From Conversation to Computation**
   - Limitations of text-only agents
   - The basic pattern: define tools → agent decides → execute → return results
   - Why function calling beats code-in-prompt approaches
   - Importance for computational social science

2. **JSON Schemas: Defining Tool Interfaces**
   - Manual JSON schema format and structure
   - Anatomy of tool definitions (name, description, parameters)
   - PydanticAI's automatic schema generation from docstrings
   - Using the `@agent.tool` decorator pattern

3. **Building Function-Calling Agents**
   - Calculator agent example with PydanticAI
   - Multi-turn conversations and tool chaining
   - Model-agnostic design (OpenAI, Anthropic, Google)
   - Understanding tool call execution flow

4. **Network Analysis Toolkit**
   - Exposing NetworkX functions to AI agents (Python implementation)
   - Dependency injection pattern with RunContext
   - Creating networks, calculating centrality, finding paths
   - Multi-step analysis with multiple tool calls

5. **Safety and Sandboxing**
   - Dangers of unrestricted tool use
   - Safe tool design patterns (read-only, explicit boundaries, confirmation)
   - Code execution risks and mitigation strategies
   - Security analysis of network analysis tools

### Lecture A2.02: Type-Safe Agent Development with PydanticAI Patterns

**Prerequisites:** L.A2.01 (Function calling concepts), Python type hints and type safety, Basic agent architectures

**Learning Outcomes:**
- Understand type-safe agent development principles
- Implement validation-first agent architectures with Pydantic
- Apply dependency injection patterns for testable agents
- Build production-ready AI agents with PydanticAI

**Topics:**
1. **Why Type Safety Matters**
   - The problem: unvalidated agent systems and runtime failures
   - Benefits: fail fast, self-documenting code, refactoring confidence
   - Concrete examples comparing unvalidated vs type-safe approaches

2. **The PydanticAI Philosophy**
   - What is PydanticAI and why it was created
   - "Chef's knife and cutting board" - minimalist toolkit approach
   - Core principles: type safety first, validation before computation, dependency injection, explicit over implicit
   - Comparison with LangChain (when to use each)

3. **Core Agent Components**
   - Agent definition (model, system prompt)
   - Tool functions with `@agent.tool` decorator
   - Structured outputs using Pydantic BaseModel
   - RunContext for dependency injection

4. **Building a Research Assistant**
   - Define output structures (Paper, ResearchSummary models with Field validation)
   - Define dependencies using dataclasses
   - Create agent with typed dependencies and outputs
   - Register tools: search_papers, get_paper_details
   - Run agent and analyze results
   - Dynamic system prompts based on context

5. **Production-Ready Patterns**
   - Why this pattern scales (type safety, separation of concerns, composability)
   - Observability with Logfire integration
   - Key takeaways and quick reference guide

### Lecture A2.03: Evaluating AI Systems

**Prerequisites:** Pydantic AI Agents and Tools, Python programming fundamentals, Basic understanding of testing concepts

**Learning Outcomes:**
- Understand why systematic evaluation is critical for AI systems
- Identify when and what to evaluate in AI agents
- Implement deterministic and LLM-based evaluators
- Design evaluation datasets using code-first approaches
- Analyze and compare evaluation results across experiments
- Connect evaluation practices to production deployment concerns

**Topics:**
1. **Introduction: The AI Testing Problem**
   - Why testing AI is different from traditional software
   - Non-deterministic outputs and the challenge
   - Motivating scenario: The Support Bot Problem
   - Overview of Pydantic Evals framework

2. **Core Concepts: The Evaluation Framework**
   - Cases: Individual test scenarios
   - Datasets: Collections of test cases
   - Experiments: Evaluation runs
   - Example: Simple support bot intent classification dataset

3. **Evaluators: How to Score Outputs**
   - Two types: Deterministic vs Non-Deterministic
   - Built-in evaluators: EqualsExpected, IsInstance, Contains, MaxDuration
   - LLM as Judge: When correctness is subjective
   - Custom evaluators for domain-specific checks
   - Adding evaluators to datasets

4. **Running Evaluations: From Code to Reports**
   - Defining task functions
   - Running experiments with evaluate()
   - Analyzing results programmatically
   - Visualizing results with Logfire
   - Comparing experiments to track improvements

5. **Advanced Topics**
   - Span-based evaluation: evaluating the process, not just output
   - HasMatchingSpan evaluator for tool usage validation
   - Generating datasets with LLMs
   - RAG-specific evaluation (retrieval and generation metrics)
   - PrecisionAtK, RecallAtK, and Faithfulness metrics

6. **Integration and Best Practices**
   - When to use each evaluation type
   - Tips for effective evaluation (start small, balance coverage, make evaluators specific)
   - Version control for datasets
   - Automating evaluations in CI/CD
   - Connections to course themes: game theory, networks, emergence

---

## Week A3: Complex Agent Systems and Emergence

We explore how collections of AI agents create complex adaptive systems, connecting to the course's themes of emergence, network effects, and strategic interaction.

**Assignment:** Design and implement a market simulation where AI agents trade resources, demonstrating emergent price discovery and market dynamics. Compare to equilibrium predictions from economic theory.

### Lecture A3.01: AI Agent Swarms and Collective Intelligence

**Prerequisites:** ABMs (Week 6-7), Network theory (Week 3-4)

**Learning Outcomes:**
- Design swarm intelligence systems with AI agents
- Implement distributed problem-solving algorithms
- Analyze emergent behaviors in large agent populations
- Apply network science to agent communication patterns

**Topics:**
1. **From Individual to Collective**
   - Scaling from single agents to swarms
   - Communication topologies: fully connected, small world, scale-free
   - Information propagation in agent networks
   - Consensus and divergence dynamics

2. **Distributed Problem Solving**
   - Parallel hypothesis generation and testing
   - Genetic algorithm patterns with AI agents
   - Collaborative filtering and recommendation
   - Connection to wisdom of crowds

3. **Emergent Specialization**
   - Division of labor without central assignment
   - Skill development through reinforcement
   - Market-based task allocation
   - Comparison to biological swarms

4. **Case Study: Scientific Discovery Swarm**
   - Agents specialized in different research methods
   - Collaborative paper analysis and synthesis
   - Hypothesis generation and testing
   - Emergent research directions

### Lecture A3.02: Game Theory with AI Agents

**Prerequisites:** Game Theory (Week 8-9), L.A1.01

**Learning Outcomes:**
- Implement game-playing AI agents
- Analyze how LLMs learn strategic behavior
- Design mechanisms for AI agent markets
- Understand AI safety through game-theoretic lens

**Topics:**
1. **LLMs as Strategic Players**
   - Teaching games through prompting
   - In-context strategy learning
   - Comparison to Nash equilibrium predictions
   - Bounded rationality in AI agents

2. **Mechanism Design for AI Systems**
   - Auction mechanisms for computational resources
   - Incentive alignment in multi-agent systems
   - Truth-telling and strategic manipulation
   - Connection to blockchain smart contracts

3. **Cooperative AI**
   - Prisoner's dilemma with AI agents
   - Reputation systems and repeated games
   - Coalition formation and stability
   - Bargaining and negotiation protocols

4. **AI Safety as Game Theory**
   - Alignment as principal-agent problem
   - Reward hacking and specification gaming
   - Multi-stakeholder AI governance
   - Connection to social choice theory

### Lecture A3.03: Digital Twins and Simulation

**Prerequisites:** Production networks (Week 5), ABMs

**Learning Outcomes:**
- Build digital twin systems with AI agents
- Implement predictive simulation environments
- Calibrate agent models from real data
- Design intervention experiments

**Topics:**
1. **Digital Twin Architecture**
   - Physical system modeling with AI agents
   - Real-time data synchronization
   - Predictive simulation capabilities
   - Connection to production networks

2. **Social System Simulation**
   - Modeling human behavior with AI agents
   - Calibration from social media data
   - Policy intervention testing
   - Validation against real outcomes

3. **Economic Digital Twins**
   - Market microstructure simulation
   - Supply chain dynamics with AI agents
   - Macro-economic agent models
   - Connection to input-output analysis

4. **Case Study: Urban Mobility Twin**
   - Traffic flow with AI driver agents
   - Public transit optimization
   - Emergency response simulation
   - Comparison to Braess' paradox

---

## Week A4: Applications and Future Directions

The final week focuses on cutting-edge applications and prepares students for the rapidly evolving landscape of AI agents in production systems.

**Assignment:** Final project - Design and implement an AI agent system addressing a real-world complex systems problem. Present findings including emergent behaviors, performance metrics, and scaling considerations.

### Lecture A4.01: Agentic Systems in Production

**Prerequisites:** All previous lectures

**Learning Outcomes:**
- Understand production deployment of agent systems
- Implement monitoring and evaluation frameworks
- Design for reliability and fault tolerance
- Analyze real-world case studies

**Topics:**
1. **Production Architecture**
   - Microservices vs. monolithic agents
   - Message queues and event streaming
   - State management at scale
   - Connection to distributed systems

2. **Reliability Engineering**
   - Failure modes in agent systems
   - Circuit breakers and fallbacks
   - Gradual rollouts and testing
   - Observability and debugging

3. **Case Studies from Industry**
   - GitHub Copilot Workspace: collaborative coding agents
   - Customer service automation
   - Financial trading systems
   - Healthcare decision support

4. **Performance Optimization**
   - Caching strategies for LLM calls
   - Batch processing and parallelization
   - Model selection and routing
   - Cost-performance trade-offs

### Lecture A4.02: Ethical and Safety Considerations

**Prerequisites:** Game theory, All AI lectures

**Learning Outcomes:**
- Identify safety risks in agent systems
- Implement alignment techniques
- Design oversight mechanisms
- Understand regulatory frameworks

**Topics:**
1. **AI Safety Challenges**
   - Goal misspecification and reward hacking
   - Emergent deception and manipulation
   - Power-seeking behavior
   - Connection to principal-agent problems

2. **Alignment Techniques**
   - Constitutional AI and RLHF
   - Oversight and interpretability
   - Robustness to distribution shift
   - Value learning and preference modeling

3. **Governance and Regulation**
   - Current regulatory landscape (EU AI Act, etc.)
   - Liability in agent systems
   - Audit and compliance frameworks
   - Multi-stakeholder governance models

4. **Building Responsible Systems**
   - Transparency and explainability
   - Fairness and bias mitigation
   - Privacy-preserving techniques
   - Human oversight integration

### Lecture A4.03: Future Frontiers and Research Directions

**Prerequisites:** All course content

**Learning Outcomes:**
- Identify open research problems
- Understand trajectory of field
- Connect to broader complexity science
- Prepare for continued learning

**Topics:**
1. **Emerging Capabilities**
   - Multimodal agents (vision, audio, robotics)
   - Long-term memory and learning
   - Cross-domain transfer
   - Connection to artificial general intelligence

2. **Theoretical Foundations**
   - Category theory for agent composition
   - Information theory of agent communication
   - Thermodynamics of computation
   - Connection to complex systems theory

3. **Societal Integration**
   - Human-AI collaboration patterns
   - Economic impacts and labor markets
   - Educational transformation
   - Democratic participation and governance

4. **Research Opportunities**
   - Open problems in agent systems
   - Intersection with other fields
   - Startup and industry opportunities
   - Graduate research directions

---

## Integration with Course Themes

This AI module synthesizes and extends the course's core concepts:

- **Julia Type System** (Week 2): PydanticAI's validation-first approach mirrors Julia's type system emphasis
- **Networks** (Weeks 3-5): Agent communication networks, information flow, API ecosystems
- **Game Theory** (Weeks 8-9): Strategic agent interaction, mechanism design, alignment
- **ABMs** (Weeks 6-7): From programmed to learned behaviors, emergence at scale
- **Production Networks** (Week 5): Digital twins, economic simulation
- **Blockchain** (Weeks 11-12): Decentralized agent coordination, smart contracts for agents
- **Software Engineering**: PydanticAI's minimalist philosophy aligns with Julia's "composability over complexity" principle

## Pedagogical Approach

Following the course's established pattern:
- **Julia-first**: All implementations in Julia, leveraging existing course infrastructure
- **Pattern adaptation**: Study best practices from Python frameworks (PydanticAI), implement in Julia
- **Type-safe development**: Emphasize validation and type safety following PydanticAI's philosophy
- **Progressive complexity**: Simple API calls → type-safe agents → multi-agent systems → production
- **Real-world grounding**: Industry examples, actual APIs, production considerations
- **Balance theory and practice**: Mathematical foundations with hands-on implementation
- **Interactive exploration**: Live coding, experiments, parameter sweeps
- **Minimalist approach**: Following PydanticAI's "chef's knife and cutting board" philosophy—powerful but simple tools

## Assessment Strategy

- **Weekly exercises**: Implement concepts with real APIs and data
- **Mid-module assignment**: Multi-agent system design and analysis
- **Final project**: Address a complex systems problem using AI agents
- **Participation**: Forum discussions on ethical and societal implications
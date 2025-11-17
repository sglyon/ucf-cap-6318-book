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

## Week A3: MCP Integration and Security

Building on Week A2's introduction to type-safe agents and tool use with PydanticAI, we now explore how to make AI agent tools distributed and reusable through the Model Context Protocol (MCP), then address the critical security challenges that emerge when agents have access to tools, data, and external systems. This week shifts from Julia to Python, using FastMCP for MCP servers and continuing with PydanticAI for agents.

**Note on Implementation:** This week uses Python exclusively with PydanticAI and FastMCP. When connecting to earlier course topics (networks, game theory, ABMs), we'll use the canonical Python libraries: NetworkX for network science, quantecon.game_theory for game theory, and Mesa for agent-based models.

**Assignment:** Build a secure MCP server that exposes network analysis or game theory tools from earlier in the course. Implement comprehensive security measures including input validation, rate limiting, and proper authentication. Perform a threat modeling exercise and demonstrate how your defenses prevent common attack vectors. Bonus: Integrate your MCP server with a PydanticAI agent and evaluate its security using techniques from Week A2.03.

### Lecture A3.01: Building Agent Tools with FastMCP

**Prerequisites:**
- L.A2.01 (Function calling and tool use)
- L.A2.02 (Type-safe agents with PydanticAI)
- L.A2.03 (Agent evaluations)
- Basic understanding of client-server architecture

**Learning Outcomes:**
- Understand the Model Context Protocol (MCP) and its role in the AI ecosystem
- Create MCP servers using FastMCP to expose computational tools
- Integrate MCP servers with PydanticAI agents for distributed tool access
- Deploy and test MCP servers in multiple environments (local, HTTP, Claude Desktop)
- Apply MCP patterns to course domains: network analysis, game theory, and agent-based models

**Topics:**

1. **Introduction: From Embedded Tools to Distributed Tools**
   - Review: Week A2 pattern with `@agent.tool` decorator (embedded tools)
   - The reusability problem: same tools reimplemented across applications
   - The integration challenge: tools locked into specific frameworks
   - MCP as "USB-C for AI": universal standard for connecting LLMs to capabilities
   - The three MCP primitives: Tools (functions), Resources (data), Prompts (templates)
   - Why this matters: write tools once, use with any MCP-compatible client
   - Real-world analogy: MCP servers as microservices for AI

2. **FastMCP Fundamentals**
   - What is FastMCP? Production-ready Python framework from Pydantic team
   - Core concepts: Server creation, tool decoration, automatic schema generation
   - Transport protocols: stdio (local), StreamableHTTP (remote)
   - Your first MCP server: Calculator example
   - Running servers: Direct execution vs FastMCP CLI
   - Deployment options: Local → HTTP → FastMCP Cloud

3. **Building Course-Specific MCP Servers**
   - Network Analysis MCP Server (Weeks 3-5 concepts)
     - Tools: create_network, calculate_centrality, find_shortest_path
     - Using NetworkX for graph operations
     - State management with Context
     - Type safety with Pydantic validation
   - Game Theory MCP Server (Weeks 8-9 concepts)
     - Tools: create_game, find_nash_equilibria, check_dominant_strategy
     - Using quantecon.game_theory for equilibrium computation
     - Natural language interface to game-theoretic analysis
   - Agent-Based Model Controller (Weeks 6-7 concepts)
     - Tools: create_schelling_model, step_model, get_segregation_metric
     - Using Mesa for ABM simulations
     - AI agents as computational scientists
   - Implementation patterns: Dependencies, validation, error handling

4. **Resources and Prompts**
   - MCP Resources: Read-only data access patterns
   - URI schemes and resource templates (RFC 6570)
   - Use cases: datasets, simulation results, documentation
   - Resource implementation example: Network adjacency matrices
   - MCP Prompts: Reusable message templates
   - Use cases: analysis workflows, report generation, educational scaffolding
   - Distinguishing tools vs resources vs prompts

5. **Connecting MCP Servers to PydanticAI Agents**
   - Integration architecture: Agent → MCP Client → MCP Server
   - Using FastMCP Client with PydanticAI
   - Bridging pattern: MCP tools → PydanticAI tools
   - Dynamic tool registration from MCP server schema
   - Multi-server agents: connecting to multiple MCP servers
   - Orchestration: agent decides which server to query

6. **Deployment and Integration Patterns**
   - Local development with stdio transport
   - Claude Desktop integration: `fastmcp install claude-desktop`
   - HTTP deployment for remote access
   - FastMCP Cloud: GitHub → automatic deployment
   - Testing MCP servers with pytest
   - Integration with evaluation frameworks (Week A2.03)

7. **Advanced Patterns**
   - Server composition: Import and mount patterns
   - Tool transformation: Enhanced versions without duplication
   - Proxy servers: Forward to remote MCP servers
   - Progress reporting for long-running computations
   - Security considerations (preview for A3.02)

8. **Connecting to Course Themes**
   - Network Science: Natural language interface to graph analysis
   - Game Theory: AI agents solve games and explain strategic reasoning
   - ABMs: AI agents run experiments and interpret emergence
   - Emergence at protocol level: Simple standard → rich ecosystem
   - Network effects: More MCP servers → more valuable for all clients

**References:**
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [FastMCP Documentation](https://gofastmcp.com/)
- [FastMCP GitHub Repository](https://github.com/jlowin/fastmcp)
- [Anthropic MCP Announcement](https://www.anthropic.com/news/model-context-protocol)
- [Server Examples Repository](https://github.com/modelcontextprotocol/servers)

### Lecture A3.02: Security for AI Agents - The Lethal Trifecta

**Prerequisites:**
- L.A2.01 (Function calling and tool use)
- L.A2.02 (Type-safe agents with PydanticAI)
- L.A2.03 (Evaluating AI systems)
- L.A3.01 (Model Context Protocol and MCP servers)
- Game theory (Week 8-9: strategic adversarial thinking)

**Learning Outcomes:**
- Identify the three components of "the lethal trifecta" and explain why their combination creates critical security vulnerabilities
- Analyze real-world AI agent security incidents and extract defensive lessons
- Implement validation-first security patterns using type safety and sandboxing
- Design secure tool architectures that minimize attack surfaces
- Evaluate security trade-offs in production AI agent systems
- Apply game-theoretic reasoning to adversarial AI security scenarios

**Topics:**

1. **The Wake-Up Call: When Copilot Leaked Fortune 500 Data**
   - Opening hook: Microsoft CVE-2025-32711 "EchoLeak" incident
   - Zero-click attack on M365 Copilot via malicious email
   - Automatic data exfiltration without user awareness
   - The uncomfortable truth: Every major AI system has been compromised
   - 35% of AI security incidents from simple prompts
   - OpenAI CISO: "Prompt injection remains unsolved"
   - Why students building agents need to understand this

2. **The Lethal Trifecta: Understanding the Core Vulnerability**
   - Simon Willison's three ingredients for disaster:
     1. Access to private data (Week A2: RunContext with databases)
     2. Exposure to untrusted content (RAG systems, user inputs)
     3. Ability to exfiltrate data (tools with external communication)
   - Why this combination is lethal: LLMs can't distinguish instructions from data
   - Example walkthrough: Email scanning → database access → data leak
   - Connection to game theory: Security as adversarial game
   - Attacker moves second (adapts to defenses)
   - Nash equilibrium: imperfect defenses lead to exploitation

3. **Attack Vectors: How Agents Get Compromised**
   - Direct prompt injection (relatively easy to defend)
   - Indirect prompt injection (the real danger)
     - Hidden instructions in emails, web pages, PDFs, database entries
     - GitHub MCP attack example: malicious issue hijacks agent
   - Jailbreaking and context manipulation
   - Tool abuse and confused deputy problem
   - Data poisoning and context pollution
   - Supply chain attacks via MCP servers
   - Exercises in threat modeling and attack pattern recognition

4. **Defense Mechanisms: What Actually Works**
   - The uncomfortable truth: No perfect defense exists
   - Defense-in-depth approach required
   - Architectural patterns:
     - Dual LLM / Quarantine pattern (privileged vs quarantined)
     - Spotlighting (Microsoft Research: mark untrusted content)
     - Avoiding the trifecta (don't combine all three)
     - Type safety as security (PydanticAI validation)
   - Input validation and sandboxing:
     - Tool permission models from Week A2.01
     - Code execution sandboxing (Docker, gVisor)
     - PydanticAI safety patterns with allowlisting
   - Detection and monitoring:
     - Runtime monitoring and anomaly detection
     - Prompt shields (Azure)
     - Evaluation-based detection (Week A2.03)
   - MCP-specific security:
     - Verify server sources
     - Review permissions before installation
     - User context propagation
     - Monitoring for tool definition changes

5. **Security in Production: OWASP Top 10 for LLMs**
   - OWASP LLM Top 10 (2025 edition)
   - Focus on LLM06: Excessive Agency
   - 2025 as "year of LLM agents" → unprecedented autonomy
   - Production security practices:
     - Least privilege, defense-in-depth
     - Monitoring, audit trails, incident response
     - Regular security audits
   - Cost-benefit analysis: Security has usability costs
   - Game theory: Optimal security level (not maximum)
   - Risk-based approach

6. **Game Theory of AI Security**
   - Adversarial thinking (Week 8-9 connection)
   - Security game: Defender vs Attacker
   - Sequential game: Attacker observes and adapts
   - Mixed strategies in security (randomize defenses)
   - Mechanism design for alignment
   - Principal-agent problem: delegating to AI agents
   - Exercise: Model security as game, find Nash equilibrium

7. **Case Studies: Learning from Real Incidents**
   - Microsoft 365 Copilot - EchoLeak (CVE-2025-32711)
   - GitHub MCP Server Vulnerability
   - Slack AI Data Exposure
   - ChatGPT Plugin Vulnerabilities
   - Comparative analysis: Common patterns
   - Which defenses would have prevented each?
   - Exercise: Incident response simulation

8. **Building Secure Agents: Practical Guidelines**
   - Security checklist for AI agents:
     - Design phase: Map data flows, identify trifecta, threat model
     - Implementation phase: Pydantic validation, least privilege, logging
     - Testing phase: Adversarial evaluation (Week A2.03)
     - Deployment phase: Monitoring, incident response, gradual rollout
     - MCP server phase: Verify sources, review permissions, monitor
   - When to say "no" to agentic features
   - Risk assessment framework
   - Exercises: Secure agent implementation and peer review

9. **The Future: Emerging Threats and Defenses**
   - Emerging attack vectors: Multi-modal injection, agent-to-agent attacks
   - Promising research: Formal verification, cryptographic commitments
   - The arms race: Attackers adapt, defenses improve
   - Optimism and pragmatism: Challenges are solvable enough
   - Connection to course themes: Networks, game theory, ABMs, blockchains
   - Final reflection: Build useful agents we can trust

**References:**

**Core Security Research:**
- Willison, Simon (2025). "The Lethal Trifecta." https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
- Willison, Simon (2025). "Design Patterns for Securing LLM Agents." https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/
- Willison, Simon (2025). "New Prompt Injection Papers: Agents Rule of Two and The Attacker Moves Second." https://simonwillison.net/2025/Nov/2/new-prompt-injection-papers/
- Hines, K. et al. (2024). "Defending Against Indirect Prompt Injection Attacks With Spotlighting." arXiv:2403.14720
- Microsoft Security (2025). "How Microsoft Defends Against Indirect Prompt Injection Attacks."

**OWASP and Security Standards:**
- OWASP (2025). "OWASP Top 10 for Large Language Model Applications 2025." https://owasp.org/www-project-top-10-for-large-language-model-applications/
- OWASP (2025). "LLM01:2025 Prompt Injection." https://genai.owasp.org/llm-top-10/
- Obsidian Security (2025). "Prompt Injection Attacks: The Most Common AI Exploit in 2025."

**MCP Security:**
- Model Context Protocol (2025). "Security Best Practices." https://modelcontextprotocol.io/specification/draft/basic/security_best_practices
- Red Hat (2025). "Model Context Protocol: Understanding Security Risks and Controls."
- Pillar Security (2025). "The Security Risks of Model Context Protocol."

**Real-World Incidents:**
- CVE-2025-32711: "AI Command Injection in M365 Copilot." Microsoft Security Update
- Lasso Security (2025). "Microsoft Copilot Vulnerability Exposes Fortune 500 Data."
- Fortune (2025). "Microsoft Copilot Zero-Click Attack Raises Alarms About AI Agent Security."
- TechCrunch (2025). "The Glaring Security Risks with AI Browser Agents."

**Defense Techniques:**
- Amir Malik (2025). "Code Sandboxes for LLMs and AI Agents."
- Microsoft Azure (2025). "Enhance AI Security with Azure Prompt Shields."
- Threat Model Co. "The Dual LLM Pattern for LLM Agents."
- Protect AI (2025). "A Tale of Two LLMs - Safety vs. Complexity."

**Additional Resources:**
- OWASP AI Security and Privacy Guide
- PydanticAI Documentation: Type Safety and Validation
- FastMCP Security Best Practices
- NIST AI Risk Management Framework

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

- **Julia Type System** (Week 2): PydanticAI's validation-first approach mirrors Julia's type system emphasis; type safety as security mechanism
- **Networks** (Weeks 3-5):
  - MCP servers expose network analysis tools (centrality, paths, clustering)
  - Agent communication via MCP protocol creates network ecosystems
  - Information flow and trust propagation in agent networks
  - Security as network problem: attack surfaces, trust boundaries
- **Game Theory** (Weeks 8-9):
  - Strategic agent interaction and mechanism design
  - Security as adversarial game: defender vs attacker
  - Principal-agent problem in AI alignment
  - MCP servers for game-theoretic analysis and equilibrium computation
- **ABMs** (Weeks 6-7):
  - From programmed to learned behaviors
  - MCP servers control Mesa simulations
  - AI agents as computational scientists
  - Emergent security properties in multi-agent systems
- **Production Networks** (Week 5):
  - MCP as infrastructure for distributed AI tools
  - Microservices architecture for agent capabilities
  - Supply chain security for MCP servers
- **Blockchain** (Weeks 11-12):
  - Decentralized trust models for agents
  - Smart contracts for agent coordination
  - Comparison: blockchain consensus vs agent coordination
- **Software Engineering**:
  - PydanticAI and FastMCP share minimalist philosophy
  - Type safety and validation prevent entire classes of vulnerabilities
  - Defense-in-depth mirrors layered system design

## Pedagogical Approach

Following the course's established pattern:
- **Language flexibility**: Julia for Weeks 1-9, Python for Weeks A1-A4 (leveraging best tools for each domain)
- **Pattern adaptation**: Study production frameworks (PydanticAI, FastMCP), apply patterns universally
- **Type-safe development**: Emphasize validation and type safety as foundation for correctness and security
- **Progressive complexity**:
  - Week A1: Simple LLM calls and RAG
  - Week A2: Type-safe agents with embedded tools
  - Week A3: Distributed tools via MCP + security fundamentals
  - Week A4: Production deployment and scaling
- **Real-world grounding**: Industry examples, actual APIs, security incidents, production considerations
- **Balance theory and practice**: Mathematical foundations (game theory, networks) with hands-on implementation
- **Interactive exploration**: Live coding, experiments, threat modeling exercises
- **Minimalist approach**: Powerful but simple tools (PydanticAI, FastMCP philosophy)
- **Security-first**: Address security concerns early and continuously, not as afterthought

## Assessment Strategy

- **Weekly exercises**: Implement concepts with real APIs and data
- **Mid-module assignment**: Multi-agent system design and analysis
- **Final project**: Address a complex systems problem using AI agents
- **Participation**: Forum discussions on ethical and societal implications

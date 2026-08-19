# Project 2: Agentic Systems for Computational Social Science

> Computational Analysis of Social Complexity
>
> Fall 2025, Spencer Lyon

**Due Date:** Three weeks from assignment date
**Weight:** 15% of final grade
**Team Size:** 2-3 students (assigned)

## Overview

In the first half of this course, we studied how computational models help us understand complex social phenomena. We built agent-based models where agents follow simple rules, analyzed strategic interactions using game theory, and explored network dynamics. These traditional computational methods have taught us much about social complexity.

Now, with modern AI systems, we have a new kind of agent: one that can reason, communicate, use tools, and adapt its behavior through natural language. This project asks you to explore what happens when we replace rule-based agents with LLM-powered agents in computational social science models.

Your task is to design and implement a multi-agent system that integrates AI agents with the computational methods we've studied (agent-based models, game theory, or network analysis). You'll build agents that don't just follow fixed rules—they reason about situations, make strategic decisions, use computational tools, and interact with each other in meaningful ways.

## Learning Objectives

By completing this project, you will:

- Integrate LLM-powered agents with computational social science frameworks
- Design multi-agent systems with coordination and strategic interaction
- Implement tool use patterns that ground AI reasoning in actual computation
- Evaluate agent behaviors systematically
- Analyze how AI agents differ from traditional rule-based agents
- Communicate findings about complex socio-technical systems

## Instructions

### 1. Choose Your Integration Point

Select one of the computational methods from weeks 6-9 to integrate with AI agents:

**Option A: Agent-Based Models**
Replace rule-based ABM agents with LLM-powered agents. How do AI agents behave differently when they can reason about their goals and environment? Consider extending models like:
- Schelling segregation with agents that explain their preferences
- Economic models where agents negotiate and form coalitions
- Social network formation where agents strategically choose connections
- Resource allocation with agents that communicate and coordinate

**Option B: Game Theory**
Build AI agents that play games, negotiate, or make strategic decisions. How do LLM agents behave in strategic settings? Consider:
- Repeated games where agents learn from history
- Negotiation scenarios with incomplete information
- Auction mechanisms with AI bidders
- Multi-agent coordination games
- Social dilemmas (Prisoner's Dilemma, public goods games)

**Option C: Network Analysis**
Create AI agents that operate on or within networks. How do networks affect agent behavior and outcomes? Consider:
- Information diffusion with agents deciding what to share
- Network formation games where agents choose connections strategically
- Influence and persuasion cascades
- Coordination on networks with local information

### 2. Design Your Multi-Agent System

Your system must include:

**At least two AI agents** with distinct roles, goals, or capabilities. Agents should:
- Have clear personas or specializations
- Interact with each other (communication, negotiation, coordination)
- Make decisions based on their environment and other agents
- Use computational tools to ground their reasoning

**Computational grounding** through tool use. Your agents must execute actual computations, not just discuss them. Required tools might include:
- Running simulations or iterations
- Computing game-theoretic equilibria
- Analyzing network metrics
- Calculating payoffs or utilities
- Updating state based on actions

**Structured system design** with clear:
- Agent roles and capabilities
- Communication protocols (when/how agents interact)
- Decision-making processes
- State management (how you track what's happening)
- Tool definitions with proper schemas

### 3. Implement Your System

**Choose your implementation language:**
- **Python**: Use PydanticAI for type-safe agents, NetworkX for networks, or `quantecon.game_theory`
- **Julia**: Use HTTP.jl for LLM APIs, Agents.jl for ABM framework, GameTheory.jl for equilibria

**Key implementation requirements:**

1. **Multi-agent coordination**: Implement at least one meaningful interaction pattern (sequential decision-making, simultaneous moves, negotiation, voting, debate, etc.)

2. **Tool use / Function calling**: Define at least 3 computational tools that agents can use. Tools should execute real computations relevant to your domain.

3. **Structured outputs**: Use type-safe structures (Pydantic models in Python, or explicit structs in Julia) for agent inputs and outputs where appropriate.

4. **Documentation**: Clear code comments and docstrings. Someone reading your code should understand what each agent does and why.

### 4. Evaluate and Analyze

**Run experiments** to understand your system's behavior:
- Test your system across different scenarios or parameter settings
- Compare outcomes to theoretical predictions or baselines
- Identify interesting patterns or surprising behaviors
- Analyze how agent reasoning affects outcomes

**Systematic evaluation** (10-15% of project grade):
- Create at least 5 test cases that probe different aspects of your system
- Implement evaluation logic (can be simple: did agent choose expected action? Did outcome satisfy constraints?)
- Run your evaluation suite and report results
- Discuss what you learned from evaluation

**Analysis questions** to address:
- How do AI agents behave differently from rule-based agents?
- Do agents reach equilibria or stable patterns? Why or why not?
- How does agent reasoning (chain-of-thought) reveal their decision process?
- What limitations or failure modes did you observe?
- How do design choices (prompts, tools, interaction patterns) affect outcomes?

### 5. Document Your Work

Create a Jupyter notebook that tells the story of your project:

**Structure your notebook with:**

1. **Introduction** (1-2 paragraphs)
   - What question are you investigating?
   - Why is it interesting from a computational social science perspective?
   - How does your project integrate AI with traditional methods?

2. **System Design** (1-2 pages)
   - Describe your agents (roles, goals, capabilities)
   - Explain your tools and why agents need them
   - Show your interaction protocol
   - Discuss design choices and tradeoffs

3. **Implementation** (code cells with explanations)
   - Show key code components
   - Demonstrate tool definitions
   - Include example interactions
   - Show state management

4. **Experiments and Results** (3-4 pages)
   - Present multiple scenarios or experiments
   - Include visualizations where appropriate
   - Show agent reasoning (chain-of-thought outputs)
   - Report evaluation results

5. **Analysis and Discussion** (2-3 pages)
   - Interpret your results
   - Connect to course concepts (game theory, emergence, networks, equilibria)
   - Discuss limitations and future extensions
   - Reflect on what you learned

6. **Conclusion** (1 paragraph)
   - Summarize key findings
   - Implications for computational social science

## Deliverables

Submit the following to Webcourses:

1. **Jupyter notebook** (`.ipynb` file) containing:
   - All code, analysis, and narrative
   - Executed cells showing results
   - Visualizations and outputs

2. **Code files** (`.py` or `.jl` files):
   - Organized, reusable functions
   - Tool definitions
   - Agent implementations
   - Evaluation suite

3. **Data files** (if applicable):
   - Any datasets used
   - Evaluation test cases
   - Results data

4. **README.md** containing:
   - Setup instructions
   - Dependencies and installation
   - How to run your code
   - Any API keys needed (don't include keys themselves!)

5. **AI Usage Disclosure**:
   - List all AI tools used (ChatGPT, Claude, Copilot, etc.)
   - Include key prompts that helped generate code or ideas
   - Explain what you learned vs. what was generated

## Grading Rubric

Your project will be evaluated on the following criteria:

### Technical Implementation (40 points)

**Multi-agent system design (15 points)**
- Clear agent roles and capabilities (5 pts)
- Meaningful agent interactions (5 pts)
- Well-designed communication protocols (5 pts)

**Tool use and computational grounding (15 points)**
- At least 3 well-defined tools (5 pts)
- Tools execute actual computations (5 pts)
- Agents use tools appropriately (5 pts)

**Code quality (10 points)**
- Clean, well-organized code (3 pts)
- Proper error handling (3 pts)
- Documentation and comments (4 pts)

### Integration with Course Content (25 points)

**Connection to computational methods (15 points)**
- Meaningful integration with ABM/game theory/networks (10 pts)
- Demonstrates understanding of core concepts (5 pts)

**Comparison and analysis (10 points)**
- Compares AI agents to traditional approaches (5 pts)
- Connects results to theory (equilibria, emergence, etc.) (5 pts)

### Evaluation and Testing (15 points)

**Evaluation suite (10 points)**
- At least 5 meaningful test cases (5 pts)
- Clear evaluation logic and metrics (5 pts)

**Results and interpretation (5 points)**
- Reports evaluation outcomes (2 pts)
- Discusses what was learned (3 pts)

### Analysis and Communication (20 points)

**Experimental design (5 points)**
- Multiple scenarios tested (3 pts)
- Appropriate parameter choices (2 pts)

**Results presentation (8 points)**
- Clear visualizations (4 pts)
- Effective use of examples (4 pts)

**Written analysis (7 points)**
- Clear narrative and explanations (3 pts)
- Insightful discussion of results (2 pts)
- Limitations and extensions (2 pts)

## Project Ideas and Inspiration

Here are some concrete project directions to spark ideas:

### Game Theory + AI Agents

**Repeated Prisoner's Dilemma Tournament**
- Multiple AI agents play repeated Prisoner's Dilemma
- Agents can observe history and adapt strategies
- Tools: compute payoffs, check game history, signal intentions
- Analysis: Do agents learn to cooperate? How do different prompts affect cooperation rates?

**Multi-Agent Negotiation**
- Agents negotiate over resource allocation
- Each agent has preferences and constraints
- Tools: evaluate proposals, compute utilities, check feasibility
- Analysis: Compare to Nash bargaining solution, study effect of communication

**Auction Market Simulation**
- AI agents bid in auctions for items with private valuations
- Test different auction formats (first-price, second-price, English)
- Tools: submit bids, observe prices, calculate expected payoffs
- Analysis: Do agents discover optimal bidding strategies? Compare to theory.

### ABM + AI Agents

**Schelling with Reasoning Agents**
- Recreate Schelling model with agents that explain preferences
- Agents can communicate with neighbors
- Tools: move to location, observe neighborhood, send messages
- Analysis: How does communication affect segregation patterns?

**Economic Network Formation**
- Agents form trading partnerships in a network
- Each link has costs and benefits
- Tools: propose connections, evaluate network position, compute payoffs
- Analysis: What network structures emerge? Compare to game-theoretic predictions.

**Disaster Response Coordination** (extending Week A01)
- Multiple specialized agents coordinate emergency response
- Dynamic scenario with evolving information
- Tools: allocate resources, update situational awareness, coordinate actions
- Analysis: How does agent specialization and communication affect outcomes?

### Networks + AI Agents

**Information Diffusion with Strategic Agents**
- Agents decide whether to share information in a network
- Information has value but sharing has costs
- Tools: observe network, evaluate information, choose sharing strategy
- Analysis: What patterns emerge? How do network structures affect diffusion?

**Influence and Persuasion**
- Agents try to influence others' opinions in a social network
- Network topology affects who can influence whom
- Tools: send messages, observe opinions, compute influence metrics
- Analysis: Do opinion leaders emerge? How does network structure matter?

## Resources

### LLM APIs and Documentation

**Anthropic Claude:**
- Documentation: https://docs.anthropic.com/
- Models: claude-3-5-sonnet-20241022 (recommended), claude-3-5-haiku-20241022 (budget)
- Get API key: https://console.anthropic.com/

**OpenAI:**
- Documentation: https://platform.openai.com/docs
- Models: gpt-4o (recommended), gpt-4o-mini (budget)
- Get API key: https://platform.openai.com/api-keys

### Python Libraries

- **PydanticAI**: https://ai.pydantic.dev/ (agents and tool use)
- **NetworkX**: https://networkx.org/ (network analysis)
- **Pydantic**: https://docs.pydantic.dev/ (validation)
- **QuantEcon Game Theory**: https://github.com/QuantEcon/game-theory-notebooks

### Julia Packages

- **HTTP.jl**: For API calls
- **JSON3.jl**: JSON handling
- **Agents.jl**: ABM framework (if relevant)
- **GameTheory.jl**: Computing equilibria (if relevant)
- **Graphs.jl**: Network analysis (if relevant)

### Course Materials

Review these lectures for relevant concepts:
- Week 6-7: Agent-based models and emergence
- Week 8: Game theory fundamentals and Nash equilibrium
- Week 9: Mixed strategies, auctions, applications
- Week A01: LLM agents, RAG, multi-agent conversations
- Week A02: Tool use, type safety, evaluation

### Example Code Patterns

Refer to course notebooks for patterns:
- Multi-agent conversations (L.A1.03)
- Tool definitions and function calling (L.A2.01)
- Evaluation frameworks (L.A2.03)
- ABM implementation (L06.02, L07.01)
- Game theory computation (L08.01, L09.01)

## Tips for Success

1. **Start with a simple prototype**: Get one agent doing one thing correctly before building out the full system. Test your LLM API connection and tool calling early.

2. **Design prompts carefully**: Your agents' prompts are crucial. Be specific about their role, goals, and how to use tools. Include examples when helpful.

3. **Ground reasoning in computation**: Make sure agents are using tools to compute things, not just discussing what they would compute. "Calculate X" should call a tool, not generate a guess.

4. **Test incrementally**: Don't wait until everything is built to test. Run small experiments frequently to catch issues early.

5. **Budget for API costs**: LLM calls cost money. Use cheaper models for testing (Haiku, gpt-4o-mini), save expensive models for final runs. Estimate costs before running large experiments.

6. **Manage conversation length**: Long conversation histories consume tokens. Consider truncating history or summarizing past interactions for long-running simulations.

7. **Handle errors gracefully**: LLMs occasionally return unexpected outputs. Use structured outputs when possible, validate responses, and have fallback behaviors.

8. **Document as you build**: Write explanations in your notebook as you implement. Don't leave all the writing for the end.

9. **Collaborate effectively**: Divide work clearly within your team. Use Git/GitHub for version control if possible. Have regular check-ins.

10. **Connect to course themes**: Explicitly link your findings to concepts from the course—emergence, equilibrium, strategic interaction, coordination, etc.

11. **Make interesting comparisons**: The most compelling projects will compare AI agents to traditional approaches or theory. What's different when agents can reason?

12. **Keep scope manageable**: Better to do a thorough analysis of a focused question than a superficial treatment of something too broad.

13. **Visualize when possible**: Plots, graphs, and visual examples make your analysis much more compelling and easier to understand.

14. **Check evaluation early**: Don't treat evaluation as an afterthought. Design your test cases early and use them to guide development.

15. **Learn from failures**: If your agents don't behave as expected, that's often the most interesting part! Analyze why and discuss implications.

## Academic Integrity

Remember the course AI policy: you are encouraged to use GenAI tools (ChatGPT, Claude, Copilot, etc.) to help with your project, but you must:

- Disclose all AI usage in your notebook
- Include prompts you used
- Take responsibility for the accuracy of any AI-generated content
- Ensure you understand any code or concepts produced with AI assistance

You are responsible for your work. You should be able to explain every line of code and every conclusion in your project.

Additionally:
- All team members should contribute substantially
- Work with your assigned team only
- Cite any external code, datasets, or ideas you use
- Do not share your code with other teams
- Do not use code from previous course projects without attribution

---

**Questions?** Post to the course discussion forum or attend office hours. Good luck, and have fun exploring what happens when we give agents the power to reason!

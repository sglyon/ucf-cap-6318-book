# CAP-6318 Writing Style and Pedagogical Analysis

**Course**: Computational Analysis of Social Complexity  
**Instructor**: Spencer Lyon (SGL)  
**Analysis Date**: November 2025

This document provides a comprehensive analysis of the writing style, pedagogical approach, and educational methods used throughout the CAP-6318 course to guide the development of new AI and Agentic Systems lecture materials.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Writing Style Analysis](#writing-style-analysis)
3. [Pedagogical Techniques](#pedagogical-techniques)
4. [Course Design Patterns](#course-design-patterns)
5. [Best Practices Observed](#best-practices-observed)
6. [Lecture Structure Templates](#lecture-structure-templates)
7. [Key Terminology and Phrases](#key-terminology-and-phrases)
8. [Recommendations for AI Lectures](#recommendations-for-ai-lectures)
9. [Examples from Existing Lectures](#examples-from-existing-lectures)

---

## Executive Summary

The CAP-6318 course demonstrates a consistent, highly effective pedagogical approach characterized by:

- **Conversational yet rigorous tone** that balances accessibility with technical depth
- **Progressive complexity** building from intuition to formalism to implementation
- **Strong integration** of theory, computation, and real-world applications
- **Active learning** through exercises, interactive examples, and hands-on coding
- **Cohesive narrative** that connects diverse topics (networks, game theory, ABMs, blockchains) through common themes

The course successfully makes advanced topics accessible to graduate students from diverse backgrounds while maintaining mathematical rigor and practical relevance.

---

## Writing Style Analysis

### 1. Tone and Voice

**Conversational Yet Authoritative**
- Uses first-person plural ("We will study...", "We now turn to...")
- Direct address to students ("You may think...", "Suppose you are...")
- Colloquial expressions balanced with technical precision
- Example: "This is pretty risky" vs "The equilibrium of this game is..."

**Example from L08.01 (Game Theory)**:
```markdown
### Best Responses

- What would happen in the Prisoner's dilemma game?
- You may think that these partners in crime would like to stick together...
- However, that doesn't happen
- The investigator knows game theory and rigged the game against them...
```

**Characteristics**:
- Short, punchy sentences for emphasis
- Rhetorical questions to engage thinking
- Anticipates student misconceptions
- Builds suspense and curiosity

### 2. Narrative Structure

**"Hook → Build → Reveal" Pattern**

Most lectures follow this arc:
1. **Hook**: Real-world scenario or motivating question
2. **Build**: Progressive development of concepts with examples
3. **Reveal**: Key insights, mathematical formalism, or surprising results

**Example from L08.02 (Network Traffic)**:
```markdown
## A Traffic Network
- We'll start by considering a traffic network
- [Shows diagram]
- We'll write up some helper Julia functions...
[After analysis]
### Braess' Paradox
- In the previous exercise, we saw a rather startling result...
- Doing a network "upgrade" [...] resulted in a *worse* equilibrium outcome!
```

**Story-Driven Explanations**

Complex concepts are often introduced through narratives:
- Prisoner's Dilemma: Two robbery suspects
- Marketing game: Competing firms
- Blockchain: Friends settling debts
- Smart contracts: Online art purchase

### 3. Balance of Theory and Practice

**Integrated Approach** (not segregated):
- Mathematical definition
- Intuitive explanation
- Code implementation
- Real-world application

**Example from L06.01 (ABM)**:
```markdown
## Agent Based Models

- Agent based models are...
    - An approximation to some complex system (a model)
    - Used in various fields...
    - Composed of three key elements: (1) Agents (2) Environment (3) Rules

[Then immediately follows with:]

## Schelling Segregation Model
- Agents: individuals/families seeking a home...
```

### 4. Use of Examples and Metaphors

**Concrete Before Abstract**
- Always start with a specific, relatable example
- Generalize to abstract principles
- Return to example to solidify understanding

**Effective Metaphors**:
- "Money Legos" for DeFi composability
- "Financial rails" for payment infrastructure
- "Wormhole" for network shortcuts (Braess' Paradox)
- "Rich get richer" for preferential attachment

### 5. Code Integration Patterns

**Code as Pedagogy** (not just demonstration):

1. **Incremental Building**:
```julia
# Start simple
pd_p1 = [-1 -10; 0 -4]

# Then use in context
p1 = Player(pd_p1)
pd_g = NormalFormGame([p1, p1])

# Finally analyze
pd_eq = pure_nash(pd_g)
```

2. **Commented Explanations**:
```julia
# periodic = true means agents at edges can interact with agents on opposite edge
# This creates a torus topology - think of it like Pac-Man...
space = GridSpace(dims, periodic = true)
```

3. **TODO Scaffolding**:
```julia
# TODO: your code here
# TODO: compute winner, price paid, profit
```

---

## Pedagogical Techniques

### 1. Progressive Complexity

**Three-Stage Development**:

**Stage 1: Intuition**
- Natural language explanation
- Visual/concrete examples
- "What would happen if..."

**Stage 2: Formalization**
- Mathematical notation introduced
- Definitions and theorems
- Algorithmic descriptions

**Stage 3: Implementation**
- Julia code
- Computational experiments
- Data analysis

**Example from L09.01 (Mixed Strategies)**:
```markdown
## P1 Payoffs in Matching Pennies

- Suppose you are player 1...
- The expected payoffs from each of P1's pure strategies are:
  - Plays H: $p_1(H | q)$: $-1 \cdot q + 1 \cdot (1-q) = 1 - 2q$ 

[Intuition first, then math, then code]
```

### 2. Exercise Structure

**Types of Exercises**:

1. **Guided Exploration** (with hints):
```markdown
### Exercise
- Try running the simulation with different population sizes
- Run with `N=100`, `N=500`, and `N=5000`
- Compare the histograms - does the pattern persist?
```

2. **Conceptual Questions** (test understanding):
```markdown
### Exercise
- Does this game have a Nash Equilibrium in pure strategies? Why or why not?
- What type of game is this?
```

3. **Open-Ended Application**:
```markdown
### Exercise 4.2: Design Your Own Auction
Choose one of the following scenarios and design an auction mechanism:
- Data Marketplace
- Freelance Platform
- ML Model Marketplace
```

4. **Computational Tasks**:
```markdown
### Exercise 1
Using the routines above, construct a Simple graph of tokens.
The number of nodes should be the number of tokens...
```

**Exercise Placement**:
- Immediately after concept introduction (reinforcement)
- At natural breaks in narrative (consolidation)
- At end of lecture (synthesis)

### 3. Visual Aids and Data Visualization

**Consistent Visualization Patterns**:

1. **Network Diagrams**: Always for graph structures
2. **Game Trees**: For extensive form games
3. **Time Series**: For dynamics and simulation results
4. **Histograms**: For distributions (wealth, citations)
5. **Heatmaps**: For spatial patterns (ABMs)

**Code-First Visualization**:
```julia
hist(
    filter(x -> x.time == 10, df).wealth;
    bins = collect(0:9),
    color = cgrad(:viridis)[28:28:256],
)
```

### 4. Real-World Applications

**Every topic connected to applications**:

- Networks → Social media, disease spread, infrastructure
- Game Theory → Cybersecurity, advertising auctions, AWS pricing
- ABMs → Segregation, wealth inequality, academic citations
- Blockchains → DeFi, NFTs, smart contracts

**Application Presentation Pattern**:
1. Describe real system
2. Model key features
3. Analyze with course tools
4. Discuss implications

### 5. Interactive Elements

**Student Engagement Techniques**:

1. **Live Coding/Demos**:
```markdown
- Let's load it up and create a version of our prisoner's dilemma game:
```

2. **Think-Pair-Share Prompts**:
```markdown
- Question: how many players are there?
- How many strategies does player 1 have? Player 2?
```

3. **Predictions Before Reveals**:
```markdown
- What do we see? With 2000 agents starting with equal wealth...
- This concentration of wealth emerges naturally from random exchanges!
```

---

## Course Design Patterns

### 1. How Each Week Builds

**Weeks 1-2: Foundations**
- Julia programming
- Tool-building mindset
- Computational thinking

**Weeks 3-5: Networks**
- Graph theory fundamentals
- Social network concepts
- Economic networks

**Weeks 6-7: Agent-Based Models**
- ABM framework
- Emergence from simple rules
- Computational social science

**Weeks 8-9: Game Theory**
- Strategic interaction
- Equilibrium concepts
- Applications (auctions, network games)

**Weeks 11-12: Blockchains**
- Decentralized systems
- Smart contracts
- Economic applications (DeFi, NFTs)

**Integrating Themes**:
- Computational methods throughout
- Network thinking across topics
- Economic incentives as unifying thread
- Julia as implementation language

### 2. Integration of Topics

**Cross-Topic Connections Made Explicit**:

From L08.02 (Network Traffic):
```markdown
## Network Traffic with Game Theory
**Prerequisites**
- Networks
- Game Theory
```

From L09.01 (Mixed Strategies):
```markdown
### Real-World Examples
- D-Day in WW2. US could have landed in France...
- Outcome largely depended on US ability to trick Germany...
```

From L12.01 (Ethereum):
```markdown
### Transaction Data: Logs
- A team building a smart contract system will
    - Write contracts to fulfill goals
    - Craft event types to capture key semantic data
    - Process the log data...
```

### 3. Mathematical Formalism

**When and How Math is Introduced**:

**Pattern 1: Natural Language → Math → Code**
```markdown
- A game is a description of a strategic environment composed of:
  1. A finite set of $N$ players
  2. For each player $i$, a set of feasible actions $S_i$
  3. For each player $i$, a payoff function $p_i:\Sigma \rightarrow \mathbb{R}$
```

**Pattern 2: Math in Service of Understanding**
- Never math for math's sake
- Always connected to intuition
- Computational implementation validates theory

**Notation Conventions**:
- Clear variable definitions
- Consistent notation across lectures
- LaTeX for formal expressions
- Code for computational definitions

### 4. Julia Throughout

**Julia as Pedagogical Tool**:

1. **Not just a programming language** - it's a thinking tool
2. **Multiple dispatch** enables clean abstractions
3. **Performance** allows realistic simulations
4. **Ecosystem** provides ready-made tools

**Julia Usage Patterns**:

**Type Definitions for Concepts**:
```julia
@agent struct MoneyAgent(NoSpaceAgent)
    wealth::Int
end
```

**Functions as Rules**:
```julia
function agent_step!(agent, model)
    if agent.wealth == 0
        return
    end
    recipient = random_agent(model)
    agent.wealth -= 1
    recipient.wealth += 1
end
```

**Packages for Advanced Features**:
- GameTheory.jl for equilibrium computation
- Agents.jl for ABM framework
- Graphs.jl for network analysis

---

## Best Practices Observed

### 1. Most Effective Teaching Methods

**"Show, Don't Tell" Principle**:
- Demonstrate concepts through examples
- Let students discover patterns
- Provide frameworks, not answers

**Example from L07.01 (Money Model)**:
```markdown
- What do we see? With 2000 agents starting with equal wealth...
  after just 10 steps most agents have 0 or 1 units of wealth
- This concentration of wealth emerges naturally from random exchanges!
- Above we see the famous "power law" pattern
```

**Layered Explanations**:
- Initial simple explanation
- Add nuance and detail
- Formal treatment
- Computational validation

### 2. Explaining Complex Concepts

**Recipe for Complex Topics**:

1. **Start with a concrete scenario** (story/example)
2. **Identify the key question** ("How can we avoid this?")
3. **Build intuition** (natural language reasoning)
4. **Introduce formalism** (definitions, notation)
5. **Demonstrate computation** (code implementation)
6. **Analyze results** (what do we learn?)
7. **Connect to bigger picture** (implications, extensions)

**Example: Smart Contracts (L12.01)**:
1. Story: Buying art online (trust problem)
2. Question: How to eliminate need for payment provider?
3. Intuition: Both parties lock funds until transaction completes
4. Formalism: State machine with transitions
5. Code: Julia Purchase struct → Solidity contract
6. Analysis: Benefits and remaining issues
7. Big Picture: Trustless commerce enabled

### 3. Engaging Narrative Techniques

**Suspense and Surprise**:
```markdown
### Best Responses
- You may think that these partners in crime would like to stick together...
- However, that doesn't happen
- The investigator knows game theory and rigged the game against them...
```

**Conversational Asides**:
```markdown
> NOTE: as an economist I'm obligated to say that (1) I don't believe
> we necessarily want a system without dollars and (2) it is not the
> intention of (most) cryptocurrency projects to replace the dollar
```

**Humor and Relatability**:
```markdown
- This is close enough for rock and roll, as they say in the trade.
```

**Foreshadowing**:
```markdown
- We may study this next week, or perhaps even on your homework 😉
```

### 4. Problem-Solving Approaches

**Structured Problem-Solving**:

**Pattern for Game Theory Problems**:
1. Identify players, strategies, payoffs
2. Construct payoff matrix/tree
3. Apply solution concept (NE, dominated strategies)
4. Verify solution
5. Interpret result

**Pattern for Network Problems**:
1. Define nodes and edges
2. Build graph representation
3. Compute metrics (clustering, paths, etc.)
4. Visualize structure
5. Analyze implications

**Pattern for ABM Problems**:
1. Define agents, environment, rules
2. Implement in Agents.jl
3. Run simulation
4. Collect and analyze data
5. Interpret emergent behavior

---

## Lecture Structure Templates

### Template 1: Concept Introduction Lecture

**Frontmatter** (always present):
```markdown
# [Lecture Title]

> Computational Analysis of Social Complexity
>
> Fall 2025, Spencer Lyon

**Prerequisites**
- [List of prior concepts/lectures]

**Outcomes**
- [Specific learning objectives, 3-5 items]
- [Action verbs: Understand, Implement, Analyze, etc.]

**References**
- [Textbook chapters]
- [Papers, websites, documentation]
```

**Body Structure**:
1. **Introduction** (motivation, context)
2. **Simple Example** (concrete, relatable)
3. **Formal Definition** (mathematical, precise)
4. **Implementation** (Julia code)
5. **Extensions** (variations, applications)
6. **Exercises** (practice, exploration)

**Example**: L06.01 (ABM Concepts)

### Template 2: Application Lecture

**Structure**:
1. **Background** (real-world system)
2. **Modeling Approach** (simplifications, assumptions)
3. **Implementation** (step-by-step code)
4. **Analysis** (results, visualizations)
5. **Discussion** (implications, limitations)
6. **Extensions** (open problems, variations)

**Example**: L07.02 (Academic Paper Virality)

### Template 3: Lab/Exercise Lecture

**Structure**:
1. **Overview** (what we'll accomplish)
2. **Scenario 1** 
   - Background
   - Data/Setup
   - Exercises (2.1, 2.2, 2.3...)
3. **Scenario 2**
   - Similar structure
4. **Synthesis Exercise** (connecting scenarios)
5. **Conclusion** (key takeaways)

**Example**: L09.04 (Game Theory Lab)

### Template 4: Technical Deep-Dive

**Structure** (for advanced topics):
1. **Review** (prior concepts)
2. **Key Abstraction** (central idea)
3. **Formal Framework** (mathematical treatment)
4. **Computation** (algorithms, implementation)
5. **Application** (worked example)
6. **Exercises** (implementation tasks)

**Example**: L09.02 (Markov Perfect Equilibrium)

---

## Key Terminology and Phrases

### Transitional Phrases

**Introducing New Topics**:
- "We now turn to..."
- "Let's examine..."
- "Consider the following..."
- "Suppose that..."

**Building on Prior Work**:
- "Recall that..."
- "As we saw in..."
- "Building on this idea..."
- "Extending our previous example..."

**Emphasizing Key Points**:
- "The key insight is..."
- "Note that..."
- "Importantly..."
- "A crucial aspect..."

**Signaling Complexity**:
- "This is a pretty technical question..."
- "Without going into too much detail..."
- "The full treatment is beyond our scope..."

**Encouraging Thinking**:
- "Question: how would you..."
- "Think about what happens when..."
- "What if we tried..."

### Domain-Specific Vocabulary

**Consistent Use Across Lectures**:

**Networks**:
- "nodes" and "edges" (not vertices/links inconsistently)
- "clustering coefficient"
- "preferential attachment"
- "strong ties" vs "weak ties"

**Game Theory**:
- "players", "strategies", "payoffs"
- "best response"
- "Nash equilibrium"
- "dominant/dominated strategy"

**ABMs**:
- "agents", "environment", "rules"
- "emergence"
- "step function"
- "agent-based model" (spelled out, then ABM)

**Blockchains**:
- "decentralized", "trustless", "permissionless"
- "smart contract"
- "public/private key"
- "DeFi", "NFT", "Web3"

### Framing Questions

**Effective Question Types**:

1. **Conceptual Verification**:
   - "Does this game have a Nash Equilibrium in pure strategies?"
   - "What type of game is this?"

2. **Prediction**:
   - "What would happen if...?"
   - "How might this change if...?"

3. **Comparison**:
   - "How does this differ from...?"
   - "Which approach is better when...?"

4. **Application**:
   - "How could we use this to...?"
   - "What real-world situations fit this model?"

5. **Design**:
   - "How would you design...?"
   - "What auction mechanism would work best for...?"

---

## Recommendations for AI Lectures

### 1. Maintain Consistent Style

**Do**:
- ✓ Use conversational tone with technical precision
- ✓ Start every topic with concrete example before abstraction
- ✓ Include Prerequisites/Outcomes/References in frontmatter
- ✓ Build progressively: intuition → formalism → code
- ✓ Connect to existing course topics (networks, game theory, ABMs)

**Don't**:
- ✗ Jump straight to mathematical formalism
- ✗ Separate theory and practice into different lectures
- ✗ Use passive voice or overly academic language
- ✗ Skip motivating examples or applications

### 2. Integration with Existing Content

**Connect AI to Course Themes**:

**Networks and AI**:
- Neural networks as computational graphs
- Knowledge graphs and graph neural networks
- Network effects in AI model training (data, compute)

**Game Theory and AI**:
- Multi-agent reinforcement learning
- Mechanism design for AI alignment
- Strategic behavior in LLM interactions

**ABMs and AI**:
- Simulating AI agent behaviors
- Emergence in multi-agent AI systems
- AI-driven agent decision making

**Blockchains and AI**:
- Decentralized AI training
- AI model marketplaces
- Provenance and verification of AI outputs

### 3. Suggested Lecture Sequence

**Lecture 1: Introduction to AI and ML**
- Prerequisites: Julia basics, DataFrames
- Hook: "Teaching computers to recognize cats"
- Content: Supervised learning, basic neural networks
- Implementation: Simple classifier in Flux.jl
- Connection: Networks as computational graphs

**Lecture 2: Large Language Models**
- Prerequisites: AI/ML basics
- Hook: ChatGPT conversation
- Content: Transformer architecture, attention mechanism
- Implementation: Using pre-trained models
- Connection: Network attention, information flow

**Lecture 3: AI Agents and Multi-Agent Systems**
- Prerequisites: ABM concepts, game theory
- Hook: AI playing poker/chess
- Content: RL, multi-agent systems
- Implementation: Simple agent in Julia
- Connection: ABM framework, strategic interaction

**Lecture 4: AI Alignment and Safety**
- Prerequisites: Game theory, mechanism design
- Hook: "Paperclip maximizer" scenario
- Content: Alignment problem, RLHF
- Implementation: Reward modeling exercise
- Connection: Principal-agent problem, mechanism design

**Lecture 5: Agentic AI Systems**
- Prerequisites: All AI lectures
- Hook: AutoGPT, autonomous agents
- Content: Agent architectures, tool use
- Implementation: Building simple agentic system
- Connection: ABMs, complex systems

**Lecture 6: AI Economics and Markets**
- Prerequisites: Game theory, auctions, blockchains
- Hook: AI art marketplaces
- Content: AI-generated content, IP, valuation
- Implementation: Data analysis of AI model markets
- Connection: NFTs, DeFi, auction theory

### 4. Code Integration for AI Topics

**Use Familiar Patterns**:

```julia
# Agent-based style for AI agents
@agent struct AIAgent(NoSpaceAgent)
    policy::Function
    state::Dict
    rewards::Vector{Float64}
end

function agent_step!(agent::AIAgent, model)
    # observation
    obs = observe(model, agent)
    # action selection
    action = agent.policy(obs, agent.state)
    # execute action
    reward = execute!(model, agent, action)
    # update
    push!(agent.rewards, reward)
end
```

**Leverage Julia Ecosystem**:
- Flux.jl for neural networks
- Transformers.jl for LLMs
- ReinforcementLearning.jl for RL agents
- MLJ.jl for classical ML

### 5. Exercise Design for AI Topics

**Progressive Exercises**:

**Level 1: Understanding**
```markdown
### Exercise 1.1: Conceptual
- What is the key difference between supervised and unsupervised learning?
- Why might an AI agent need to balance exploration vs exploitation?
```

**Level 2: Analysis**
```markdown
### Exercise 2.1: Data Analysis
Using the provided dataset of AI model performance:
- Plot accuracy vs model size
- Identify scaling laws
- Discuss implications for compute requirements
```

**Level 3: Implementation**
```markdown
### Exercise 3.1: Build Your Own
Implement a simple reinforcement learning agent that:
- Observes its environment
- Takes actions
- Receives rewards
- Updates its policy
```

**Level 4: Design**
```markdown
### Exercise 4.1: Open-Ended
Design an auction mechanism for:
- Selling AI compute time
- Trading AI-generated content
- Incentivizing truthful AI training data
```

### 6. Real-World AI Applications to Include

**Data Science Workflows**:
- AutoML and feature engineering
- Model deployment and monitoring
- A/B testing AI systems

**Industry Applications**:
- Recommender systems (game theory + networks)
- Fraud detection (anomaly detection + networks)
- Supply chain optimization (ABM + optimization)

**Emerging Topics**:
- AI safety research
- Constitutional AI
- AI governance and policy

**Controversial/Thought-Provoking**:
- AI bias and fairness
- Job displacement
- AGI timelines and implications

### 7. Maintaining Course Philosophy

**Core Principles to Preserve**:

1. **Computational Social Science Lens**
   - AI as social and technical phenomenon
   - Focus on collective behavior, not just individual models
   - Economic and game-theoretic analysis

2. **Hands-On Learning**
   - Every concept implemented in Julia
   - Real data analysis
   - Build intuition through coding

3. **Interdisciplinary Connections**
   - Economics, computer science, sociology
   - Theory and practice
   - Multiple perspectives on same problem

4. **Critical Thinking**
   - Question assumptions
   - Consider failure modes
   - Discuss limitations and extensions

---

## Examples from Existing Lectures

### Example 1: Opening Hook (L11.01 - Blockchains)

```markdown
## Ledgers

- A financial ledger is a log or record of financial transactions
- Ledgers are typically used by accountants...

### Simple Example

- We won't teach the rules of double entry book keeping...
- Instead we'll consider a simplified ledger that illustrates the main idea
- Suppose there are 4 friends: Alice, Bob, Charlie, and Darla
  - These friends frequently do things together...
  - To simplify paying, they decide to use a ledger...
```

**Why This Works**:
- Relatable scenario (friends splitting costs)
- Avoids unnecessary complexity (no accounting rules)
- Sets up problem that motivates blockchain

### Example 2: Progressive Formalization (L08.01 - Game Theory)

**Step 1: Natural Language**
```markdown
## What is a Game?
- A game is a description of a strategic environment composed of:
  1. A finite set of $N$ players
  2. For each player $i$, a set of feasible actions
  3. For each player $i$, a payoff function
```

**Step 2: Concrete Example**
```markdown
## Example: Prisoner's Dilemma
- A very famous example is called the prisoner's dilemma
- Story: two robbery suspects brought in for questioning
[Shows payoff matrix]
```

**Step 3: Implementation**
```julia
pd_p1 = [-1 -10; 0 -4]
p1 = Player(pd_p1)
pd_g = NormalFormGame([p1, p1])
pd_eq = pure_nash(pd_g)
```

### Example 3: Exercise Progression (L09.04 - Game Theory Lab)

**Exercise 1.1: Conceptual**
```markdown
1. Does this game have a Nash Equilibrium in pure strategies? Why or why not?
2. What type of game is this (zero-sum, positive-sum, negative-sum)?
3. Why might randomization be beneficial?
```

**Exercise 1.2: Computational**
```markdown
**Part A**: Write out the Attacker's expected payoff for each strategy as function of $p$
**Part B**: Use the indifference condition to solve for $p^*$
**Part D**: What is the expected payoff for each player at equilibrium?
```

**Exercise 1.3: Interpretation**
```markdown
1. What does the equilibrium strategy tell you about security practices?
2. If the Defender could credibly commit, would that change the outcome?
3. How does this relate to "security through obscurity"?
```

### Example 4: Connecting Topics (L08.02 - Network Traffic)

```markdown
## Social Welfare

- Many economic models are composed of individual actors...
- We've been studying these using tools from game theory
- Another form of analysis works at the macro level...
- We call this aggregate payoff **social welfare**

[Later, connecting to networks:]

### The Social Planner

- In our traffic model, a social planner would choose to ignore the wormhole
- Question: in a generic traffic model, how much *worse* can the equilibrium
  outcome be than the social optimum?
```

**Why This Works**:
- Bridges game theory and optimization
- Introduces economic concepts naturally
- Sets up comparison (equilibrium vs optimal)
- Foreshadows homework problem

### Example 5: Narrative Tension (L06.02 - Schelling Model)

```markdown
## Schelling Segregation Model

- Agents: individuals/families seeking a home in a neighborhood
- Have a type and happiness
- Agents are happy if at least $N$ of their neighbors are same type
- Environment: grid of "lots" or homes
- Rules: All unhappy agents move to a new random home

### Schelling Takeaways

- Very simplistic view of agents and decision making
- Agents only considered immediate neighbors (locality)
- Simplistic, local behavior led to stark aggregate results: **segregation**
- [Reveals surprising emergent behavior]
```

**Why This Works**:
- Simple setup (anyone can understand)
- Surprising result (segregation from mild preferences)
- Demonstrates emergence
- Connects to real social phenomena

---

## Conclusion

The CAP-6318 course exemplifies effective teaching of computational social science through:

1. **Consistent pedagogical approach** across diverse topics
2. **Progressive complexity** that builds student understanding
3. **Integration of theory, computation, and application**
4. **Engaging narrative style** that maintains student interest
5. **Hands-on learning** through Julia programming
6. **Real-world relevance** of every concept

To maintain this quality in the AI lectures:
- Follow established templates and patterns
- Connect new material to existing course themes
- Preserve the conversational yet rigorous tone
- Emphasize computational implementation
- Include diverse, engaging applications
- Design progressive, meaningful exercises

The AI and Agentic Systems lectures should feel like a natural extension of the course, not a separate add-on. They should leverage the same pedagogical tools while introducing new computational social science perspectives on artificial intelligence.

---

**Document prepared for**: Development of AI and Agentic Systems lecture series  
**Based on**: Analysis of 25+ lectures across 12 weeks of CAP-6318 content  
**Author**: Claude (AI Analysis)  
**Date**: November 2025

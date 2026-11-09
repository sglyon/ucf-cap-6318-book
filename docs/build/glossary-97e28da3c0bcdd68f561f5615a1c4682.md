# Glossary

Key terms from CAP-6318, organized by unit. Each term links to the lecture that introduces it.

## Julia

:::{glossary}
abstract type
: A {term}`type` that can never be instantiated directly; it organizes related {term}`composite types <composite type>` into a family and lets you define shared {term}`methods <method>` for the whole family at once. *Introduced in* [Julia Types and Methods](week02/L02.01_julia_types_methods.ipynb).

composite type
: A {term}`type` with named fields holding related data, defined with `struct Name ... end`; an instance is treated and passed around as a single value. *Introduced in* [Julia Types and Methods](week02/L02.01_julia_types_methods.ipynb).

Dict
: A collection that maps keys to values, created with `Dict(key => value, ...)`; also called a dictionary. *Introduced in* [Julia Foundations](week01/L01.03_julia_basics.ipynb).

environment
: An isolated, named set of installed packages and their versions, described by {term}`Project.toml` and {term}`Manifest.toml`, so different projects can depend on different package sets without conflict. *Introduced in* [Julia Package Development](week02/L02.03_julia_packages.ipynb).

export
: Listing a name inside a {term}`module` with the `export` keyword so it is added automatically to a caller's namespace when they run `using ModuleName`. *Introduced in* [Julia Code Organization](week02/L02.02_code_organization.ipynb).

include
: A function that evaluates the code in a `.jl` file as if it were pasted directly into the current session — the basic tool for splitting code across files. *Introduced in* [Julia Code Organization](week02/L02.02_code_organization.ipynb).

Julia
: A general-purpose programming language built for numerical computation: as easy to read and write as Python, but compiled to run as fast as C. *Introduced in* [Julia Foundations](week01/L01.03_julia_basics.ipynb).

Manifest.toml
: The companion file to {term}`Project.toml` that pins the exact version of every package, direct and indirect, in an {term}`environment`, so it can be reproduced exactly. *Introduced in* [Julia Package Development](week02/L02.03_julia_packages.ipynb).

method
: One specific implementation of a function, specialized to a particular combination of argument types (e.g. `isint(x::Integer) = true`); a function can have many methods, chosen by {term}`multiple dispatch`. *Introduced in* [Julia Types and Methods](week02/L02.01_julia_types_methods.ipynb).

module
: A named namespace (`module Name ... end`) that bundles related code so its contents don't automatically pollute the caller's session; members are reached via `Module.name` or brought in with `using`. *Introduced in* [Julia Code Organization](week02/L02.02_code_organization.ipynb).

multiple dispatch
: Choosing which {term}`method` of a function runs based on the types of *all* its arguments, not just the first. Julia's core design idea. *Introduced in* [Julia Types and Methods](week02/L02.01_julia_types_methods.ipynb).

named tuple
: A hybrid of a {term}`tuple` and a {term}`Dict`: an ordered, immutable collection whose elements have names, created with `(name = value, ...)`. *Introduced in* [Julia Foundations](week01/L01.03_julia_basics.ipynb).

package
: A unit of reusable Julia code published and installed through Julia's package manager ({term}`Pkg`), extending the language with new types and functions. *Introduced in* [Julia Foundations](week01/L01.03_julia_basics.ipynb).

package composability
: The property that packages and built-in code get the same treatment in Julia, so a package can operate on types defined by a completely different package (e.g. plotting a `DataFrame`). *Introduced in* [Julia Foundations](week01/L01.03_julia_basics.ipynb).

Pkg
: Julia's built-in package manager, used to add, remove, and update {term}`packages <package>` — either as the `Pkg` module (`Pkg.add(...)`) or the `]` REPL mode. *Introduced in* [Julia Package Development](week02/L02.03_julia_packages.ipynb).

primitive type
: A built-in {term}`type` representing a fixed collection of bits, e.g. `Float64`, `Bool`, `Int8`; defined by Julia itself, not typically created by users. *Introduced in* [Julia Types and Methods](week02/L02.01_julia_types_methods.ipynb).

Project.toml
: The TOML file listing an {term}`environment`'s direct package dependencies as `NAME = UUID` pairs; created and updated automatically by {term}`Pkg`. *Introduced in* [Julia Package Development](week02/L02.03_julia_packages.ipynb).

REPL
: Julia's Read-Eval-Print-Loop, the interactive `julia>` prompt where you type an expression and immediately see its value. *Introduced in* [Julia Setup](week01/L01.02_setup.ipynb).

standard library
: The set of {term}`packages <package>` (e.g. `Dates`) that ship bundled with Julia itself, already installed and ready to `using`. *Introduced in* [Julia Foundations](week01/L01.03_julia_basics.ipynb).

TOML
: "Tom's Obvious Markup Language" — the plain-text configuration format used by {term}`Project.toml` and {term}`Manifest.toml` to describe a Julia {term}`environment`. *Introduced in* [Julia Package Development](week02/L02.03_julia_packages.ipynb).

tuple
: An immutable, ordered collection written with parentheses, e.g. `(1, 2, "hello")`; unlike an array, a tuple is not meant to be updated or used in linear algebra. *Introduced in* [Julia Foundations](week01/L01.03_julia_basics.ipynb).

type
: What kind of object lives at a given memory address. Julia uses a value's type to decide which syntax and which {term}`methods <method>` apply to it. *Introduced in* [Julia Types and Methods](week02/L02.01_julia_types_methods.ipynb).

type hierarchy
: The tree of Julia {term}`types <type>` rooted at `Any` (every object) with `Union{}` at the bottom (no objects); every type has at most one parent. *Introduced in* [Julia Types and Methods](week02/L02.01_julia_types_methods.ipynb).
:::

## Networks

:::{glossary}
adjacency matrix
: A matrix $A\in\{0,1\}^{N\times N}$ for a graph of $N$ nodes, with $A_{ij}=1$ if there is an edge between nodes $i$ and $j$. A {term}`weighted graph` generalizes the entries to real-valued weights. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

Balance Theorem
: If a labeled complete graph is balanced, then either all pairs of nodes are friends, or the nodes split into two groups X and Y such that every pair within X or within Y are friends and every pair across X and Y are enemies. *Introduced in* [Structural Balance](week04/L04.03_structural_balance.ipynb).

Bellman equation
: The recursive restriction $J(v)=\min_{n\in F_v} w_{vn}+J(n)$ satisfied by the {term}`cost-to-go` function $J$, where $F_v$ is the set of nodes reachable from $v$; used to compute {term}`shortest paths <shortest path>` by guess-and-iterate. *Introduced in* [Weighted Graphs](week04/L04.02_weighted_graphs.ipynb).

betweenness centrality
: For node $v$, $C_B(v)=\sum_{s\ne v\ne t}\sigma_{st}(v)/\sigma_{st}$, where $\sigma_{st}$ is the number of shortest paths between $s$ and $t$ and $\sigma_{st}(v)$ is the number passing through $v$; captures how much flow passes through a node. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

breadth-first search
: An algorithm that computes distances from a starting {term}`node` by visiting nodes layer by layer, in order of increasing {term}`distance <distance (graph)>`. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

bridge (graph)
: An {term}`edge` that, if removed, would split the nodes it connects into different {term}`components <component (graph)>` of the graph. Contrast with the weaker {term}`local bridge`. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

clustering coefficient
: The fraction of a node's (or graph's) possible {term}`triangles <triangle (graph)>` that are actually closed; equivalently, the probability that two random friends of a node are themselves friends. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

component (graph)
: A self-contained subset of {term}`nodes <node>` such that every node in it has a {term}`path` to every other, and the subset is not part of any larger such subset. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

connected graph
: A {term}`graph` in which there is a {term}`path` between every pair of {term}`nodes <node>`, so any node can be reached from any other. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

cost-to-go
: $J(v)$, the minimum cumulative weight needed to travel from node $v$ to a fixed destination along a {term}`weighted graph`. *Introduced in* [Weighted Graphs](week04/L04.02_weighted_graphs.ipynb).

cycle
: A {term}`path` that starts and ends at the same {term}`node`. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

degree
: The number of {term}`edges <edge>` connected to a {term}`node`, $\sum_j A_{ij}$; a basic measure of node importance. High-degree nodes are often called hubs. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

demand shock
: A one-time change $\Delta d$ in the final-demand vector; the resulting change in equilibrium output is $\Delta x=L\Delta d$, decomposable round-by-round via the {term}`Neumann series lemma` as $\Delta d+A\Delta d+A^2\Delta d+\cdots$. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

directed graph
: A {term}`graph` in which each {term}`edge` has a direction, so a connection flows from one specific node to another rather than being symmetric. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

distance (graph)
: The length of the shortest {term}`path` between two {term}`nodes <node>`, where length is the number of edge-steps along the path. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

edge
: A relationship between two {term}`nodes <node>` in a {term}`graph`; may be directed or undirected, weighted or unweighted, and in a {term}`signed graph` labeled `+` or `-`. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

eigenvalue
: For $A\in\mathbb{R}^{n\times n}$, a scalar $\lambda\in\mathbb{C}$ with $Ae=\lambda e$ for some nonzero vector $e$ (the {term}`eigenvector`). The set of all eigenvalues is $A$'s spectrum, $\sigma(A)$. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

eigenvector
: A nonzero vector $e$ satisfying $Ae=\lambda e$ for an {term}`eigenvalue` $\lambda$; a vector $\epsilon$ with $A'\epsilon=\lambda\epsilon$ is a left-eigenvector. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

eigenvector centrality
: A node-importance measure equal to the dominant {term}`eigenvector` of a graph's (weighted) {term}`adjacency matrix` — a node scores higher if it connects to other highly central nodes. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

giant component
: A single {term}`component <component (graph)>` containing most of a network's nodes, with the rest scattered in small components or isolated — a common structure in real-world networks. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

Girvan-Newman algorithm
: A divisive {term}`graph partitioning` algorithm that repeatedly removes the edges with highest {term}`betweenness centrality` and recomputes centrality on the resulting pieces. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

graph
: A structure that records relationships between a collection of items: each item is a {term}`node` and each relationship is an {term}`edge`. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

graph partitioning
: The algorithmic problem of breaking a {term}`graph` into tightly-knit regions, typically by removing {term}`local bridges <local bridge>` (divisive methods) or growing regions from a seed node (agglomerative methods). *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

graph theory
: The branch of mathematics that studies {term}`graphs <graph>`: collections of {term}`nodes <node>` and the {term}`edges <edge>` that connect them. It is the language this course uses for networks. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

homophily
: The tendency for connected {term}`nodes <node>` to be more similar to each other than nodes further apart in the network — "we are similar to our friends." *Introduced in* [Homophily](week04/L04.01_homophily.ipynb).

input-output coefficient
: $a_{ij}=\dfrac{\text{value of sector }j\text{'s inputs from sector }i}{\text{total sales of sector }j}$, the entry of the input-output matrix $A$ recording how much sector $j$ buys from sector $i$ per dollar of its own sales. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

inverse homophily
: A pattern in which the observed cross-characteristic edge share is well above the {term}`random-formation benchmark`, i.e. more cross-type edges than random mixing would predict. *Introduced in* [Homophily](week04/L04.01_homophily.ipynb).

Leontief inverse
: The matrix $L\equiv(I-A)^{-1}$ that maps a final-demand vector $d$ to the equilibrium output vector $x^*=Ld$, given input-output coefficient matrix $A$ with $r(A)<1$. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

Leontief model
: A family of production-network models (Leontief, 1941) built on an input-output table, used to analyze an economy as sectors linked by intermediate-good flows. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

local bridge
: An edge A-B that is a local bridge if A and B have no neighbors in common — a looser, more common relative of a true {term}`bridge <bridge (graph)>`. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

Neumann series lemma
: If $A\in\mathbb{R}^{n\times n}$ and $r(A)<1$, then $I-A$ is nonsingular and $(I-A)^{-1}=\sum_{m=0}^{\infty}A^m$. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

node
: A single item in a {term}`graph`, connected to other nodes by {term}`edges <edge>`. Graphs.jl calls these "vertices." *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

path
: A flow from one {term}`node` to another across a sequence of {term}`edges <edge>`. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

random-formation benchmark
: The cross-characteristic edge probability $2p_x(1-p_x)$ expected if each edge endpoint's type were drawn independently from the population share $p_x$ of characteristic $X$; the comparison point used to test for {term}`homophily`. *Introduced in* [Homophily](week04/L04.01_homophily.ipynb).

shortest path
: In a {term}`weighted graph` with edge weights $w_{ab}$, the path between two nodes that minimizes the sum $\sum w_{ab}$ of weights along it, rather than the number of edges. *Introduced in* [Weighted Graphs](week04/L04.02_weighted_graphs.ipynb).

signed graph
: An undirected {term}`graph` where every {term}`edge` is labeled `+` (friends) or `-` (enemies); {term}`structural balance` analysis restricts attention to complete signed graphs. *Introduced in* [Structural Balance](week04/L04.03_structural_balance.ipynb).

spectral radius
: $r(A)\equiv\max\{|\lambda|:\lambda\in\sigma(A)\}$, the largest-magnitude {term}`eigenvalue` of $A$; governs convergence of $x_{t+1}=Ax_t$ and of the {term}`Neumann series lemma`. *Introduced in* [Production Networks](week05/L05.01_production_networks.ipynb).

strong tie
: A label on an {term}`edge` marking a close friendship, as opposed to a {term}`weak tie`. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

Strong Triadic Closure Property
: A node A violates this property if it has {term}`strong ties <strong tie>` to both B and C but there is no edge at all, strong or weak, between B and C; a node satisfies it if it never violates it. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

structural balance
: A complete {term}`signed graph` satisfies the Structural Balance Property if every set of three nodes has exactly one or three positive edges among them. *Introduced in* [Structural Balance](week04/L04.03_structural_balance.ipynb).

tree
: A {term}`connected graph` with no {term}`cycles <cycle>`; a tree on $N$ nodes has exactly $N-1$ edges, the minimum needed to stay connected. *Introduced in* [Graphs](week03/L03.01_graphs.ipynb).

triadic closure
: The empirical tendency for an edge B-C to form when edges A-B and A-C already exist — the open side of a {term}`triangle <triangle (graph)>` tends to close. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

triangle (graph)
: The smallest structure involving more than two {term}`nodes <node>`: three nodes joined by either two edges (open triangle) or three edges (closed triangle). *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

weak tie
: A label on an {term}`edge` marking an acquaintance rather than a close friendship. A {term}`local bridge` must be a weak tie. *Introduced in* [Strong and Weak Ties](week03/L03.02_strong_weak_ties.ipynb).

weighted graph
: A {term}`graph` in which each {term}`edge` carries a numeric weight denoting strength, rather than just presence or absence of a connection. *Introduced in* [Weighted Graphs](week04/L04.02_weighted_graphs.ipynb).
:::

## Agent-Based Models

:::{glossary}
agent (ABM)
: An autonomous, reactive entity in an {term}`agent-based model (ABM)` with its own {term}`agent state` at each time step, aware of that state and able to communicate select properties to other agents. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

agent state
: The current values of an {term}`agent <agent (ABM)>`'s properties at a given time step — e.g. position, happiness, wealth, citation count. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

agent-based model (ABM)
: A {term}`model` that specifies rules for how individual agents respond to their state and environment, rather than solving a global optimization problem. Built from three pieces: {term}`agents <agent (ABM)>`, an {term}`environment <environment (ABM)>`, and {term}`rules <rule (ABM)>`. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

Agents.jl
: A Julia library for building and running {term}`agent-based models <agent-based model (ABM)>`: agent macros, built-in environments like {term}`GridSpace`, schedulers that set agent activation order, and visualization/exploration tools. *Introduced in* [Schelling Model with Agents.jl](week06/L06.02_schelling_agents.ipynb).

calibration
: Fitting a {term}`model`'s parameters to match statistics observed in real data, rather than choosing them arbitrarily. *Introduced in* [Academic Paper Virality: An Agent-Based Model](week07/L07.02_abm_paper_virality.ipynb).

citation network
: A directed {term}`graph` where nodes are papers and an edge from paper A to paper B means A cites B; since papers can only cite earlier work, the graph has no cycles in time. *Introduced in* [Academic Paper Virality: An Agent-Based Model](week07/L07.02_abm_paper_virality.ipynb).

emergence
: A complex, often surprising aggregate pattern — or, at large enough scale, a qualitatively new capability — that arises from simple local rules or from scale, without being intended or designed by any individual part. Segregation in the {term}`Schelling segregation model` is the canonical example; new reasoning or tool-use abilities appearing once a language model crosses a size threshold are another. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

environment (ABM)
: The space an {term}`agent <agent (ABM)>` acts in — natural or artificial (a grid, a market, a network). Its properties can be fixed or varying, and agents can observe and respond to them. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

equation-based model
: A {term}`model` that describes each agent's decision-making with equations, typically a constrained optimization problem, plus equations for how agents interact. Precise but hard to calibrate at scale. Contrast with {term}`agent-based model (ABM)`. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

GridSpace
: A grid-based {term}`environment <environment (ABM)>` in Agents.jl where each agent occupies a cell and has `nearby_agents` it can interact with; the grid can be bounded or periodic (opposite edges wrap around, like Pac-Man). *Introduced in* [Schelling Model with Agents.jl](week06/L06.02_schelling_agents.ipynb).

heterogeneity
: Variation across {term}`agents <agent (ABM)>` in properties or behavior. {term}`Agent-based models <agent-based model (ABM)>` capture heterogeneity directly, which is why individual differences, not just population averages, can drive social outcomes. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

model
: A simplified mathematical object — equations, rules, or distributional assumptions — that approximates a real-world system well enough to reason about it. A model describes how likely different outcomes are, not one exact outcome. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

money model
: A minimal {term}`agent-based model (ABM)` with no {term}`environment <environment (ABM)>`: $N$ agents each start with 1 unit of wealth, and each step an agent with wealth gives 1 unit to a randomly chosen agent. Despite the symmetric rule, wealth concentrates into a {term}`power law` after a few steps. Also called the wealth exchange model. *Introduced in* [Agent Based Models Review/Practice](week07/L07.01_abm_money.ipynb).

path dependence
: The property that history and timing shape outcomes: small early differences — who acts first, an early lead in adoption or citations — can compound into large differences later. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

power law
: A distribution where a small number of agents hold a disproportionately large share of some quantity (wealth, citations) while most agents have very little — the "rich get richer" pattern. *Introduced in* [Agent Based Models Review/Practice](week07/L07.01_abm_money.ipynb).

preferential attachment
: A selection rule where agents, papers, or nodes with more existing connections or citations are more likely to gain new ones — "rich get richer." Drives the citation counts in the paper-virality model. *Introduced in* [Academic Paper Virality: An Agent-Based Model](week07/L07.02_abm_paper_virality.ipynb).

rule (ABM)
: The equations or functions that update an {term}`agent <agent (ABM)>`'s state between time steps $t$ and $t+1$. Shared across agents of a type but applied to each agent's own state, often involving neighbors or randomness. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

Schelling segregation model
: An {term}`agent-based model (ABM)`, proposed by Thomas Schelling in 1969, where agents of two types live on a grid and relocate if fewer than a threshold share of their neighbors share their type. Mild individual preferences produce strong neighborhood segregation, a classic case of {term}`emergence`. *Introduced in* [Agent Based Models](week06/L06.01_abm_concepts.ipynb).

sleeping beauty
: In the paper-virality model, a paper that is cited rarely at first but accumulates citations later — the opposite pattern from a {term}`viral paper`. *Introduced in* [Academic Paper Virality: An Agent-Based Model](week07/L07.02_abm_paper_virality.ipynb).

step function
: The function(s) that advance an {term}`agent-based model (ABM)` by one time step: `agent_step!` defines how a single agent updates itself, while `step!`/`run!` apply it (and any `model_step!`) across all agents and collect data. *Introduced in* [Schelling Model with Agents.jl](week06/L06.02_schelling_agents.ipynb).

viral paper
: In the paper-virality model, a paper whose citation count grows quickly early in its life, in contrast to a {term}`sleeping beauty`. *Introduced in* [Academic Paper Virality: An Agent-Based Model](week07/L07.02_abm_paper_virality.ipynb).
:::

## Game Theory

:::{glossary}
all-pay auction
: An {term}`auction` format in which every bidder pays their bid regardless of outcome, but only the highest bidder wins the item. Also satisfies {term}`revenue equivalence`. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

auction
: A market mechanism between one seller and many buyers in which rules determine how buyers signal willingness to pay, used especially when a good's {term}`valuation` is private. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

backward induction
: The method for solving a {term}`dynamic game`'s {term}`extensive form` by reasoning from the last decision nodes back to the first, determining each player's optimal choice given what happens afterward. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).

best response
: The action for a {term}`player` that yields the highest {term}`payoff` given the strategy, or belief about the strategy, of the other players. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

bid shading
: Bidding below one's true {term}`valuation`, as is optimal in a {term}`first-price auction`, trading off the risk of losing against the size of the payoff from winning. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

bimatrix
: For an $N$-player {term}`game` with $N_i$ strategies each, an array holding every player's {term}`payoff` directly in each cell, avoiding the separate-{term}`payoff matrix`-per-player bookkeeping. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

Braess' paradox
: The counterintuitive result that adding capacity, a new link, to a network can make the {term}`Nash equilibrium` outcome worse for everyone. *Introduced in* [Network Traffic with Game Theory](week08/L08.02_network_traffic.ipynb).

commitment
: The ability of a {term}`player` to credibly bind themselves to a stated {term}`strategy` before others act, which can change what other players rationally do in response. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).

credible
: A strategy or threat that a player would actually be willing to carry out if called upon, as opposed to one that is part of a {term}`Nash equilibrium` on paper but irrational to execute. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).

dominant strategy
: A {term}`strategy` that is a {term}`best response` no matter what the other players do; strictly dominant if it is always strictly better than every alternative. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

Dutch auction
: A descending-price {term}`auction`: price starts high and falls until a bidder accepts the current price, ending the auction there. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

dynamic game
: A {term}`game` in which players make choices sequentially, at different known times, rather than simultaneously. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).

English auction
: An ascending-price {term}`auction`: the auctioneer calls increasingly higher prices, bidders indicate willingness to pay, and it ends when no one outbids the current highest bid. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

expected payoff
: A player's {term}`payoff` averaged over the probabilities implied by a {term}`mixed strategy`, e.g. $p_1(H\mid q)=-1\cdot q+1\cdot(1-q)$ for player 1 facing opponent mix $q$. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).

extensive form
: A representation of a {term}`dynamic game` as a tree, where nodes are decision points and branches are the actions available at each node. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).

first-price auction
: A sealed-bid {term}`auction` where all bidders submit bids simultaneously; the highest bidder wins and pays the amount of their own bid. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

game
: A description of a strategic environment: a finite set of $N$ {term}`players <player>`, a feasible action set $S_i$ for each, and a payoff function $p_i:\Sigma\to\mathbb{R}$ for each. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

game theory
: The study of strategic interaction: how decision-makers choose when each one's {term}`payoff` depends on what the others do. A {term}`game` writes such a situation down precisely. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

indifference
: The requirement that, in a {term}`mixed strategy` {term}`Nash equilibrium`, every {term}`pure strategy` a player mixes over yields the same {term}`expected payoff`; otherwise the player would switch entirely to the better one. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).

iterated deletion of dominated strategies
: An algorithm that repeatedly removes, for each player, any {term}`strategy` dominated given the opponents' remaining strategies, until a unique profile (a {term}`Nash equilibrium`) or an empty set remains. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

mixed strategy
: A probability distribution over a {term}`player`'s set of {term}`pure strategies <pure strategy>`, $\sigma_i\in\triangle(S_i)\subseteq[0,1]^{M_i}$; a pure strategy is the degenerate special case. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

Nash equilibrium
: A strategy profile $\sigma$ such that each player's $\sigma_i$ is a {term}`best response` to everyone else's $\sigma_{-i}$; no player wants to unilaterally deviate. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

payoff
: The numerical reward $p_i(\sigma)$ a {term}`player` receives for a given outcome $\sigma$ of the {term}`game`. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

payoff matrix
: A matrix $P_i\in\mathbb{R}^{M_1\times M_2}$ giving player $i$'s {term}`payoff` for each combination of the two players' actions; row $i$ is player 1's action, column $j$ is player 2's. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

player
: One of the $N$ decision-makers in a {term}`game`, each with their own action set and payoff function. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

price of anarchy
: The ratio $\text{PoA}=\dfrac{\text{Worst Nash Equilibrium Cost}}{\text{Social Optimum Cost}}$, measuring how much self-interested behavior degrades outcomes compared to central coordination. *Introduced in* [Network Traffic with Game Theory](week08/L08.02_network_traffic.ipynb).

pure strategy
: Choosing one action outright with certainty, as opposed to randomizing over actions with a {term}`mixed strategy`. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

revelation principle
: The principle that, to derive optimal bidding, attention can be restricted to strategies derived directly from a bidder's true {term}`valuation`, since such a strategy's expected payoff is at least as good as one based on any other value. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

revenue equivalence
: The result that, under equilibrium bidding, a seller's expected revenue is the same across {term}`first-price auction`, {term}`second-price auction`, and {term}`all-pay auction` formats. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

second-price auction
: A sealed-bid {term}`auction`, also called a Vickrey auction, where all bidders submit bids simultaneously; the highest bidder wins but pays the amount of the second-highest bid. {term}`Truth-telling <truth-telling>` is a weakly dominant strategy here. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

social optimum
: The outcome a {term}`social planner` would choose — the one maximizing total {term}`social welfare` — as opposed to the possibly worse outcome reached at a {term}`Nash equilibrium`. *Introduced in* [Network Traffic with Game Theory](week08/L08.02_network_traffic.ipynb).

social planner
: A hypothetical authority that chooses actions for all agents to maximize {term}`social welfare`, rather than letting each agent act in their own self-interest. *Introduced in* [Network Traffic with Game Theory](week08/L08.02_network_traffic.ipynb).

social welfare
: The aggregate, summed {term}`payoff` across all players in a {term}`game`. *Introduced in* [Network Traffic with Game Theory](week08/L08.02_network_traffic.ipynb).

strategy
: A {term}`player`'s choice from their feasible action set $S_i$; in a {term}`dynamic game`, a complete plan of action at every decision point. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

support enumeration
: An algorithm (used by `GameTheory.jl`'s `support_enumeration`) that computes every {term}`Nash equilibrium` of a {term}`game`, pure or mixed. *Introduced in* [Game Theory 1](week08/L08.01_game_theory_intro.ipynb).

truth-telling
: Bidding exactly one's true {term}`valuation`, $b_i=v_i$; a weakly dominant strategy in a {term}`second-price auction`. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

valuation
: A bidder's private dollar value for winning the auctioned item, $v_i$. *Introduced in* [Auctions](week09/L09.03_auctions.ipynb).

zero-sum game
: A {term}`game` in which the payoffs of all players always sum to zero — one player's gain is exactly another's loss. *Introduced in* [More Game Theory](week09/L09.01_mixed_strategies.ipynb).
:::

## Platforms and Marketplaces

:::{glossary}
access fee
: A charge for joining a {term}`platform`, paid regardless of how many interactions follow. Contrast with {term}`usage fee`. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

adverse selection
: When hidden quality lowers what buyers will pay, the best sellers leave first, which lowers average quality and prices further. The "market for lemons" is the classic case. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

behavioral externality
: An uncompensated effect of what a participant *does* on others, such as fraud, harassment, or no-shows, as opposed to a {term}`network effect` from merely participating. Platforms govern these with screening, rules, ratings, and expulsion. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

blocking pair
: A pair $(d,h)$, from opposite sides of a matching market, such that $d$ prefers $h$ to its current match and $h$ prefers $d$ to its current match — both would rather abandon the matching and pair with each other. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

chicken-and-egg problem
: The platform-launch problem in which neither side will join without the other already present — diners won't carry a card few restaurants accept, restaurants won't accept a card few diners carry. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

competitive bottleneck
: The pattern where platforms court the side that {term}`single-homes <single-homing>` and tax the side that {term}`multihomes <multihoming>`, because access to single-homers is what rival platforms compete over. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

constricted set
: A group of buyers whose preferred sellers, taken together, number fewer than the buyers. Its presence is exactly what rules out a perfect matching. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

critical mass
: The unstable middle {term}`fulfilled-expectations equilibrium`: below it, adoption collapses toward zero; above it, feedback pushes adoption toward the high equilibrium. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

critical mass frontier
: For a two-sided platform, the curve of participation pairs separating starting points that grow toward high adoption from those that collapse. With two sides, {term}`critical mass` is a curve, not a number. *Introduced in* [Ignition: Chicken-and-Egg, Lock-In, and Tipping](week10/L10.02_ignition_and_tipping.ipynb).

cross-side externality
: The effect a price change on one side of a {term}`two-sided market` has on the other side's value through shared volume: raising $p_B$ loses buyer sales directly *and* reduces every seller's completed transactions, even though no seller left. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

cross-side network effect
: A {term}`network effect` running from one group to another: more drivers improve service for riders, more riders create earnings for drivers. The feedback can reinforce itself across sides. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

deferred acceptance
: Gale and Shapley's algorithm: unmatched proposers propose to their best remaining choice each round; receivers tentatively hold their best offer and reject the rest; the process always terminates at a {term}`stable matching`. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

equilibrium selection
: The problem of which {term}`Nash equilibrium` a coordination game settles into when more than one exists, e.g. choosing between everyone joining and everyone staying out in the {term}`chicken-and-egg problem`. *Introduced in* [Ignition: Chicken-and-Egg, Lock-In, and Tipping](week10/L10.02_ignition_and_tipping.ipynb).

fulfilled-expectations equilibrium
: An adoption level $n^*$ at which expected and realized network size agree: $n^*=g(n^*;p)$. Expectations determine adoption; adoption then confirms or contradicts the expectation. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

increasing returns
: A dynamic in which a platform's attractiveness grows more than proportionally with its installed base, modeled as adoption probability $P(A\mid t)=n_A(t)^\gamma/(n_A(t)^\gamma+n_B(t)^\gamma)$ with $\gamma>1$. *Introduced in* [Ignition: Chicken-and-Egg, Lock-In, and Tipping](week10/L10.02_ignition_and_tipping.ipynb).

lock-in
: The outcome in which later adopters rationally follow a lead created by earlier, possibly random, accidents, so a market settles on one {term}`platform` even absent a quality difference. *Introduced in* [Ignition: Chicken-and-Egg, Lock-In, and Tipping](week10/L10.02_ignition_and_tipping.ipynb).

market-clearing prices
: Prices at which the {term}`preferred-seller graph` contains a perfect matching, so every buyer can get a house they most prefer. The resulting assignment maximizes total valuation. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

matchmaker
: What a {term}`platform` is: an intermediary whose product is the connection itself, since each side joins partly because the other side is there. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

membership externality
: A cross-side effect that works through the decision to join: when a platform charges to join, each member's demand depends directly on how many members the other side has. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

multihoming
: Participating on more than one {term}`platform` at once (e.g. riders install both Uber and Lyft). Multihoming weakens the feedback that locks a market into one winner and shapes who a platform subsidizes under a {term}`competitive bottleneck`. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

network effect
: One participant's presence changing another participant's value from joining a network. Splits into a {term}`same-side network effect` (within a group) and a {term}`cross-side network effect` (across groups). *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

pipe
: A business that creates value by transforming inputs into outputs along one production chain, so no participant's value depends on who else shows up. Contrast with {term}`platform`. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

platform
: A business that creates value by connecting two or more distinct groups who need each other, rather than by transforming inputs into outputs along one chain. Contrast with {term}`pipe`. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

preferred-seller graph
: At given prices, the bipartite graph linking each buyer to every seller that gives that buyer the highest nonnegative payoff, value minus price. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

price level
: How much a {term}`platform` collects in total across both sides of an interaction, $p_B+p_S$. Contrast with {term}`price structure`. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

price structure
: How a {term}`platform`'s total price is divided between sides. Holding the {term}`price level` fixed, changing the split can still change participation because of a {term}`cross-side network effect`. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

proposer-optimality
: The property that the side that proposes in {term}`deferred acceptance` ends up with its best outcome among all {term}`stable matchings <stable matching>` — the choice of who proposes is itself a form of market power. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

repugnant market
: A market, such as organ transplants, where using prices to clear supply and demand is illegal or socially unacceptable, motivating {term}`stable matching`-based market design instead of pricing. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

same-side network effect
: A {term}`network effect` running among participants in the same group; can be positive (more gamers, more fun) or negative (more riders, more congestion). *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

single-homing
: Participating on only one {term}`platform`. Contrast with {term}`multihoming`; single-homers are the users platforms court with low or negative prices under a {term}`competitive bottleneck`. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

stable matching
: A matching $\mu$ pairing each member of one side with one of the other side such that it contains no {term}`blocking pair`. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

strategy-proofness
: The property that truthful preference reporting is a dominant strategy for the proposing side in {term}`deferred acceptance`. *Introduced in* [Matching Markets: When Prices Can't Do the Job](week11/L11.02_matching_markets.ipynb).

threshold adoption rule
: A diffusion model where node $i$ adopts once at least a fraction $\tau$ of its neighbors have adopted: $\sum_{j\in N(i)}a_j(t)/|N(i)|\ge\tau$. Shows how network topology, not just seed count, shapes {term}`critical mass`. *Introduced in* [Ignition: Chicken-and-Egg, Lock-In, and Tipping](week10/L10.02_ignition_and_tipping.ipynb).

tipping
: Self-reinforcing movement of adoption toward a high, or low, equilibrium once {term}`critical mass` is crossed. *Introduced in* [Platforms and Matchmakers](week10/L10.01_platform_economics.ipynb).

two-sided market
: A market in which a {term}`platform`'s profit depends on participation from two distinct groups whose demands interact, formalized by the Rochet-Tirole model $\pi(p_B,p_S)=(p_B+p_S-c)D_B(p_B)D_S(p_S)$. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

usage externality
: A cross-side effect that works through the number of transactions: with per-interaction prices, each side's willingness to transact depends only on its own price, and the other side matters because volume is the product of the two. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

usage fee
: A charge per interaction on a {term}`platform`. Rewards make it negative. Contrast with {term}`access fee`. *Introduced in* [Platform Pricing: Who Pays, Who Gets Paid](week11/L11.01_platform_pricing.ipynb).

winner-take-all
: The prediction that strong {term}`network effects <network effect>` concentrate an entire market on a single {term}`platform`. Not automatic: {term}`multihoming` and local network effects can break it. *Introduced in* [Ignition: Chicken-and-Egg, Lock-In, and Tipping](week10/L10.02_ignition_and_tipping.ipynb).
:::

## AI Agents

:::{glossary}
AI agent
: An {term}`LLM <large language model, LLM>` wrapped with a role, {term}`system prompt`, memory, and often tools, that pursues a task rather than just answering one prompt. Distinct from the {term}`agent <agent (ABM)>` of the Agent-Based Models unit, which follows fixed rules rather than reasoning with an LLM. *Introduced in* [From Rule-Based to Learning Agents](weekA01/L.A1.01_from_rule_based_to_learning_agents.ipynb).

chain-of-thought reasoning
: Asking a model to show its reasoning steps before answering; each step becomes context for the next and improves accuracy on complex tasks. *Introduced in* [From Rule-Based to Learning Agents](weekA01/L.A1.01_from_rule_based_to_learning_agents.ipynb).

chunking
: Splitting a document into smaller, focused pieces before {term}`embedding`, so retrieval can return precise passages instead of whole documents. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).

confused deputy
: A security failure where an {term}`AI agent` has legitimate tool access but is tricked, via injected instructions, into using it on the attacker's behalf instead of the user's. *Introduced in* [Security for AI Agents: The Lethal Trifecta](weekA03/L.A03.02_ai_agent_security.ipynb).

context window
: The maximum number of {term}`tokens <token>` an LLM can see at once, its working memory. Long conversations eventually fall outside it. *Introduced in* [From Rule-Based to Learning Agents](weekA01/L.A1.01_from_rule_based_to_learning_agents.ipynb).

cosine similarity
: A similarity score between two vectors, $\cos(\mathbf{a},\mathbf{b})=\dfrac{\mathbf{a}\cdot\mathbf{b}}{\lVert\mathbf{a}\rVert\,\lVert\mathbf{b}\rVert}$, ranging from $-1$ to $1$; used to rank {term}`embeddings <embedding>` by meaning. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).

dependency injection
: Passing an {term}`AI agent`'s external resources — database, API keys, config — in explicitly at run time rather than hard-coding them, so tools stay testable and swappable. *Introduced in* [Type-Safe Agent Development with PydanticAI Patterns](weekA02/L.A2.02_type_safe_agents_pydantic_patterns.ipynb).

deterministic evaluator
: A code-based check with a clear pass/fail rule — exact match, type check, format validation — used in an {term}`evaluation` when correctness is objective. *Introduced in* [Evaluating AI Systems: Testing Agents at Scale](weekA02/L.A02.03_evaluations.ipynb).

dual LLM pattern
: A defense that splits an agent into a privileged LLM, which has tools but never sees untrusted data, and a quarantined LLM, which sees untrusted data but has no tools, connected only by clean symbolic references. *Introduced in* [Security for AI Agents: The Lethal Trifecta](weekA03/L.A03.02_ai_agent_security.ipynb).

embedding
: A function $f:\text{Text}\to\mathbb{R}^d$ mapping text to a vector so that texts with similar meaning land close together. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).

evaluation
: Systematic testing of a non-deterministic AI system: a dataset of cases run through the system and scored by evaluators, analogous to a test suite. Also called evals. *Introduced in* [Evaluating AI Systems: Testing Agents at Scale](weekA02/L.A02.03_evaluations.ipynb).

hallucination
: An {term}`LLM <large language model, LLM>` generating confident, plausible-sounding text that is factually wrong — most dangerous when it invents citations or data. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).

in-context learning
: Teaching an {term}`LLM <large language model, LLM>` a new task by showing examples directly in the {term}`prompt`, with no retraining needed. Also called few-shot prompting. *Introduced in* [From Rule-Based to Learning Agents](weekA01/L.A1.01_from_rule_based_to_learning_agents.ipynb).

indirect prompt injection
: {term}`Prompt injection <prompt injection>` hidden inside external content an agent processes — an email, a web page, a GitHub issue — rather than typed directly by the user; the dangerous, hard-to-detect form. *Introduced in* [Security for AI Agents: The Lethal Trifecta](weekA03/L.A03.02_ai_agent_security.ipynb).

JSON Schema
: A structured, machine-readable description of a function's name, purpose, and parameters that tells an {term}`LLM <large language model, LLM>` how to call it correctly. *Introduced in* [Function Calling and Tool Use: From Talk to Action](weekA02/L.A2.01_function_calling_and_tools.ipynb).

knowledge cutoff
: The date after which an {term}`LLM <large language model, LLM>` has seen no training data, so it cannot know later events, papers, or statistics. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).

large language model, LLM
: A neural network trained to predict the next token in a sequence. At scale this simple objective produces a general-purpose reasoning engine. *Introduced in* [From Rule-Based to Learning Agents](weekA01/L.A1.01_from_rule_based_to_learning_agents.ipynb).

lethal trifecta
: The combination of access to private data, exposure to untrusted content, and the ability to exfiltrate data in one {term}`AI agent`; each is fine alone, but all three together make data theft near-inevitable. *Introduced in* [Security for AI Agents: The Lethal Trifecta](weekA03/L.A03.02_ai_agent_security.ipynb).

LLM-as-judge
: Using a second {term}`LLM <large language model, LLM>` to score an output against a rubric when correctness is subjective, such as tone or faithfulness, rather than exact-match checkable. *Introduced in* [Evaluating AI Systems: Testing Agents at Scale](weekA02/L.A02.03_evaluations.ipynb).

MCP server
: A process, built with e.g. FastMCP, that exposes a set of tools, resources, and prompts over the {term}`MCP <Model Context Protocol, MCP>` for any compatible client to call. *Introduced in* [Building Agent Tools with FastMCP](weekA03/L.A03.01_MCP_with_fastmcp.ipynb).

Model Context Protocol, MCP
: A standard protocol, "USB-C for AI," for exposing tools, resources, and prompts to any AI client, so a tool is written once and used by many agents and apps. *Introduced in* [Building Agent Tools with FastMCP](weekA03/L.A03.01_MCP_with_fastmcp.ipynb).

multi-agent system
: A collection of {term}`AI agents <AI agent>`, each with a distinct role, that communicate to solve problems no single agent could solve alone. *Introduced in* [Multi-Agent Conversations and Emergent Collaboration](weekA01/L.A1.03_multi_agent_conversations.ipynb).

parametric knowledge
: What an {term}`LLM <large language model, LLM>` "knows" from training, encoded in its weights — fast and broad, but frozen at training time and prone to {term}`hallucination`. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).

principle of least privilege
: Giving an {term}`AI agent` only the minimum tools and data access it needs for its task — the core defensive design rule against excessive agency. *Introduced in* [Security for AI Agents: The Lethal Trifecta](weekA03/L.A03.02_ai_agent_security.ipynb).

prompt
: Natural-language instructions that tell an {term}`LLM <large language model, LLM>` what to do. Prompting is programming in natural language with probabilistic outcomes. *Introduced in* [From Rule-Based to Learning Agents](weekA01/L.A1.01_from_rule_based_to_learning_agents.ipynb).

prompt injection
: An attack where malicious text manipulates an {term}`LLM <large language model, LLM>` into ignoring its instructions and following the attacker's instead, because the model cannot distinguish trusted instructions from untrusted data. *Introduced in* [Security for AI Agents: The Lethal Trifecta](weekA03/L.A03.02_ai_agent_security.ipynb).

retrieval-augmented generation, RAG
: Augmenting an {term}`LLM <large language model, LLM>` with a retrieval step: search a knowledge base for relevant text, inject it as context, then generate an answer grounded in that text. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).

sandboxing
: Running agent-executed code or tools in an isolated environment with limited resources and no access to the host system, to contain damage if the agent is compromised. *Introduced in* [Function Calling and Tool Use: From Talk to Action](weekA02/L.A2.01_function_calling_and_tools.ipynb).

span-based evaluation
: Checking an {term}`AI agent`'s execution trace — which tools it called, in what order — rather than just its final output, to catch right answers reached the wrong way. *Introduced in* [Evaluating AI Systems: Testing Agents at Scale](weekA02/L.A02.03_evaluations.ipynb).

spotlighting
: A defense that wraps untrusted content in explicit markers and instructs the model never to follow instructions found inside them. *Introduced in* [Security for AI Agents: The Lethal Trifecta](weekA03/L.A03.02_ai_agent_security.ipynb).

structured output
: Forcing an {term}`LLM <large language model, LLM>`'s response to conform to a predefined schema, e.g. a Pydantic model, instead of free text, so the result is guaranteed parseable and valid. *Introduced in* [Type-Safe Agent Development with PydanticAI Patterns](weekA02/L.A2.02_type_safe_agents_pydantic_patterns.ipynb).

system prompt
: The instructions that set an {term}`AI agent`'s persistent role and behavior, separate from the per-turn user message. *Introduced in* [Multi-Agent Conversations and Emergent Collaboration](weekA01/L.A1.03_multi_agent_conversations.ipynb).

token
: The unit an {term}`LLM <large language model, LLM>` predicts and consumes, roughly a word piece. {term}`Context windows <context window>` and API costs are measured in tokens. *Introduced in* [From Rule-Based to Learning Agents](weekA01/L.A1.01_from_rule_based_to_learning_agents.ipynb).

tool use
: Giving an {term}`LLM <large language model, LLM>` access to external functions it can invoke, described to it via a {term}`JSON Schema`, so it can act instead of just generating text. Also called function calling. *Introduced in* [Function Calling and Tool Use: From Talk to Action](weekA02/L.A2.01_function_calling_and_tools.ipynb).

type safety
: Validating every input and output against a defined schema before it is used, so invalid data is rejected immediately instead of corrupting state downstream. Also called validation-first development. *Introduced in* [Type-Safe Agent Development with PydanticAI Patterns](weekA02/L.A2.02_type_safe_agents_pydantic_patterns.ipynb).

vector store
: A system that stores {term}`embeddings <embedding>` alongside their source text and supports fast similarity search over them. Also called a vector database. *Introduced in* [Retrieval-Augmented Generation: Augmenting AI with External Knowledge](weekA01/L.A1.02_rag_pattern_augmented_knowledge.ipynb).
:::

# Markov Chain code
using LinearAlgebra

struct MarkovChain{T}
    P::Matrix{Float64}
    initial_state::Vector{Float64}
    state_values::Vector{T}

    P_dists::Vector{Vector{Float64}}
end

function MarkovChain(P::Matrix{Float64}, initial_state::Vector{Float64}, state_values::Vector{T}) where T
    P_dists = [cumsum(row) for row in eachrow(P)]
    return MarkovChain{T}(P, initial_state, state_values, P_dists)
end

function simulate_indices(mc::MarkovChain, n_steps::Int)
    init_dist = cumsum(mc.initial_state)
    states = Vector{Int}(undef, n_steps)
    states[1] = searchsortedfirst(init_dist, rand())
    for i in 2:n_steps
        states[i] = searchsortedfirst(mc.P_dists[states[i-1]], rand())
    end
    return states
end

function simulate_values(mc::MarkovChain{T}, n_steps::Int)::Vector{T} where T
    states = simulate_indices(mc, n_steps)
    return mc.state_values[states]
end

function Base.rand(mc::MarkovChain{T}, n_steps::Int)::Vector{T} where T
    simulate_values(mc, n_steps)
end

function stationary_distributions(mc::MarkovChain)
    eig = eigen(mc.P')
    out = Vector{Float64}[]
    for i in 1:size(mc.P, 1)
        if eig.values[i] == 1
            vec = eig.vectors[:, i]
            vec = vec ./ sum(vec)
            push!(out, vec)
        end
    end
    return out
end

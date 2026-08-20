# Markov Chain code
import numpy as np


class MarkovChain:
    def __init__(self, P, initial_state, state_values):
        self.P = np.asarray(P, dtype=float)
        self.initial_state = np.asarray(initial_state, dtype=float)
        self.state_values = list(state_values)
        self.P_dists = np.cumsum(self.P, axis=1)


def simulate_indices(mc, n_steps):
    init_dist = np.cumsum(mc.initial_state)
    states = np.empty(n_steps, dtype=int)
    states[0] = np.searchsorted(init_dist, np.random.rand())
    for i in range(1, n_steps):
        states[i] = np.searchsorted(mc.P_dists[states[i - 1]], np.random.rand())
    return states


def simulate_values(mc, n_steps):
    states = simulate_indices(mc, n_steps)
    return [mc.state_values[i] for i in states]


def rand(mc, n_steps):
    # Draw `n_steps` values from the chain
    return simulate_values(mc, n_steps)


def stationary_distributions(mc):
    eigvals, eigvecs = np.linalg.eig(mc.P.T)
    out = []
    for i in range(mc.P.shape[0]):
        if np.isclose(eigvals[i], 1):
            vec = eigvecs[:, i].real
            vec = vec / vec.sum()
            out.append(vec)
    return out

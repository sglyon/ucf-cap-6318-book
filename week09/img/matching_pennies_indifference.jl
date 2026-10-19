#!/usr/bin/env julia
#
# matching_pennies_indifference.jl
#
# Reproduces the figure embedded in week09/L09.01_mixed_strategies.ipynb,
# cell "Comment" (right after the indifference argument, before the P1
# exercise). It shows P1's expected payoff from each pure strategy as a
# function of q, the probability P2 assigns to playing H.
#
# From the lecture text, with P2 playing H w.p. q and T w.p. (1-q):
#   p1(H | q) = -1*q + 1*(1-q) = 1 - 2q
#   p1(T | q) =  1*q - 1*(1-q) = 2q - 1
#
# The two lines cross at q = 1/2, payoff 0: this is exactly the
# indifference condition 1 - 2q = 2q - 1 solved in the preceding markdown
# cell, so the crossing point is the mixed-strategy equilibrium value of q.
#
# This script makes no network calls, installs no packages, and uses only
# the repository-root Julia environment (CairoMakie is already a declared
# dependency there). Run it from the repository root with:
#
#   julia --project=. week09/img/matching_pennies_indifference.jl
#
# It writes matching_pennies_indifference.svg next to this file (located via
# @__DIR__, so the working directory at invocation time does not matter).

using CairoMakie

# --- payoff functions, matching the formulas quoted in the notebook -------
payoff_H(q) = 1 - 2q      # p1(H | q) = -1*q + 1*(1-q)
payoff_T(q) = 2q - 1      # p1(T | q) =  1*q - 1*(1-q)

# Sanity check the indifference point referenced in the surrounding text
# (q = 1/2 makes P1 indifferent between H and T, with payoff 0).
@assert isapprox(payoff_H(0.5), payoff_T(0.5); atol=1e-12)
@assert isapprox(payoff_H(0.5), 0.0; atol=1e-12)

q = range(0, 1; length=201)

# House palette (Tailwind colors used throughout week04/week05/week08 SVGs):
# blue for P1's H strategy, amber for P1's T strategy (game-theory primary),
# slate for text/axes, muted gray for gridlines/reference marks.
blue = "#3B82F6"
amber = "#F59E0B"
slate = "#1E293B"
muted = "#94A3B8"

fig = Figure(size=(900, 520), fontsize=16, backgroundcolor=:white)

ax = Axis(
    fig[1, 1],
    title="P1's Expected Payoff vs. P2's Mixing Probability q",
    xlabel="P2 plays H with probability q",
    ylabel="P1's expected payoff",
    titlesize=20,
    titlecolor=slate,
    xlabelsize=15,
    ylabelsize=15,
    xticks=0:0.25:1,
    limits=(0, 1, -1.15, 1.15),
)

lines!(ax, q, payoff_H.(q); color=blue, linewidth=3, label="P1 plays H:  1 - 2q")
lines!(ax, q, payoff_T.(q); color=amber, linewidth=3, label="P1 plays T:  2q - 1")

# Reference lines/marker at the indifference crossing (q = 1/2, payoff 0)
vlines!(ax, [0.5]; color=muted, linestyle=:dash, linewidth=1.5)
hlines!(ax, [0.0]; color=muted, linestyle=:dash, linewidth=1.5)
scatter!(ax, [0.5], [0.0]; color=slate, markersize=14, strokewidth=1.5, strokecolor=:white)

# Crossing label lives in the clear whitespace above the X formed by the two
# lines, connected to the marker by a thin vertical leader (safe because the
# two lines only coincide with x = 0.5 exactly at the marker itself).
text!(
    ax, 0.56, 0.65;
    text="q = 1/2:\nP1 indifferent",
    fontsize=13, color=slate, align=(:left, :bottom),
)
lines!(ax, [0.5, 0.5], [0.58, 0.06]; color=slate, linewidth=1, linestyle=:dot)

# Preferred-action regions: short single-line labels tucked into the top
# corners (y = 1.08, inside the y-limits of ±1.15), clear of both lines.
text!(ax, 0.08, 1.08; text="P1 prefers H", fontsize=13, color=blue, align=(:left, :bottom))
text!(ax, 0.92, 1.08; text="P1 prefers T", fontsize=13, color=amber, align=(:right, :bottom))

axislegend(ax; position=:cb, framevisible=true, labelsize=13)

outpath = joinpath(@__DIR__, "matching_pennies_indifference.svg")
save(outpath, fig)
println("Saved figure to: ", outpath)

# %%
import Pkg

Pkg.activate(".")

Pkg.instantiate()

# %%
using Agents, InteractiveDynamics, GLMakie

# %%
@agent SchellingAgent GridAgent{2} begin
    is_happy::Bool      # whether the agent is happy in its position. (true = happy)
    group::Int          # The group of the agent, determines mood as it interacts with neighbors 0: blue, 1: orange
end

function agent_step!(agent::SchellingAgent, model)
    want = model.wanted_neighbors
    have = 0
    for n in nearby_agents(agent, model)
        if n.group == agent.group
            have += 1
        end
    end
    agent.is_happy = have >= want
    if !agent.is_happy
        move_agent_single!(agent, model)
    end
    return
end


function init_schelling(; num_agents_per_group=250)
    environment = GridSpaceSingle((25, 25), periodic=false)
    properties = Dict(:wanted_neighbors => 4)
    model = ABM(SchellingAgent, environment; properties=properties)

    id = 0
    for group in 1:2, i in 1:num_agents_per_group
        agent = SchellingAgent(id += 1, (1, 1), false, group)
        add_agent_single!(agent, model)
    end
    model
end

groupcolor(a) = a.group == 1 ? :blue : :orange
groupmarker(a) = a.group == 1 ? :circle : :rect

# %%
function make_video()
    model = init_schelling()
    abmvideo(
        "schelling.mp4", model, agent_step!;
        ac=groupcolor, am=groupmarker, as=10,
        framerate=4, frames=20,
        title="Schelling's segregation model"
    )
end

# %%
function make_app()
    model = init_schelling()
    adata = [(:is_happy, sum)]
    alabels = ["n_happy"]
    parameter_range = Dict(:wanted_neighbors => 0:8)
    figure, abmobs = abmexploration(
        model;
        ac=groupcolor, am=groupmarker, as=10,
        adata, alabels, agent_step!,
        (model_step!)=dummystep, params=parameter_range
    )
    figure
end

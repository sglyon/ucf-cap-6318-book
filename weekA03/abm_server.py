
from fastmcp import FastMCP
from mesa import Agent, Model
from mesa.time import RandomActivation
from mesa.space import SingleGrid
from mesa.datacollection import DataCollector
from typing import Dict, Any
import random

abm_mcp = FastMCP("AgentBasedModels")
abm_cache: Dict[str, Any] = {}

class SchellingAgent(Agent):
    def __init__(self, unique_id, model, agent_type):
        super().__init__(unique_id, model)
        self.type = agent_type

    def step(self):
        neighbors = self.model.grid.get_neighbors(self.pos, moore=True, include_center=False)
        similar = sum(1 for n in neighbors if n.type == self.type)
        total = len(neighbors)
        if total > 0 and (similar / total) < self.model.homophily:
            self.model.grid.move_to_empty(self)

class SchellingModel(Model):
    def __init__(self, width=20, height=20, density=0.8, minority_pc=0.2, homophily=3):
        super().__init__()
        self.homophily = homophily / 8
        self.schedule = RandomActivation(self)
        self.grid = SingleGrid(width, height, torus=True)
        n_agents = int(width * height * density)
        for i in range(n_agents):
            agent_type = 1 if random.random() < minority_pc else 0
            agent = SchellingAgent(i, self, agent_type)
            self.schedule.add(agent)
            self.grid.position_agent(agent, (random.randrange(width), random.randrange(height)))
        self.datacollector = DataCollector(model_reporters={"segregation": lambda m: self.measure_segregation(m)})

    @staticmethod
    def measure_segregation(model):
        similar_neighbors = total_neighbors = 0
        for agent in model.schedule.agents:
            neighbors = model.grid.get_neighbors(agent.pos, moore=True, include_center=False)
            if neighbors:
                similar_neighbors += sum(1 for n in neighbors if n.type == agent.type)
                total_neighbors += len(neighbors)
        return similar_neighbors / total_neighbors if total_neighbors > 0 else 0

    def step(self):
        self.datacollector.collect(self)
        self.schedule.step()

@abm_mcp.tool()
def create_schelling_model(
    model_id: str,
    width: int = 20,
    height: int = 20,
    density: float = 0.8,
    minority_percent: float = 0.2,
    homophily: int = 3
) -> Dict[str, Any]:
    """
    Create a Schelling segregation model.

    The Schelling model demonstrates how mild preferences for similar neighbors
    can lead to high levels of segregation.

    Args:
        model_id: Unique identifier for this model
        width: Grid width (default 20)
        height: Grid height (default 20)
        density: Fraction of cells occupied (0-1, default 0.8)
        minority_percent: Fraction of agents that are minority type (0-1, default 0.2)
        homophily: Number of similar neighbors desired (out of 8, default 3)

    Returns:
        Model configuration and initial state
    """
    model = SchellingModel(width, height, density, minority_percent, homophily)
    abm_cache[model_id] = model
    return {
        "model_id": model_id,
        "width": width,
        "height": height,
        "num_agents": len(model.schedule.agents),
        "initial_segregation": round(model.measure_segregation(model), 3)
    }

@abm_mcp.tool()
def step_model(
    model_id: str,
    num_steps: int = 1
) -> Dict[str, Any]:
    """
    Run the model for a specified number of steps.

    Args:
        model_id: ID of the model to step
        num_steps: Number of steps to run (default 1)

    Returns:
        Segregation metrics after stepping
    """
    model = abm_cache.get(model_id)
    if model is None:
        return {"error": f"Model '{model_id}' not found"}

    for _ in range(num_steps):
        model.step()

    df = model.datacollector.get_model_vars_dataframe()
    return {
        "model_id": model_id,
        "steps_completed": num_steps,
        "total_steps": len(df),
        "current_segregation": round(df['segregation'].iloc[-1], 3),
        "initial_segregation": round(df['segregation'].iloc[0], 3)
    }

print("✓ ABM MCP server created")

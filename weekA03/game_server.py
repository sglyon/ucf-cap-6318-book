
from fastmcp import FastMCP
import quantecon.game_theory as gt
import numpy as np
from typing import Dict, List, Any

game_mcp = FastMCP("GameTheory")

# Global cache for games (same pattern as network server)
game_cache: Dict[str, Any] = {}

@game_mcp.tool()
def create_game(
    game_id: str,
    payoff_matrix_p1: List[List[float]],
    payoff_matrix_p2: List[List[float]]
) -> Dict[str, Any]:
    """
    Create a two-player normal-form game.

    Args:
        game_id: Unique identifier for this game
        payoff_matrix_p1: Payoff matrix for Player 1 (rows = P1 strategies, cols = P2 strategies)
        payoff_matrix_p2: Payoff matrix for Player 2 (rows = P1 strategies, cols = P2 strategies)

    Returns:
        Game statistics and confirmation
    """
    # Convert to numpy arrays
    p1_payoffs = np.array(payoff_matrix_p1)
    p2_payoffs = np.array(payoff_matrix_p2)

    # Create game
    game = gt.NormalFormGame([p1_payoffs, p2_payoffs])

    # Store in global cache
    game_cache[game_id] = game

    return {
        "game_id": game_id,
        "num_players": 2,
        "p1_strategies": p1_payoffs.shape[0],
        "p2_strategies": p1_payoffs.shape[1],
        "message": f"Game '{game_id}' created successfully"
    }

@game_mcp.tool()
def find_pure_nash_equilibria(
    game_id: str
) -> Dict[str, Any]:
    """
    Find all pure strategy Nash equilibria in the game.

    A Nash equilibrium is a strategy profile where no player can improve
    by unilaterally changing their strategy.

    Args:
        game_id: ID of the game to analyze

    Returns:
        List of Nash equilibria (strategy profiles) and their payoffs
    """
    game = game_cache.get(game_id)

    if game is None:
        return {"error": f"Game '{game_id}' not found"}

    equilibria = game.pure_nash_brute()

    results = []
    for eq in equilibria:
        # eq is a tuple of strategy indices
        payoffs = [game.players[i].payoff_array[eq] for i in range(len(game.players))]
        results.append({
            "strategies": eq,
            "payoffs": [float(p) for p in payoffs]
        })

    return {
        "game_id": game_id,
        "num_equilibria": len(results),
        "equilibria": results
    }

@game_mcp.tool()
def check_not_dominated(
    game_id: str,
    player: int,
    strategy: int
) -> Dict[str, Any]:
    """
    Check if a strategy is not dominated for a player.

    A dominated strategy is one that always yields lower payoff than some other strategy.
    A not-dominated strategy may be part of a Nash equilibrium.

    Args:
        game_id: ID of the game
        player: Player number (0 or 1)
        strategy: Strategy index to check

    Returns:
        Whether the strategy is dominated and analysis
    """
    game = game_cache.get(game_id)

    if game is None:
        return {"error": f"Game '{game_id}' not found"}

    if player not in [0, 1]:
        return {"error": "Player must be 0 or 1"}

    is_dominated = game.players[player].is_dominated(strategy)

    return {
        "game_id": game_id,
        "player": player,
        "strategy": strategy,
        "is_dominated": bool(is_dominated),
        "is_not_dominated": not is_dominated,
        "explanation": "This strategy is dominated by another strategy" if is_dominated else "This strategy is not dominated and may be part of a Nash equilibrium"
    }

print("✓ Game Theory MCP server created with 3 tools")

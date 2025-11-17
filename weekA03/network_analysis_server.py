
# network_analysis_server.py
from fastmcp import FastMCP
import networkx as nx
from typing import Dict, List, Tuple, Any


# Global cache for persistent state across tool calls
# MCP Context is request-scoped, so we need external storage
# A simple dict works perfectly for our purposes
cache: Dict[str, Any] = {}


# Create network analysis server
network_mcp = FastMCP("NetworkAnalysis")


@network_mcp.tool()
def create_network(
    graph_id: str,
    edges: List[Tuple[int, int]]
) -> Dict[str, Any]:
    """
    Create a network from an edge list and store it.

    Args:
        graph_id: Unique identifier for this graph (e.g., 'social_network', 'graph1')
        edges: List of edges as [source, target] pairs. Example: [[1,2], [2,3], [1,3]]

    Returns:
        Dictionary with graph statistics (num_nodes, num_edges, density)
    """
    # Create NetworkX graph
    G = nx.Graph()
    G.add_edges_from(edges)

    # Store in global cache (persists across tool calls!)
    cache[f"graph:{graph_id}"] = G

    return {
        "graph_id": graph_id,
        "num_nodes": G.number_of_nodes(),
        "num_edges": G.number_of_edges(),
        "density": round(nx.density(G), 4)
    }


@network_mcp.tool()
def calculate_degree_centrality(
    graph_id: str,
    node: int
) -> Dict[str, Any]:
    """
    Calculate degree centrality for a node.

    Degree centrality measures how many connections a node has.
    Higher values indicate more central/connected nodes.

    Args:
        graph_id: ID of the graph to analyze
        node: The node ID to calculate centrality for

    Returns:
        Dictionary with degree and normalized centrality value
    """
    # Retrieve graph from global cache
    G = cache.get(f"graph:{graph_id}")

    if G is None:
        return {"error": f"Graph '{graph_id}' not found. Create it first."}

    if node not in G:
        return {"error": f"Node {node} not in graph '{graph_id}'"}

    degree = G.degree(node)
    max_possible = G.number_of_nodes() - 1
    normalized = degree / max_possible if max_possible > 0 else 0

    return {
        "node": node,
        "degree": degree,
        "normalized_centrality": round(normalized, 4)
    }


@network_mcp.tool()
def calculate_betweenness(
    graph_id: str,
    node: int
) -> Dict[str, Any]:
    """
    Calculate betweenness centrality for a node.

    Betweenness measures how often a node lies on shortest paths between other nodes.
    High betweenness nodes are 'bridges' connecting different parts of the network.

    Args:
        graph_id: ID of the graph to analyze
        node: The node ID to calculate betweenness for

    Returns:
        Dictionary with betweenness centrality value
    """
    G = cache.get(f"graph:{graph_id}")

    if G is None:
        return {"error": f"Graph '{graph_id}' not found"}

    if node not in G:
        return {"error": f"Node {node} not in graph '{graph_id}'"}

    betweenness = nx.betweenness_centrality(G)

    return {
        "node": node,
        "betweenness_centrality": round(betweenness[node], 4)
    }


@network_mcp.tool()
def find_shortest_path(
    graph_id: str,
    source: int,
    target: int
) -> Dict[str, Any]:
    """
    Find shortest path between two nodes.

    Args:
        graph_id: ID of the graph to search
        source: Starting node ID
        target: Destination node ID

    Returns:
        Dictionary with path and length, or error if no path exists
    """
    G = cache.get(f"graph:{graph_id}")

    if G is None:
        return {"error": f"Graph '{graph_id}' not found"}

    try:
        path = nx.shortest_path(G, source, target)
        return {
            "found": True,
            "path": path,
            "length": len(path) - 1
        }
    except nx.NetworkXNoPath:
        return {
            "found": False,
            "message": f"No path exists between {source} and {target}"
        }
    except nx.NodeNotFound:
        return {
            "found": False,
            "message": f"One or both nodes not in graph"
        }


# Run the server
if __name__ == "__main__":
    network_mcp.run()  # stdio by default

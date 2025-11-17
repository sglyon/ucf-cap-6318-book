
from fastmcp import Client

# Test the network analysis server
async def main():
    async with Client("network_analysis_server.py") as client:
        # 1. Discover available tools
        tools = await client.list_tools()
        print("Available tools:")
        for tool in tools:
            print(f"  - {tool.name}")

        print("\n" + "="*50 + "\n")

        # 2. Create a social network (small-world structure)
        print("Creating a social network...")
        result = await client.call_tool(
            "create_network",
            {
                "graph_id": "social_network",
                "edges": [
                    [1, 2], [1, 3], [2, 3],  # Triangle cluster
                    [3, 4], [4, 5], [5, 6], [6, 4],  # Another cluster
                    [3, 7], [7, 8], [8, 9], [9, 7]   # Third cluster
                ]
            }
        )
        print(f"Network created: {result.data}")

        print("\n" + "="*50 + "\n")

        # 3. Analyze centrality - who's most important?
        print("Calculating degree centrality for node 3 (bridge node)...")
        result = await client.call_tool(
            "calculate_degree_centrality",
            {"graph_id": "social_network", "node": 3}
        )
        print(f"Node 3 centrality: {result.data}")

        print("\nCalculating degree centrality for node 1 (peripheral node)...")
        result = await client.call_tool(
            "calculate_degree_centrality",
            {"graph_id": "social_network", "node": 1}
        )
        print(f"Node 1 centrality: {result.data}")

        print("\n" + "="*50 + "\n")

        # 4. Calculate betweenness - who controls information flow?
        print("Calculating betweenness centrality for node 3...")
        result = await client.call_tool(
            "calculate_betweenness",
            {"graph_id": "social_network", "node": 3}
        )
        print(f"Node 3 betweenness: {result.data}")

        print("\n" + "="*50 + "\n")

        # 5. Find shortest paths
        print("Finding shortest path from node 1 to node 9...")
        result = await client.call_tool(
            "find_shortest_path",
            {"graph_id": "social_network", "source": 1, "target": 9}
        )
        print(f"Path result: {result.data}")

        print("\nFinding shortest path from node 2 to node 6...")
        result = await client.call_tool(
            "find_shortest_path",
            {"graph_id": "social_network", "source": 2, "target": 6}
        )
        print(f"Path result: {result.data}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())

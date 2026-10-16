import json
from pathlib import Path
import networkx as nx


def load_events():

    project_root = Path(__file__).resolve().parent.parent

    events_file = (
        project_root
        / "data"
        / "events.json"
    )

    with open(
        events_file,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    return data["events"]


def build_attack_graph(events):

    graph = nx.DiGraph()

    attackers = {}

    for event in events:

        attacker_id = event["attacker_id"]

        if attacker_id not in attackers:
            attackers[attacker_id] = []

        attackers[attacker_id].append(event)

    for attacker_id, attacker_events in attackers.items():

        attacker_events.sort(
            key=lambda x: x["timestamp"]
        )

        previous_node = None

        for event in attacker_events:

            event_node = (
                f"{attacker_id}:"
                f"{event['event_type']}:"
                f"{event['event_id']}"
            )

            graph.add_node(
                event_node,
                attacker=attacker_id,
                event_type=event["event_type"],
                host=event["host"],
                user=event["user"],
                source_ip=event["source_ip"],
                severity=event["severity"],
                timestamp=event["timestamp"],
            )

            if previous_node:

                graph.add_edge(
                    previous_node,
                    event_node
                )

            previous_node = event_node

    return graph


def save_graph(graph):

    project_root = Path(__file__).resolve().parent.parent

    output_file = (
        project_root
        / "data"
        / "attack_graph.json"
    )

    graph_data = {
        "nodes": [],
        "edges": []
    }

    for node, attributes in graph.nodes(data=True):

        graph_data["nodes"].append({
            "id": node,
            **attributes
        })

    for source, target in graph.edges():

        graph_data["edges"].append({
            "source": source,
            "target": target
        })

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            graph_data,
            file,
            indent=4
        )

    print(
        f"Saved attack graph to: {output_file}"
    )


if __name__ == "__main__":

    events = load_events()

    graph = build_attack_graph(events)

    save_graph(graph)

    print()
    print("=" * 50)
    print("ATTACK GRAPH ANALYSIS")
    print("=" * 50)

    print(
        f"Nodes: {graph.number_of_nodes()}"
    )

    print(
        f"Edges: {graph.number_of_edges()}"
    )

    print()

    attackers = set(
        nx.get_node_attributes(
            graph,
            "attacker"
        ).values()
    )

    print(
        f"Attackers represented: "
        f"{len(attackers)}"
    )

    for attacker in sorted(attackers):

        attacker_nodes = [
            node
            for node, attributes
            in graph.nodes(data=True)
            if attributes.get("attacker")
            == attacker
        ]

        print(
            f"{attacker}: "
            f"{len(attacker_nodes)} events"
        )
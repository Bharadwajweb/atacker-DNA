import json
from pathlib import Path
from collections import defaultdict, Counter

from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier


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


def prepare_sequences(events):

    attackers = defaultdict(list)

    for event in events:

        attackers[event["attacker_id"]].append(event)

    sequences = []

    for attacker_id, attacker_events in attackers.items():

        attacker_events.sort(
            key=lambda x: x["timestamp"]
        )

        event_types = [
            event["event_type"]
            for event in attacker_events
        ]

        for i in range(len(event_types) - 1):

            current_action = event_types[i]
            next_action = event_types[i + 1]

            sequences.append(
                (current_action, next_action)
            )

    return sequences


def train_model(sequences):

    X_values = [
        sequence[0]
        for sequence in sequences
    ]

    y_values = [
        sequence[1]
        for sequence in sequences
    ]

    encoder = LabelEncoder()

    all_actions = sorted(
        set(X_values + y_values)
    )

    encoder.fit(all_actions)

    X = encoder.transform(X_values).reshape(
        -1, 1
    )

    y = encoder.transform(y_values)

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X, y)

    return model, encoder


def predict_next_action(
    model,
    encoder,
    current_action
):

    if current_action not in encoder.classes_:

        return {
            "prediction": "unknown",
            "confidence": 0
        }

    encoded_action = encoder.transform(
        [current_action]
    ).reshape(-1, 1)

    probabilities = model.predict_proba(
        encoded_action
    )[0]

    best_index = probabilities.argmax()

    predicted_class = model.classes_[
        best_index
    ]

    prediction = encoder.inverse_transform(
        [predicted_class]
    )[0]

    confidence = probabilities[
        best_index
    ] * 100

    return {
        "prediction": prediction,
        "confidence": round(
            confidence,
            2
        )
    }


def save_prediction(result):

    project_root = Path(__file__).resolve().parent.parent

    output_file = (
        project_root
        / "data"
        / "prediction.json"
    )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            indent=4
        )

    print(
        f"Saved prediction to: {output_file}"
    )


if __name__ == "__main__":

    print("=" * 55)
    print("ATTACK DNA X - AI NEXT ACTION PREDICTOR")
    print("=" * 55)

    events = load_events()

    sequences = prepare_sequences(
        events
    )

    print(
        f"Training sequences: "
        f"{len(sequences)}"
    )

    model, encoder = train_model(
        sequences
    )

    print(
        f"Known behaviors: "
        f"{len(encoder.classes_)}"
    )

    print()

    test_actions = [
        "failed_login",
        "successful_login",
        "process_created",
        "powershell_execution",
        "credential_access",
        "privilege_escalation",
        "lateral_movement",
    ]

    predictions = []

    for action in test_actions:

        result = predict_next_action(
            model,
            encoder,
            action
        )

        prediction = {
            "current_action": action,
            "predicted_next_action":
                result["prediction"],
            "confidence":
                result["confidence"]
        }

        predictions.append(
            prediction
        )

        print(
            f"{action:25} -> "
            f"{result['prediction']:25} "
            f"({result['confidence']}%)"
        )

    save_prediction(
        {
            "predictions": predictions
        }
    )
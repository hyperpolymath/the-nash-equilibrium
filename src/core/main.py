#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""The Nash Equilibrium - 6X strategy prototype.

Simulates the eXchange dimension: an iterated Prisoner's Dilemma between
two strategies. The Nash equilibrium of one-shot PD is mutual defection,
but iteration enables cooperation to emerge - the central insight the
full game will build on.
"""
import random


PAYOFF = {
    ("C", "C"): (3, 3),
    ("C", "D"): (0, 5),
    ("D", "C"): (5, 0),
    ("D", "D"): (1, 1),
}


def tit_for_tat(history_self, history_other):
    return "C" if not history_other else history_other[-1]


def always_defect(history_self, history_other):
    return "D"


def random_strategy(history_self, history_other):
    return random.choice(["C", "D"])


def play(strategy_a, strategy_b, rounds=10):
    history_a, history_b = [], []
    score_a, score_b = 0, 0
    for _ in range(rounds):
        move_a = strategy_a(history_a, history_b)
        move_b = strategy_b(history_b, history_a)
        gain_a, gain_b = PAYOFF[(move_a, move_b)]
        score_a += gain_a
        score_b += gain_b
        history_a.append(move_a)
        history_b.append(move_b)
    return score_a, score_b, history_a, history_b


def main():
    print("=" * 60)
    print("  THE NASH EQUILIBRIUM")
    print("  6X prototype - eXchange pillar (iterated PD)")
    print("=" * 60)
    print()

    matchups = [
        ("Tit-for-Tat", tit_for_tat, "Always-Defect", always_defect),
        ("Tit-for-Tat", tit_for_tat, "Random",        random_strategy),
        ("Tit-for-Tat", tit_for_tat, "Tit-for-Tat",   tit_for_tat),
    ]

    random.seed(0)
    for name_a, sa, name_b, sb in matchups:
        score_a, score_b, ha, hb = play(sa, sb, rounds=20)
        print(f"  {name_a:14s} vs {name_b:14s}: {score_a:3d} - {score_b:3d}")
        print(f"    {name_a[:3]}: {''.join(ha)}")
        print(f"    {name_b[:3]}: {''.join(hb)}")
        print()

    print("Equilibrium emerges from repeated play - exactly the lever")
    print("the full 6X game will use across all six dimensions.")


if __name__ == "__main__":
    main()

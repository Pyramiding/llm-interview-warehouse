"""Small, dependency-free interview examples. Not optimized training/serving code."""
from __future__ import annotations

import json
import math


def softmax(values):
    values = list(values)
    if not values or not all(math.isfinite(x) for x in values):
        raise ValueError('expected a nonempty sequence of finite numbers')
    peak = max(values)
    weights = [math.exp(x - peak) for x in values]
    total = sum(weights)
    return [x / total for x in weights]


def causal_attention(q, k, v):
    """Equal-length single-head self-attention; no padding or KV cache."""
    n = len(q)
    if n == 0 or len(k) != n or len(v) != n:
        raise ValueError('Q/K/V must have equal nonzero sequence length')
    d, dv = len(q[0]), len(v[0])
    if d == 0 or dv == 0:
        raise ValueError('feature dimensions must be nonzero')
    if any(len(x) != d for x in q) or any(len(x) != d for x in k):
        raise ValueError('Q/K feature dimensions must match')
    if any(len(x) != dv for x in v):
        raise ValueError('V must be rectangular')
    if not all(math.isfinite(x) for matrix in (q, k, v) for row in matrix for x in row):
        raise ValueError('inputs must be finite')
    out = []
    for i, query in enumerate(q):
        scores = [sum(a*b for a, b in zip(query, key))/math.sqrt(d) for key in k[:i+1]]
        p = softmax(scores)
        out.append([sum(p[j]*v[j][col] for j in range(i+1)) for col in range(dv)])
    return out


def dpo_loss(policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta=0.1):
    """Inputs are scalar sequence log probabilities, already summed over labels."""
    if beta <= 0 or not all(math.isfinite(x) for x in
                            [policy_chosen, policy_rejected, ref_chosen, ref_rejected, beta]):
        raise ValueError('finite inputs and positive beta required')
    try:
        z = math.fsum([beta*policy_chosen, -beta*policy_rejected,
                       -beta*ref_chosen, beta*ref_rejected])
    except (OverflowError, ValueError) as exc:
        raise ValueError('log-ratio exceeds supported floating-point range') from exc
    if not math.isfinite(z):
        raise ValueError('log-ratio exceeds supported floating-point range')
    return max(0.0, -z) + math.log1p(math.exp(-abs(z)))


def lora_parameters(d_in, d_out, rank):
    _positive_integers(d_in, d_out, rank)
    return rank*(d_in+d_out)


def kv_cache_bytes(layers, batch, tokens, kv_heads, head_dim, bytes_per_element=2):
    """Conventional, unshared, full-length KV payload. Excludes allocation overhead."""
    _positive_integers(layers, batch, tokens, kv_heads, head_dim, bytes_per_element)
    return 2*layers*batch*tokens*kv_heads*head_dim*bytes_per_element


def _positive_integers(*values):
    if not all(isinstance(x, int) and not isinstance(x, bool) and x > 0 for x in values):
        raise ValueError('positive integers required')


def retrieval_metrics(ranking, relevant, k):
    """Recall and RR, deduplicated ranking; no-label queries return None."""
    _positive_integers(k)
    selected = list(dict.fromkeys(ranking))[:k]
    relevant = set(relevant)
    if not relevant:
        return {'recall': None, 'rr': None}
    hits = sum(x in relevant for x in selected)
    rr = next((1.0/i for i, x in enumerate(selected, 1) if x in relevant), 0.0)
    return {'recall': hits/len(relevant), 'rr': rr}


def rrf(rankings, c=60):
    if not math.isfinite(c) or c < 0:
        raise ValueError('c must be finite and nonnegative')
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(dict.fromkeys(ranking), 1):
            scores[doc] = scores.get(doc, 0.0) + 1.0/(c+rank)
    return sorted(scores.items(), key=lambda pair: (-pair[1], str(pair[0])))


def top_p(probabilities, p=0.9):
    """Return (token_index, renormalized_probability); keep the crossing token."""
    probs = list(probabilities)
    if not math.isfinite(p) or not 0 < p <= 1 or not probs:
        raise ValueError('p in (0,1] and nonempty probabilities required')
    if not all(math.isfinite(x) and x >= 0 for x in probs) or sum(probs) <= 0:
        raise ValueError('probabilities must be finite/nonnegative with positive sum')
    scale = max(probs)
    probs = [weight/scale for weight in probs]
    total = math.fsum(probs)
    ordered = sorted(enumerate(probs), key=lambda pair: (-pair[1], pair[0]))
    chosen, cumulative = [], 0.0
    for index, weight in ordered:
        chosen.append((index, weight))
        cumulative += weight
        if cumulative/total >= p:
            break
    return [(index, weight/cumulative) for index, weight in chosen]


if __name__ == '__main__':
    print(json.dumps({
        'stable_softmax': softmax([1000, 1000]),
        'lora_4096_r8': lora_parameters(4096, 4096, 8),
        'dpo_equal_preferences': dpo_loss(-3, -4, -3, -4),
        'kv_gib': kv_cache_bytes(32, 4, 8192, 8, 128)/2**30,
        'retrieval': retrieval_metrics(['a', 'b', 'c'], {'b', 'd'}, 3),
        'top_p': top_p([0.6, 0.25, 0.15], 0.8),
    }, ensure_ascii=False, indent=2))

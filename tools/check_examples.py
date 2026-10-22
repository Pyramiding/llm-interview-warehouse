"""Numerical/causality checks for educational examples, using only stdlib."""
import math
from interview_math import (softmax, causal_attention, dpo_loss, lora_parameters,
                            kv_cache_bytes, retrieval_metrics, rrf, top_p)

assert softmax([1000, 1000]) == [0.5, 0.5]
assert all(abs(a-b) < 1e-12 for a, b in zip(softmax([1, 2, 3]), softmax([-99, -98, -97])))
q, k = [[1, 0], [0, 1]], [[1, 0], [0, 1]]
v = [[2, 3], [10, 20]]
base = causal_attention(q, k, v)
changed = causal_attention(q, k, [[2, 3], [999, 999]])
assert base[0] == [2, 3] and changed[0] == base[0]  # no future leakage
assert all(2 <= x <= 20 for x in base[1])
assert math.isclose(dpo_loss(-3, -4, -3, -4), math.log(2))
assert dpo_loss(-2, -5, -3, -4) < dpo_loss(-3, -4, -3, -4)
assert math.isfinite(dpo_loss(-10000, 0, 0, 0))
assert math.isclose(dpo_loss(-1e308, 0, 0, -1e308), 2e307)
assert lora_parameters(4096, 4096, 8) == 65536
assert kv_cache_bytes(32, 4, 8192, 8, 128) == 4*2**30
assert retrieval_metrics(['a', 'a', 'b', 'c'], {'b', 'd'}, 3) == {'recall': 0.5, 'rr': 0.5}
assert retrieval_metrics(['a'], set(), 1) == {'recall': None, 'rr': None}
assert rrf([['a', 'a', 'b']]) == rrf([['a', 'b']])
assert [index for index, _ in top_p([0.6, 0.25, 0.15], 0.8)] == [0, 1]
assert math.isclose(sum(prob for _, prob in top_p([0.6, 0.25, 0.15], 0.8)), 1.0)
assert len(top_p([0.6, 0.25, 0.15], 1.0)) == 3
assert top_p([1e308, 1e308], 0.9) == [(0, 0.5), (1, 0.5)]
for fn, args in [(softmax, ([],)), (top_p, ([0, 0],)),
                 (kv_cache_bytes, (0, 1, 1, 1, 1)), (dpo_loss, (0, 0, 0, 0, 0))]:
    try:
        fn(*args)
    except ValueError:
        pass
    else:
        raise AssertionError(f'{fn.__name__} accepted an invalid input')
print('Educational examples: all numerical and boundary checks passed.')

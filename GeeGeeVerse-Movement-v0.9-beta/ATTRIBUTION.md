# Movement credit and permission note

This beta adapts movement-direction normalization, eased facing, and jump-cooldown concepts from [larvuz2/physics-character-controller](https://github.com/larvuz2/physics-character-controller), based on the project author's permission reported by the GeeGeeVerse owner.

The upstream README describes MIT licensing, while `package.json` declares ISC and a stand-alone `LICENSE` file is absent in the repository inspected on 2026-10-28. Keep the original permission record and clarify redistribution terms if distributing or commercializing GeeGeeVerse.

This adapter does **not** include the upstream Rapier physics engine. It preserves the existing lightweight client runtime; a full Rapier integration would need bundling/wasm initialization, audited colliders, and multiplayer synchronization tests.

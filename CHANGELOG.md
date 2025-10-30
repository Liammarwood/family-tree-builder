## [1.2.2](https://github.com/Liammarwood/family-tree-builder/compare/v1.2.1...v1.2.2) (2025-10-30)


### Performance Improvements

* eliminate rendering bottlenecks in core React Flow operations ([#23](https://github.com/Liammarwood/family-tree-builder/issues/23)) ([8ae9494](https://github.com/Liammarwood/family-tree-builder/commit/8ae9494618cb5923386aedca388d6b52c5eaf9cc))
* optimize core rendering and data processing ([a2952aa](https://github.com/Liammarwood/family-tree-builder/commit/a2952aa5383a414999d1d59983adadd5b60f1083))
* optimize database retry logic and sync effect ([3745828](https://github.com/Liammarwood/family-tree-builder/commit/374582891d52a280e72ab7feae02920d0c5c37b6))


### Reverts

* restore PNG export pixelRatio to 5 for better quality ([b67cf05](https://github.com/Liammarwood/family-tree-builder/commit/b67cf059d2d105d7cfed0fb90942b39a812954c9))

## [1.2.1](https://github.com/Liammarwood/family-tree-builder/compare/v1.2.0...v1.2.1) (2025-10-30)


### Bug Fixes

* Ensure that expectedChunks is equal to receivedChunks before progressing ([409eebe](https://github.com/Liammarwood/family-tree-builder/commit/409eebe64f02b3d7e7bb85dac1506f227ca50d90))

# [1.2.0](https://github.com/Liammarwood/family-tree-builder/compare/v1.1.1...v1.2.0) (2025-10-30)


### Features

* Add in-app help modal documenting all features ([#19](https://github.com/Liammarwood/family-tree-builder/issues/19)) ([565dea8](https://github.com/Liammarwood/family-tree-builder/commit/565dea8bfb04162debe1c6cf8c58ec13b9970add))

## [1.1.1](https://github.com/Liammarwood/family-tree-builder/compare/v1.1.0...v1.1.1) (2025-10-30)


### Bug Fixes

* Update TODO and modify the ICONs for the PWA ([61ab321](https://github.com/Liammarwood/family-tree-builder/commit/61ab321fe10cf9a5b7e325613fc7510bde1b8e5e))

# [1.1.0](https://github.com/Liammarwood/family-tree-builder/compare/v1.0.1...v1.1.0) (2025-10-30)


### Bug Fixes

* Adding Fixes to Sharing ([4168a1e](https://github.com/Liammarwood/family-tree-builder/commit/4168a1e91f1211cb05075eeaf335342cc5d398fa))
* Adding Fixes to Sharing ([15a5362](https://github.com/Liammarwood/family-tree-builder/commit/15a536219a301f01c07451133a8df502e205c307))


### Features

* Node Configuration ([b50b12e](https://github.com/Liammarwood/family-tree-builder/commit/b50b12e90c068884daeb786806aa2ad44b4d128a))

## [1.0.1](https://github.com/Liammarwood/family-tree-builder/compare/v1.0.0...v1.0.1) (2025-10-30)


### Bug Fixes

* Align siblings at same Y-axis and ensure proper multi-generational layering ([00e04d1](https://github.com/Liammarwood/family-tree-builder/commit/00e04d10db680a5723602e9a8e6d7f4a491526c8))
* Fixing the issue with saving to IndexDB ([f943e47](https://github.com/Liammarwood/family-tree-builder/commit/f943e47848480f0c2a5bee8c20b3552938aae27c))
* Prioritize partner positioning over sibling alignment ([cc4b2a3](https://github.com/Liammarwood/family-tree-builder/commit/cc4b2a3a769bc2cadcf7b526af3c45ce4ffed6a0))

# 1.0.0 (2025-10-29)


### Bug Fixes

* Add AboutModal and Build Info ([3210fe8](https://github.com/Liammarwood/family-tree-builder/commit/3210fe84ae671e2af4ca9bfa353b9c5b84770dd4))
* Add AboutModal and Build Info ([b343429](https://github.com/Liammarwood/family-tree-builder/commit/b343429d31e39839b81e3c41f49b36a5d545370b))
* Added tests to all libs and hooks ([7e23a08](https://github.com/Liammarwood/family-tree-builder/commit/7e23a089bbb322807bfbe7f47b7c06a2049d0ad4))
* Adding Error Handling ([a46f291](https://github.com/Liammarwood/family-tree-builder/commit/a46f29148ae7f9d9597d0b6e1e113066a4ceca87))
* Implementing Error Handling in all componenets ([94457cb](https://github.com/Liammarwood/family-tree-builder/commit/94457cb5a2cb6aa78dcab9ea3a866aa904896115))
* replace release-please with semantic-release to resolve workflow failures ([#15](https://github.com/Liammarwood/family-tree-builder/issues/15)) ([3b93ccc](https://github.com/Liammarwood/family-tree-builder/commit/3b93ccce9bd6057c501e193749c288e9a9f48ba1))
* upgrade Node.js to v20 for Firebase CLI v14.22.0 compatibility ([#11](https://github.com/Liammarwood/family-tree-builder/issues/11)) ([59fbaf6](https://github.com/Liammarwood/family-tree-builder/commit/59fbaf6fa25e4668b97b35d7fe7894b5448e5e3f))
* upgrade Node.js to version 20 for Firebase CLI compatibility ([3d6bdd0](https://github.com/Liammarwood/family-tree-builder/commit/3d6bdd06c8d65d8432b127ad5564b5915deb1274))


### Features

* Add PWA support with enhanced IndexedDB mobile compatibility ([#12](https://github.com/Liammarwood/family-tree-builder/issues/12)) ([260700f](https://github.com/Liammarwood/family-tree-builder/commit/260700faa9ae0d291ea67a0ef2b966166a23d151))
* Adding Conventual Commits + Release ([3e627d3](https://github.com/Liammarwood/family-tree-builder/commit/3e627d32d090f290f2e1babe9e8591f659a8ae57))
* configure PWA support with service worker and enhanced IndexedDB compatibility ([c51c316](https://github.com/Liammarwood/family-tree-builder/commit/c51c316939814c3b93cc65e1603aa307187b61cc))

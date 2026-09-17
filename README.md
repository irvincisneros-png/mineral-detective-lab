# Mineral Detective Lab

An original, browser-based mineral identification virtual lab for secondary science students.

Students investigate an unknown sample by performing the procedure in a persistent bright laboratory scene. The specimen visibly settles onto a tared balance, displaces water in a graduated cylinder, rotates beneath an adjustable lamp and magnifier, leaves scratch and streak evidence, and reacts (or stays quiet) under a positioned acid drop. The paper notebook stays student-entered: readings and observations are never auto-filled. An in-app identification key supports evidence-based comparison. There is no timer, login or tracking.

## Run locally

Run a static web server in this directory (opening a file URL directly is not supported because canvas image processing needs a same-origin HTTP page):

```sh
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173/`.

Generated mineral and equipment atlases, prompts, and image provenance are documented in [`assets/ASSET-MANIFEST.md`](assets/ASSET-MANIFEST.md). The current build uses a high-resolution 2D canvas with photographic sprites, scripted motion, pointer capture and one calibrated coordinate system. It does not claim to contain 3D mineral scans.

Cylinder graduations are 1 mL with a magnified meniscus window. Use non-aqueous displacement liquid for soluble samples. The scratch kit contains points of stated model Mohs hardness; quartz scratches the porcelain tile rather than leaving a reliable mineral powder streak. Student readings and observations are entered manually.

GitHub Pages deploys on pushes to `main`. The workflow publishes only the application and its two required atlases. Local QA screenshots and previous-build backups are ignored by Git.

## Educational scope

The simulation uses standard published mineral properties and familiar laboratory methods. It is an independent classroom resource and does not contain code, visual assets, text or trademarks copied from ExploreLearning Gizmos.

## Licence

MIT

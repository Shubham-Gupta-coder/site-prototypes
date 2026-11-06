# Native SVG artwork

Original vector artwork created for this rendering upgrade. All drawings are self-contained paths, text, gradients and patterns; there are no linked raster images or external resources.

| File | Role in the world |
|---|---|
| compute-rack.svg | Server cassettes, fan vents, network ports, status lights, cable loom |
| workspace.svg | Web-app navigation, connected models/data/apps, context flow and activity |
| agent-control.svg | Agent input, context, model, tools and result circuit; also pod control panels |
| memory.svg | Source/context/decision/run/recall drawers and knowledge graph |
| machined-gear.svg | Cut gear teeth, bearing races, spokes and fasteners; agent drive and approval wheel |
| context-core.svg | Models/data/apps chambers in the hub column |
| chat.svg | Team chat and the existing signed-contract question |
| docs.svg | Source record, page and signature |
| sheet.svg | Structured grid on the human-work island |
| inbox.svg | Inbox rows, unread indicators and navigation |
| calendar.svg | Scheduled work and highlighted meeting cell |
| report.svg | Editable report illustration; the changing report/DONE beat keeps the original crisp card to preserve its timing and text |
| bridge-deck.svg | Machined structural deck, recessed grilles, longitudinal rails and bolts |

Edit SVG geometry and gradients directly. ViewBoxes and intrinsic dimensions determine texture resolution. Placement and material mapping live in `../vector-world.js`.

The SVG source remains editable vector. Three.js rasterizes it to a texture for correct world-space perspective and depth occlusion; it is never sampled back into particles. Solid housings are separate geometry with warm metal lighting. Typography of the page and its original OFL font licenses are unchanged.

# Vendored icons

These components are generated from [Lucide](https://lucide.dev) and committed
to the repository. They render literal SVG markup so the denokv-gui-client
bundle does not include Lucide's renderer, icon data objects or wrapper
components.

Each component accepts a single `size` prop (default `24`) and hardcodes
`aria-hidden="true"`. Presentation attributes (`fill`, `stroke`, stroke
width/caps/joins) come from the shared `.app-icon` rule in `../app.css`, so the
markup stays minimal.

Do not edit these files by hand. Regenerate them with:

```sh
pnpm sync:lucide-icons
```

The generator lives in `scripts/sync-lucide-icons.mjs`; its `ICONS` list maps
the Lucide slugs used by the app to these component names. The script reads
`node_modules/@lucide/svelte`, which is kept as a devDependency for this
purpose.

## License

Lucide is licensed under the ISC license. See [LICENSE](./LICENSE) for the full
text, including the Feather-derived icons.

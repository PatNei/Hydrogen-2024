import { vitePlugin as remix } from "@remix-run/dev";
import { hydrogen } from "@shopify/hydrogen/vite";
import { oxygen } from "@shopify/mini-oxygen/vite";
import { remixDevTools } from "remix-development-tools";
import { defineConfig } from "vite";
import biomePlugin from "vite-plugin-biome";
import tsconfigPaths from "vite-tsconfig-paths";
const _plugins = [
	hydrogen(),
	oxygen(),
	remix({
		presets: [hydrogen.preset()],
		future: {
			v3_fetcherPersist: true,
			v3_relativeSplatPath: true,
			v3_throwAbortReason: true,
		},
	}),
	tsconfigPaths(),
];
export default defineConfig({
	ssr: {
		optimizeDeps: {
			include: [
				"react-diff-viewer-continued",
				"beautify",
			],
		},
	},
	plugins: _plugins,
	build: {
		// Allow a strict Content-Security-Policy
		// withtout inlining assets as base64:
		assetsInlineLimit: 0,
	},
});

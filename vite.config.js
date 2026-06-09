import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		vue(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "Do it for",
				short_name: "Do it for",
				description: "A little reminder. A big why.",
				theme_color: "#B9573A",
				background_color: "#F5EBDD",
				display: "standalone",
				orientation: "portrait",
				scope: "/",
				start_url: "/",
				icons: [
					{
						src: "/icons/icon-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/icons/icon-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": "/src",
		},
	},
});

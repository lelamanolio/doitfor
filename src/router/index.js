import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const routes = [
	{
		path: "/",
		component: () => import("@/views/LandingView.vue"),
		meta: { public: true },
	},
	{
		path: "/onboarding",
		component: () => import("@/views/OnboardingView.vue"),
		meta: { public: false },
	},
	{
		path: "/home",
		component: () => import("@/views/HomeView.vue"),
		meta: { public: false },
	},
	{
		path: "/add",
		component: () => import("@/views/AddMotivationView.vue"),
		meta: { public: false },
	},
	{
		path: "/settings",
		component: () => import("@/views/SettingsView.vue"),
		meta: { public: false },
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

router.beforeEach(async (to) => {
	const auth = useAuthStore();

	// Aspetta che Firebase risolva lo stato auth
	if (auth.loading) {
		await new Promise((resolve) => {
			const unwatch = auth.$subscribe(() => {
				if (!auth.loading) {
					unwatch();
					resolve();
				}
			});
		});
	}

	if (!to.meta.public && !auth.isAuthenticated) {
		return "/";
	}
});

export default router;

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

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

	// Se va su /onboarding ma ha già completato → /home
	if (to.path === "/onboarding" && auth.isAuthenticated) {
		if (auth.user) {
			const snap = await getDoc(doc(db, "users", auth.user.uid));
			if (snap.exists() && snap.data().onboardingComplete) {
				return "/home";
			}
		} else if (localStorage.getItem("onboardingComplete") === "true") {
			return "/home";
		}
	}
});

export default router;

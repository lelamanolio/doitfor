import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "@/firebase";

export const useAuthStore = defineStore("auth", () => {
	const user = ref(null);
	const isGuest = ref(false);
	const loading = ref(true);

	const isAuthenticated = computed(() => !!user.value || isGuest.value);

	function loginWithGoogle() {
		return signInWithPopup(auth, provider);
	}

	function continueAsGuest() {
		isGuest.value = true;
		localStorage.setItem("isGuest", "true");
	}

	function logout() {
		isGuest.value = false;
		localStorage.removeItem("isGuest");
		return signOut(auth);
	}

	onAuthStateChanged(auth, (firebaseUser) => {
		user.value = firebaseUser;
		if (!firebaseUser) {
			isGuest.value = localStorage.getItem("isGuest") === "true";
		}
		loading.value = false;
	});

	return {
		user,
		isGuest,
		loading,
		isAuthenticated,
		loginWithGoogle,
		continueAsGuest,
		logout,
	};
});

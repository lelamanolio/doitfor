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
	}

	function logout() {
		isGuest.value = false;
		return signOut(auth);
	}

	onAuthStateChanged(auth, (firebaseUser) => {
		user.value = firebaseUser;
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

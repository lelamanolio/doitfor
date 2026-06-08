<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

const doItValue = ref("");

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
	await auth.logout();
	router.push("/");
}

async function handleContinue() {
	const data = {
		doItFor: doItValue.value,
		onboardingComplete: true,
	};

	// if there's a user on Google
	if (auth.user) {
		try {
			const response = await setDoc(doc(db, "users", auth.user.uid), data);
			console.log(response);
		} catch (e) {
			console.error(e);
		}
	} else {
		// save in localStorage as guest
		localStorage.setItem("doItFor", doItValue.value);
		localStorage.setItem("onboardingComplete", "true");
	}

	router.push("/home");
}
</script>

<template>
	<div>
		<p>Loggato come: {{ auth.user?.email ?? "Ospite" }}</p>
		<button @click="handleLogout">Logout</button>

		<h1>Do it for...?</h1>
		<input type="text" v-model="doItValue" />
		<button @click="handleContinue">Continue</button>
	</div>
</template>

<style lang="scss"></style>

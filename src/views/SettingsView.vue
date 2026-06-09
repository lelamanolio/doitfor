<script setup>
import { ref, onBeforeMount } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import {
	doc,
	getDoc,
	updateDoc,
	setDoc,
	collection,
	addDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

const auth = useAuthStore();
const router = useRouter();

const doItFor = ref("");

async function loadSettings() {
	if (auth.user) {
		const snap = await getDoc(doc(db, "users", auth.user.uid));
		if (snap.exists()) {
			doItFor.value = snap.data().doItFor ?? "";
		}
	} else {
		doItFor.value = localStorage.getItem("doItFor") ?? "";
	}
}

async function handleSaveSettings() {
	if (auth.user) {
		await updateDoc(doc(db, "users", auth.user.uid), {
			doItFor: doItFor.value,
		});
	} else {
		localStorage.setItem("doItFor", doItFor.value);
	}
}

async function handleMigrateToGoogle() {
	await auth.loginWithGoogle();

	if (!auth.user) return;

	await setDoc(doc(db, "users", auth.user.uid), {
		doItFor: localStorage.getItem("doItFor") ?? "",
		onboardingComplete: true,
	});

	const motivations = JSON.parse(localStorage.getItem("motivations") ?? "[]");
	for (const m of motivations) {
		await addDoc(collection(db, "users", auth.user.uid, "motivations"), {
			text: m.text,
			image: m.image ?? null,
			createdAt: m.createdAt,
		});
	}

	localStorage.removeItem("doItFor");
	localStorage.removeItem("motivations");
	localStorage.removeItem("onboardingComplete");
	localStorage.removeItem("isGuest");

	router.push("/home");
}

onBeforeMount(() => loadSettings());
</script>

<template>
	<div>
		<h1>Settings</h1>

		<section>
			<label>Do it for...</label>
			<input type="text" v-model="doItFor" />
		</section>

		<button @click="handleSaveSettings">Salva</button>

		<section v-if="auth.isGuest">
			<p>
				Stai usando l'app come ospite. Accedi con Google per non perdere i tuoi
				dati.
			</p>
			<button @click="handleMigrateToGoogle">Accedi con Google</button>
		</section>
	</div>
</template>

<style lang="scss"></style>

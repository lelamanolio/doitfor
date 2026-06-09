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
const reminderEnabled = ref(false);
const reminderTime = ref("08:00");

async function loadSettings() {
	if (auth.user) {
		const snap = await getDoc(doc(db, "users", auth.user.uid));
		if (snap.exists()) {
			doItFor.value = snap.data().doItFor ?? "";
			reminderEnabled.value = snap.data().reminderEnabled ?? false;
			reminderTime.value = snap.data().reminderTime ?? "08:00";
		}
	} else {
		doItFor.value = localStorage.getItem("doItFor") ?? "";
		reminderEnabled.value = localStorage.getItem("reminderEnabled") === "true";
		reminderTime.value = localStorage.getItem("reminderTime") ?? "08:00";
	}
}

async function handleSaveSettings() {
	if (auth.user) {
		await updateDoc(doc(db, "users", auth.user.uid), {
			doItFor: doItFor.value,
			reminderEnabled: reminderEnabled.value,
			reminderTime: reminderTime.value,
		});
	} else {
		localStorage.setItem("doItFor", doItFor.value);
		localStorage.setItem("reminderEnabled", reminderEnabled.value);
		localStorage.setItem("reminderTime", reminderTime.value);
	}
}

async function handleMigrateToGoogle() {
	await auth.loginWithGoogle();

	if (!auth.user) return;

	// migra doItFor e settings
	const data = {
		doItFor: localStorage.getItem("doItFor") ?? "",
		reminderEnabled: localStorage.getItem("reminderEnabled") === "true",
		reminderTime: localStorage.getItem("reminderTime") ?? "08:00",
		onboardingComplete: true,
	};
	await setDoc(doc(db, "users", auth.user.uid), data);

	// migra motivazioni
	const motivations = JSON.parse(localStorage.getItem("motivations") ?? "[]");
	for (const m of motivations) {
		await addDoc(collection(db, "users", auth.user.uid, "motivations"), {
			text: m.text,
			image: m.image ?? null,
			createdAt: m.createdAt,
		});
	}

	// pulisci localStorage
	localStorage.removeItem("doItFor");
	localStorage.removeItem("motivations");
	localStorage.removeItem("onboardingComplete");
	localStorage.removeItem("reminderEnabled");
	localStorage.removeItem("reminderTime");

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

		<section>
			<label>Reminder giornaliero</label>
			<input type="checkbox" v-model="reminderEnabled" />
			<input v-if="reminderEnabled" type="time" v-model="reminderTime" />
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

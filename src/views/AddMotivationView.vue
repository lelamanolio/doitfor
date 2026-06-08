<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

const motivation = ref({
	text: "",
	image: null,
});

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
	await auth.logout();
	router.push("/");
}

async function handleSave() {
	motivation.value.createdAt = serverTimestamp();

	if (auth.user) {
		await addDoc(
			collection(db, "users", auth.user.uid, "motivations"),
			motivation.value,
		);
	} else {
		const motivations = JSON.parse(localStorage.getItem("motivations") ?? "[]");
		motivations.push({
			...motivation.value,
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
		});
		localStorage.setItem("motivations", JSON.stringify(motivations));
	}

	router.push("/home");
}
</script>

<template>
	<div>
		<p>Loggato come: {{ auth.user?.email ?? "Ospite" }}</p>
		<button @click="handleLogout">Logout</button>

		<h1>Add motivation</h1>

		<label>Your motivation</label>
		<textarea v-model="motivation.text" />

		<label>Image (optional)</label>
		<input type="text" v-model="motivation.image" />

		<button @click="handleSave">Save</button>
	</div>
</template>

<style lang="scss"></style>

<script setup>
import { ref, onBeforeMount, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter, useRoute } from "vue-router";
import {
	collection,
	addDoc,
	serverTimestamp,
	doc,
	getDoc,
	updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

const motivation = ref({
	text: "",
	image: null,
});

const route = useRoute();
const isEdit = computed(() => !!route.params.id);

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
	await auth.logout();
	router.push("/");
}

async function handleSave() {
	motivation.value.createdAt = serverTimestamp();

	if (isEdit.value) {
		if (auth.user) {
			await updateDoc(
				doc(db, "users", auth.user.uid, "motivations", route.params.id),
				{ text: motivation.value.text, image: motivation.value.image ?? null },
			);
		} else {
			const motivations = JSON.parse(
				localStorage.getItem("motivations") ?? "[]",
			);
			const index = motivations.findIndex((m) => m.id === route.params.id);
			if (index !== -1) {
				motivations[index].text = motivation.value.text;
				motivations[index].image = motivation.value.image;
				localStorage.setItem("motivations", JSON.stringify(motivations));
			}
		}
	} else {
		if (auth.user) {
			await addDoc(
				collection(db, "users", auth.user.uid, "motivations"),
				motivation.value,
			);
		} else {
			const motivations = JSON.parse(
				localStorage.getItem("motivations") ?? "[]",
			);
			motivations.push({
				...motivation.value,
				id: crypto.randomUUID(),
				createdAt: new Date().toISOString(),
			});
			localStorage.setItem("motivations", JSON.stringify(motivations));
		}
	}

	router.push("/home");
}

onBeforeMount(async () => {
	if (!isEdit.value) return;

	if (auth.user) {
		const snap = await getDoc(
			doc(db, "users", auth.user.uid, "motivations", route.params.id),
		);
		if (snap.exists()) {
			motivation.value.text = snap.data().text;
			motivation.value.image = snap.data().image;
		}
	} else {
		const motivations = JSON.parse(localStorage.getItem("motivations") ?? "[]");
		const found = motivations.find((m) => m.id === route.params.id);
		if (found) {
			motivation.value.text = found.text;
			motivation.value.image = found.image;
		}
	}
});
</script>

<template>
	<div>
		<p>Loggato come: {{ auth.user?.email ?? "Ospite" }}</p>
		<button @click="handleLogout">Logout</button>

		<h1>{{ isEdit ? "Edit motivation" : "Add motivation" }}</h1>

		<label>Your motivation</label>
		<textarea v-model="motivation.text" />

		<label>Image (optional)</label>
		<input type="text" v-model="motivation.image" />

		<button @click="handleSave">Save</button>
	</div>
</template>

<style lang="scss"></style>

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
import { uploadImage } from "@/utils/uploadImage";

const motivation = ref({
	text: "",
	image: null,
});
const imageFile = ref(null);
const uploading = ref(false);

const route = useRoute();
const isEdit = computed(() => !!route.params.id);

const auth = useAuthStore();
const router = useRouter();

function handleFileChange(event) {
	const file = event.target.files[0];
	if (!file) return;
	if (file.size > 2 * 1024 * 1024) {
		alert("Immagine troppo grande, massimo 2MB");
		return;
	}
	imageFile.value = file;
}

async function handleSave() {
	uploading.value = true;

	// upload immagine se c'è un file selezionato
	if (imageFile.value) {
		motivation.value.image = await uploadImage(imageFile.value);
	}

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

	uploading.value = false;
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
		<input type="file" accept="image/*" @change="handleFileChange" />
		<img
			v-if="motivation.image"
			:src="motivation.image"
			style="max-width: 200px; margin-top: 8px"
		/>

		<button @click="handleSave" :disabled="uploading">
			{{ uploading ? "Uploading..." : "Save" }}
		</button>
	</div>
</template>

<style lang="scss"></style>

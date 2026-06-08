<script setup>
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import {
	doc,
	getDoc,
	collection,
	getDocs,
	orderBy,
	query,
	deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

const doItFor = ref("");
const motivations = ref([]);

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
	await auth.logout();
	router.push("/");
}

async function loadUserData() {
	if (auth.user) {
		const doItForValue = await getDoc(doc(db, "users", auth.user.uid));
		if (doItForValue.exists()) {
			doItFor.value = doItForValue.data().doItFor;
		}

		const motivationsArray = await getDocs(
			query(
				collection(db, "users", auth.user.uid, "motivations"),
				orderBy("createdAt", "desc"),
			),
		);
		motivations.value = motivationsArray.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
	} else {
		doItFor.value = localStorage.getItem("doItFor") ?? "";

		motivations.value = JSON.parse(
			localStorage.getItem("motivations") ?? "[]",
		).reverse();
	}
}

async function handleDelete(id) {
	if (auth.user) {
		await deleteDoc(doc(db, "users", auth.user.uid, "motivations", id));
		motivations.value = motivations.value.filter((m) => m.id !== id);
	} else {
		const updated = motivations.value.filter((m) => m.id !== id);
		motivations.value = updated;
		localStorage.setItem("motivations", JSON.stringify(updated));
	}
}

const addMotivation = () => {
	router.push("/add");
};

onBeforeMount(() => loadUserData());
</script>

<template>
	<div>
		<p>Loggato come: {{ auth.user?.email ?? "Ospite" }}</p>
		<button @click="handleLogout">Logout</button>

		<h1>Do it for {{ doItFor }}</h1>

		<button @click="addMotivation">Add</button>

		<ul>
			<li v-for="motivation in motivations" :key="motivation.id">
				{{ motivation.text }}
				{{ motivation.image }}

				<button @click="handleDelete(motivation.id)">Delete</button>
			</li>
		</ul>
	</div>
</template>

<style lang="scss"></style>

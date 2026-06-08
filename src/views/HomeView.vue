<script setup>
import { onBeforeMount, ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

const doItFor = ref("");

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
	await auth.logout();
	router.push("/");
}

async function loadUserData() {
	if (auth.user) {
		const snap = await getDoc(doc(db, "users", auth.user.uid));
		if (snap.exists()) {
			doItFor.value = snap.data().doItFor;
		}
	} else {
		doItFor.value = localStorage.getItem("doItFor") ?? "";
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

		<ul></ul>
	</div>
</template>

<style lang="scss"></style>

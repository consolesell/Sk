import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBx-cS3l5_49Q2-xs5hqe5BKs79Laz4B0o",
  authDomain: "leotu-5c2b5.firebaseapp.com",
  databaseURL: "https://leotu-5c2b5-default-rtdb.firebaseio.com",
  projectId: "leotu-5c2b5",
  storageBucket: "leotu-5c2b5.firebasestorage.app",
  messagingSenderId: "694359717732",
  appId: "1:694359717732:web:1e79cc09e8e991f7322c71"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveBooking(userId, service, location) {
  try {
    const docRef = await addDoc(collection(db, "bookings"), {
      userId,
      service,
      location,
      timestamp: new Date(),
      status: "pending"
    });
    console.log("Booking saved:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving booking:", error);
    throw error;
  }
}

export async function getBookings(userId) {
  try {
    const querySnapshot = await getDocs(collection(db, "bookings"));
    const bookings = [];
    querySnapshot.forEach((doc) => {
      if (doc.data().userId === userId) {
        bookings.push({ id: doc.id, ...doc.data() });
      }
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
}

export async function deleteBooking(bookingId) {
  try {
    await deleteDoc(doc(db, "bookings", bookingId));
    console.log("Booking deleted:", bookingId);
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
}
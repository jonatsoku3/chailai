import { collection, getDocs, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, Timestamp, query, where, writeBatch, documentId, Unsubscribe, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import type { Service, UserProfile, Booking, Payment, AvailabilityBlock, Customer, Employee } from '../types';

// --- Type Guards ---
const isEmployee = (user: UserProfile): user is Employee => user.role === 'technician' || user.role === 'admin';
const isCustomer = (user: UserProfile): user is Customer => user.role === 'customer';

// --- Firestore Collections ---
const servicesCol = collection(db, 'services');
const usersCol = collection(db, 'users');
const bookingsCol = collection(db, 'bookings');
const paymentsCol = collection(db, 'payments');
const availabilityBlocksCol = collection(db, 'availabilityBlocks');

// --- Helper to convert Firestore Timestamps to Dates ---
const fromFirestore = <T extends {}>(data: T): T => {
    if (!data) return data;
    const converted: any = { ...data };
    for (const key in converted) {
        if (converted[key] instanceof Timestamp) {
            converted[key] = converted[key].toDate();
        }
    }
    return converted as T;
};

// --- Realtime Data Subscriptions ---

export const onServicesUpdate = (callback: (services: Service[]) => void): Unsubscribe => {
    return onSnapshot(servicesCol, (snapshot) => {
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as Service));
        callback(services);
    });
};

export const onUsersUpdate = (callback: (customers: Customer[], employees: Employee[]) => void): Unsubscribe => {
    return onSnapshot(usersCol, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...fromFirestore(doc.data()) } as UserProfile));
        const customers = users.filter(isCustomer);
        const employees = users.filter(isEmployee);
        callback(customers, employees);
    });
};

export const onBookingsUpdate = (callback: (bookings: Booking[]) => void): Unsubscribe => {
    let services: Service[] = [];
    // Fetch initial services to enrich bookings
    getDocs(servicesCol).then(serviceSnapshot => {
        services = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    });

    return onSnapshot(query(bookingsCol), (bookingSnapshot) => {
        const bookings = bookingSnapshot.docs.map(doc => {
            const bookingData = { id: doc.id, ...fromFirestore(doc.data()) } as Booking;
            const service = services.find(s => s.id === bookingData.serviceId);
            bookingData.service = service || bookingData.service || { id: bookingData.serviceId, name: 'Deleted Service', price: 0, duration: 0, image: '', category: '', description: '' };
            return bookingData;
        }).sort((a, b) => a.date.getTime() - b.date.getTime());
        callback(bookings);
    });
};

export const onPaymentsUpdate = (callback: (payments: Payment[]) => void): Unsubscribe => {
    return onSnapshot(paymentsCol, (snapshot) => {
        const payments = snapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as Payment));
        callback(payments);
    });
};

export const onAvailabilityBlocksUpdate = (callback: (blocks: AvailabilityBlock[]) => void): Unsubscribe => {
    return onSnapshot(availabilityBlocksCol, (snapshot) => {
        const blocks = snapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as AvailabilityBlock));
        callback(blocks.sort((a, b) => a.date.getTime() - b.date.getTime()));
    });
};


// --- GETTERS (for one-time fetches) ---
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userDocRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return { uid: docSnap.id, ...fromFirestore(docSnap.data()) } as UserProfile;
    }
    return null;
};

// --- DATA MUTATIONS ---

// Users (Customers/Employees)
export const addUserProfile = (uid: string, data: Omit<UserProfile, 'uid'>) => setDoc(doc(db, 'users', uid), data);
export const updateUserProfile = (uid: string, data: Partial<UserProfile>) => updateDoc(doc(db, 'users', uid), data);
export const deleteUserProfile = (uid: string) => deleteDoc(doc(db, 'users', uid));

// Services
export const addService = (data: Omit<Service, 'id'>) => addDoc(servicesCol, data);
export const updateService = (id: string, data: Partial<Service>) => updateDoc(doc(db, 'services', id), data);
export const deleteService = (id: string) => deleteDoc(doc(db, 'services', id));

// Bookings & Payments
export const addBookingWithPayment = async (
    bookingData: Omit<Booking, 'id' | 'service'>, 
    paymentData: Omit<Payment, 'id' | 'bookingId'>
) => {
    const newBookingRef = doc(collection(db, 'bookings'));
    const newPaymentRef = doc(collection(db, 'payments'));
    
    const batch = writeBatch(db);
    batch.set(newBookingRef, { ...bookingData, date: Timestamp.fromDate(bookingData.date) });
    batch.set(newPaymentRef, { ...paymentData, bookingId: newBookingRef.id });

    await batch.commit();
};

export const addWalkInBooking = (bookingData: Omit<Booking, 'id' | 'service'>) => {
    return addDoc(bookingsCol, { ...bookingData, date: Timestamp.fromDate(bookingData.date) });
};

export const updateBooking = (id: string, data: Partial<Booking>) => {
    const updateData: any = { ...data };
    if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
    }
    delete updateData.service; 
    return updateDoc(doc(db, 'bookings', id), updateData);
};
export const deleteBooking = (id: string) => deleteDoc(doc(db, 'bookings', id));

// Availability Blocks
export const addBlock = (data: Omit<AvailabilityBlock, 'id'>) => addDoc(availabilityBlocksCol, { ...data, date: Timestamp.fromDate(data.date) });
export const removeBlock = (id: string) => deleteDoc(doc(db, 'availabilityBlocks', id));

import { db, Timestamp } from '../firebase';
import type { Service, UserProfile, Booking, Payment, AvailabilityBlock, Customer, Employee } from '../types';

// --- Type Guards ---
const isEmployee = (user: UserProfile): user is Employee => user.role === 'technician' || user.role === 'admin';
const isCustomer = (user: UserProfile): user is Customer => user.role === 'customer';

// --- Helper to convert Firestore Timestamps to Dates ---
const fromFirestore = <T extends {}>(data: any): T => {
    if (!data) return data;
    const converted: any = { ...data };
    for (const key in converted) {
        // Check if the property is a Firestore Timestamp by duck typing or instanceof if available
        if (converted[key] && typeof converted[key].toDate === 'function') {
            converted[key] = converted[key].toDate();
        }
    }
    return converted as T;
};

// --- Realtime Data Subscriptions ---

export const onServicesUpdate = (callback: (services: Service[]) => void) => {
    return db.collection('services').onSnapshot((snapshot) => {
        const services = snapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as Service));
        callback(services);
    });
};

export const onUsersUpdate = (callback: (customers: Customer[], employees: Employee[]) => void) => {
    return db.collection('users').onSnapshot((snapshot) => {
        const users = snapshot.docs.map(doc => ({ uid: doc.id, ...fromFirestore(doc.data()) } as UserProfile));
        const customers = users.filter(isCustomer);
        const employees = users.filter(isEmployee);
        callback(customers, employees);
    });
};

export const onBookingsUpdate = (callback: (bookings: Booking[]) => void) => {
    return db.collection('bookings').onSnapshot(async (bookingSnapshot) => {
        try {
            const serviceSnapshot = await db.collection('services').get();
            const services = serviceSnapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as Service));

            const bookings = bookingSnapshot.docs.map(doc => {
                const bookingData = { id: doc.id, ...fromFirestore(doc.data()) } as Booking;
                const service = services.find(s => s.id === bookingData.serviceId);
                
                bookingData.service = service || { 
                    id: bookingData.serviceId, 
                    name: 'Deleted Service', 
                    price: 0, 
                    duration: 0, 
                    image: '', 
                    category: '', 
                    description: 'This service is no longer available.' 
                };
                return bookingData;
            }).sort((a, b) => a.date.getTime() - b.date.getTime());
            
            callback(bookings);
        } catch (error) {
            console.error("Error processing booking updates:", error);
            callback([]); // Return empty array on error to prevent crashing
        }
    });
};

export const onPaymentsUpdate = (callback: (payments: Payment[]) => void) => {
    return db.collection('payments').onSnapshot((snapshot) => {
        const payments = snapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as Payment));
        callback(payments);
    });
};

export const onAvailabilityBlocksUpdate = (callback: (blocks: AvailabilityBlock[]) => void) => {
    return db.collection('availabilityBlocks').onSnapshot((snapshot) => {
        const blocks = snapshot.docs.map(doc => ({ id: doc.id, ...fromFirestore(doc.data()) } as AvailabilityBlock));
        callback(blocks.sort((a, b) => a.date.getTime() - b.date.getTime()));
    });
};


// --- GETTERS (for one-time fetches) ---
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docSnap = await db.collection('users').doc(uid).get();
    if (docSnap.exists) {
        return { uid: docSnap.id, ...fromFirestore(docSnap.data()) } as UserProfile;
    }
    return null;
};

// --- DATA MUTATIONS ---

// Users (Customers/Employees)
export const addUserProfile = (uid: string, data: Omit<UserProfile, 'uid'>) => db.collection('users').doc(uid).set(data);
export const updateUserProfile = (uid: string, data: Partial<UserProfile>) => db.collection('users').doc(uid).update(data);
export const deleteUserProfile = (uid: string) => db.collection('users').doc(uid).delete();

// Services
export const addService = (data: Omit<Service, 'id'>) => db.collection('services').add(data);
export const updateService = (id: string, data: Partial<Service>) => db.collection('services').doc(id).update(data);
export const deleteService = (id: string) => db.collection('services').doc(id).delete();

// Bookings & Payments
export const addBookingWithPayment = async (
    bookingData: Omit<Booking, 'id' | 'service'>, 
    paymentData: Omit<Payment, 'id' | 'bookingId'>
) => {
    const newBookingRef = db.collection('bookings').doc();
    const newPaymentRef = db.collection('payments').doc();
    
    const batch = db.batch();
    batch.set(newBookingRef, { ...bookingData, date: Timestamp.fromDate(bookingData.date) });
    batch.set(newPaymentRef, { ...paymentData, bookingId: newBookingRef.id });

    await batch.commit();
};

export const addWalkInBooking = (bookingData: Omit<Booking, 'id' | 'service'>) => {
    return db.collection('bookings').add({ ...bookingData, date: Timestamp.fromDate(bookingData.date) });
};

export const updateBooking = (id: string, data: Partial<Booking>) => {
    const updateData: any = { ...data };
    if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
    }
    delete updateData.service; 
    return db.collection('bookings').doc(id).update(updateData);
};
export const deleteBooking = (id: string) => db.collection('bookings').doc(id).delete();

// Availability Blocks
export const addBlock = (data: Omit<AvailabilityBlock, 'id'>) => db.collection('availabilityBlocks').add({ ...data, date: Timestamp.fromDate(data.date) });
export const removeBlock = (id: string) => db.collection('availabilityBlocks').doc(id).delete();

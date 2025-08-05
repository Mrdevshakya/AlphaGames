import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const TOURNAMENTS_COLLECTION = 'tournaments';

export const tournamentService = {
  // Create a new tournament
  async createTournament(tournamentData) {
    try {
      const tournament = {
        ...tournamentData,
        participants: [],
        currentParticipants: 0,
        status: 'open', // open, started, completed, cancelled
        rounds: [],
        currentRound: 0,
        winners: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, TOURNAMENTS_COLLECTION), tournament);
      return docRef.id;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  },

  // Get all tournaments
  async getAllTournaments() {
    try {
      const q = query(
        collection(db, TOURNAMENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tournaments = [];
      
      querySnapshot.forEach((doc) => {
        tournaments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return tournaments;
    } catch (error) {
      console.error('Error getting tournaments:', error);
      throw error;
    }
  },

  // Get tournament by ID
  async getTournamentById(id) {
    try {
      const docRef = doc(db, TOURNAMENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting tournament:', error);
      throw error;
    }
  },

  // Update tournament
  async updateTournament(id, tournamentData) {
    try {
      const docRef = doc(db, TOURNAMENTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...tournamentData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  },

  // Delete tournament
  async deleteTournament(id) {
    try {
      const docRef = doc(db, TOURNAMENTS_COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  },

  // Start tournament
  async startTournament(id) {
    try {
      const docRef = doc(db, TOURNAMENTS_COLLECTION, id);
      await updateDoc(docRef, {
        status: 'started',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error starting tournament:', error);
      throw error;
    }
  },

  // Cancel tournament
  async cancelTournament(id) {
    try {
      const docRef = doc(db, TOURNAMENTS_COLLECTION, id);
      await updateDoc(docRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error cancelling tournament:', error);
      throw error;
    }
  },

  // Complete tournament
  async completeTournament(id, winners) {
    try {
      const docRef = doc(db, TOURNAMENTS_COLLECTION, id);
      await updateDoc(docRef, {
        status: 'completed',
        winners,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error completing tournament:', error);
      throw error;
    }
  }
};
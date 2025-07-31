import { firebaseService } from './firebaseService';
import { multiplayerService } from './multiplayerService';
import { notificationService } from './notificationService';

class TournamentService {
  constructor() {
    this.activeTournaments = new Map();
    this.tournamentListeners = new Map();
  }

  // Create a new tournament
  async createTournament(tournamentData, creatorId) {
    try {
      const tournament = {
        ...tournamentData,
        creatorId,
        participants: [],
        currentParticipants: 0,
        status: 'open', // open, started, completed, cancelled
        rounds: [],
        currentRound: 0,
        winners: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tournamentId = await firebaseService.createTournament(tournament);
      
      // Schedule tournament start notification
      if (tournament.startTime) {
        await notificationService.scheduleTournamentReminder(
          tournament.name,
          tournament.startTime
        );
      }

      return tournamentId;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  // Join a tournament
  async joinTournament(tournamentId, userId) {
    try {
      // Check user's wallet balance
      const user = await firebaseService.getUser(userId);
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'open') {
        throw new Error('Tournament is not open for registration');
      }

      if (tournament.participants.includes(userId)) {
        throw new Error('Already registered for this tournament');
      }

      if (tournament.currentParticipants >= tournament.maxParticipants) {
        throw new Error('Tournament is full');
      }

      if (user.walletBalance < tournament.entryFee) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct entry fee
      await firebaseService.updateWalletBalance(
        userId,
        tournament.entryFee,
        'subtract',
        `Tournament entry fee - ${tournament.name}`
      );

      // Add to tournament
      await firebaseService.joinTournament(tournamentId, userId);

      // Send confirmation notification
      await notificationService.sendLocalNotification(
        'Tournament Joined!',
        `You have successfully joined ${tournament.name}`,
        {
          type: 'tournament_joined',
          tournamentId,
        }
      );

      return true;
    } catch (error) {
      console.error('Error joining tournament:', error);
      throw error;
    }
  }

  // Start a tournament
  async startTournament(tournamentId) {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'open') {
        throw new Error('Tournament cannot be started');
      }

      if (tournament.participants.length < 2) {
        throw new Error('Need at least 2 participants to start tournament');
      }

      // Create tournament bracket
      const bracket = this.createTournamentBracket(tournament.participants);
      
      // Update tournament status
      await firebaseService.updateTournament(tournamentId, {
        status: 'started',
        bracket,
        startedAt: new Date(),
        currentRound: 1,
      });

      // Create first round matches
      await this.createRoundMatches(tournamentId, bracket[0]);

      // Notify all participants
      for (const participantId of tournament.participants) {
        await notificationService.sendLocalNotification(
          'Tournament Started!',
          `${tournament.name} has begun. Good luck!`,
          {
            type: 'tournament_started',
            tournamentId,
          }
        );
      }

      return bracket;
    } catch (error) {
      console.error('Error starting tournament:', error);
      throw error;
    }
  }

  // Create tournament bracket
  createTournamentBracket(participants) {
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
    const bracket = [];
    let currentRound = shuffledParticipants;

    while (currentRound.length > 1) {
      const nextRound = [];
      const matches = [];

      for (let i = 0; i < currentRound.length; i += 2) {
        if (i + 1 < currentRound.length) {
          // Pair of players
          matches.push({
            player1: currentRound[i],
            player2: currentRound[i + 1],
            winner: null,
            gameId: null,
            status: 'pending', // pending, playing, completed
          });
          nextRound.push(null); // Placeholder for winner
        } else {
          // Odd player gets bye
          matches.push({
            player1: currentRound[i],
            player2: null,
            winner: currentRound[i],
            gameId: null,
            status: 'completed',
          });
          nextRound.push(currentRound[i]);
        }
      }

      bracket.push(matches);
      currentRound = nextRound;
    }

    return bracket;
  }

  // Create matches for a round
  async createRoundMatches(tournamentId, roundMatches) {
    try {
      const matchPromises = roundMatches.map(async (match, index) => {
        if (match.player2 === null) {
          // Bye match, already completed
          return match;
        }

        // Create multiplayer room for this match
        const roomSettings = {
          roomName: `Tournament Match ${index + 1}`,
          maxPlayers: 2,
          entryFee: 0,
          isPrivate: true,
          gameMode: 'tournament',
          tournamentId,
          matchIndex: index,
        };

        const { roomCode, gameId } = await multiplayerService.createRoom(
          roomSettings,
          match.player1
        );

        // Auto-join second player
        await multiplayerService.joinRoom(roomCode, match.player2);

        // Update match with game info
        match.gameId = gameId;
        match.roomCode = roomCode;
        match.status = 'ready';

        return match;
      });

      const updatedMatches = await Promise.all(matchPromises);
      
      // Update tournament with match info
      await firebaseService.updateTournament(tournamentId, {
        [`bracket.0`]: updatedMatches,
      });

      return updatedMatches;
    } catch (error) {
      console.error('Error creating round matches:', error);
      throw error;
    }
  }

  // Handle match completion
  async handleMatchCompletion(tournamentId, roundIndex, matchIndex, winnerId) {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Update match result
      const bracket = tournament.bracket;
      bracket[roundIndex][matchIndex].winner = winnerId;
      bracket[roundIndex][matchIndex].status = 'completed';

      // Check if round is complete
      const roundComplete = bracket[roundIndex].every(match => match.status === 'completed');

      if (roundComplete) {
        if (roundIndex + 1 < bracket.length) {
          // Advance winners to next round
          await this.advanceToNextRound(tournamentId, roundIndex);
        } else {
          // Tournament complete
          await this.completeTournament(tournamentId, winnerId);
        }
      }

      // Update tournament
      await firebaseService.updateTournament(tournamentId, {
        bracket,
        updatedAt: new Date(),
      });

    } catch (error) {
      console.error('Error handling match completion:', error);
      throw error;
    }
  }

  // Advance winners to next round
  async advanceToNextRound(tournamentId, completedRoundIndex) {
    try {
      const tournament = await this.getTournament(tournamentId);
      const nextRoundIndex = completedRoundIndex + 1;
      const nextRoundMatches = tournament.bracket[nextRoundIndex];

      // Fill in winners from completed round
      const winners = tournament.bracket[completedRoundIndex]
        .map(match => match.winner)
        .filter(winner => winner !== null);

      // Create matches for next round
      for (let i = 0; i < nextRoundMatches.length; i++) {
        const match = nextRoundMatches[i];
        
        if (match.player1 === null && winners.length > i * 2) {
          match.player1 = winners[i * 2];
        }
        
        if (match.player2 === null && winners.length > i * 2 + 1) {
          match.player2 = winners[i * 2 + 1];
        }

        // Create room if both players are set
        if (match.player1 && match.player2) {
          const roomSettings = {
            roomName: `Tournament Round ${nextRoundIndex + 1} Match ${i + 1}`,
            maxPlayers: 2,
            entryFee: 0,
            isPrivate: true,
            gameMode: 'tournament',
            tournamentId,
            matchIndex: i,
          };

          const { roomCode, gameId } = await multiplayerService.createRoom(
            roomSettings,
            match.player1
          );

          await multiplayerService.joinRoom(roomCode, match.player2);

          match.gameId = gameId;
          match.roomCode = roomCode;
          match.status = 'ready';
        }
      }

      // Update tournament
      await firebaseService.updateTournament(tournamentId, {
        bracket: tournament.bracket,
        currentRound: nextRoundIndex + 1,
        updatedAt: new Date(),
      });

      // Notify advancing players
      for (const winnerId of winners) {
        await notificationService.sendLocalNotification(
          'Advanced to Next Round!',
          `You have advanced to round ${nextRoundIndex + 1}`,
          {
            type: 'tournament_advance',
            tournamentId,
            round: nextRoundIndex + 1,
          }
        );
      }

    } catch (error) {
      console.error('Error advancing to next round:', error);
      throw error;
    }
  }

  // Complete tournament
  async completeTournament(tournamentId, winnerId) {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      // Calculate prize distribution
      const totalPrize = tournament.entryFee * tournament.currentParticipants;
      const platformFee = totalPrize * 0.1; // 10% platform fee
      const prizePool = totalPrize - platformFee;

      // Distribute prizes
      const prizeDistribution = this.calculatePrizeDistribution(
        prizePool,
        tournament.currentParticipants
      );

      // Award winner
      if (prizeDistribution.length > 0) {
        await firebaseService.updateWalletBalance(
          winnerId,
          prizeDistribution[0].prize,
          'add',
          `Tournament winner - ${tournament.name}`
        );

        await notificationService.notifyGameWin(prizeDistribution[0].prize);
      }

      // Update tournament status
      await firebaseService.updateTournament(tournamentId, {
        status: 'completed',
        winner: winnerId,
        prizeDistribution,
        completedAt: new Date(),
      });

      // Notify all participants
      for (const participantId of tournament.participants) {
        const message = participantId === winnerId 
          ? `Congratulations! You won ${tournament.name}!`
          : `${tournament.name} has ended. Better luck next time!`;

        await notificationService.sendLocalNotification(
          'Tournament Completed',
          message,
          {
            type: 'tournament_completed',
            tournamentId,
            winner: winnerId,
          }
        );
      }

    } catch (error) {
      console.error('Error completing tournament:', error);
      throw error;
    }
  }

  // Calculate prize distribution
  calculatePrizeDistribution(prizePool, participants) {
    const distribution = [];
    
    // Winner gets 70%
    distribution.push({
      position: 1,
      prize: Math.round(prizePool * 0.7),
      percentage: 70
    });
    
    // Runner-up gets 20% (if 4+ participants)
    if (participants >= 4) {
      distribution.push({
        position: 2,
        prize: Math.round(prizePool * 0.2),
        percentage: 20
      });
    }
    
    // Third place gets 10% (if 8+ participants)
    if (participants >= 8) {
      distribution.push({
        position: 3,
        prize: Math.round(prizePool * 0.1),
        percentage: 10
      });
    }
    
    return distribution;
  }

  // Get tournament details
  async getTournament(tournamentId) {
    try {
      return await firebaseService.getTournament(tournamentId);
    } catch (error) {
      console.error('Error getting tournament:', error);
      return null;
    }
  }

  // Get user's tournaments
  async getUserTournaments(userId) {
    try {
      // This would need a custom query in a real implementation
      const allTournaments = await firebaseService.getTournaments();
      return allTournaments.filter(tournament => 
        tournament.participants.includes(userId)
      );
    } catch (error) {
      console.error('Error getting user tournaments:', error);
      return [];
    }
  }

  // Get tournament leaderboard
  async getTournamentLeaderboard(tournamentId) {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) return [];

      // Calculate leaderboard based on tournament progress
      const leaderboard = [];
      
      if (tournament.status === 'completed') {
        // Final results
        leaderboard.push({
          position: 1,
          userId: tournament.winner,
          status: 'Winner',
          prize: tournament.prizeDistribution?.[0]?.prize || 0,
        });
        
        // Add other positions based on bracket results
        // This would need more complex logic to determine exact positions
      } else if (tournament.status === 'started') {
        // Current standings
        const activeParticipants = tournament.participants.filter(userId => {
          // Check if still in tournament
          return this.isPlayerStillInTournament(tournament, userId);
        });
        
        activeParticipants.forEach((userId, index) => {
          leaderboard.push({
            position: index + 1,
            userId,
            status: 'Active',
            currentRound: tournament.currentRound,
          });
        });
      }
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting tournament leaderboard:', error);
      return [];
    }
  }

  // Check if player is still in tournament
  isPlayerStillInTournament(tournament, userId) {
    if (!tournament.bracket) return true;
    
    // Check latest round for player
    for (let roundIndex = tournament.bracket.length - 1; roundIndex >= 0; roundIndex--) {
      const round = tournament.bracket[roundIndex];
      
      for (const match of round) {
        if (match.player1 === userId || match.player2 === userId) {
          return match.winner === userId || match.status !== 'completed';
        }
      }
    }
    
    return false;
  }

  // Cancel tournament
  async cancelTournament(tournamentId, reason = 'Tournament cancelled') {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status === 'completed') {
        throw new Error('Cannot cancel completed tournament');
      }

      // Refund entry fees
      for (const participantId of tournament.participants) {
        await firebaseService.updateWalletBalance(
          participantId,
          tournament.entryFee,
          'add',
          `Tournament refund - ${tournament.name}`
        );
      }

      // Update tournament status
      await firebaseService.updateTournament(tournamentId, {
        status: 'cancelled',
        cancelReason: reason,
        cancelledAt: new Date(),
      });

      // Notify participants
      for (const participantId of tournament.participants) {
        await notificationService.sendLocalNotification(
          'Tournament Cancelled',
          `${tournament.name} has been cancelled. Entry fee refunded.`,
          {
            type: 'tournament_cancelled',
            tournamentId,
          }
        );
      }

    } catch (error) {
      console.error('Error cancelling tournament:', error);
      throw error;
    }
  }

  // Get tournament statistics
  async getTournamentStats(tournamentId) {
    try {
      const tournament = await this.getTournament(tournamentId);
      
      if (!tournament) return null;

      return {
        totalParticipants: tournament.currentParticipants,
        totalPrizePool: tournament.entryFee * tournament.currentParticipants,
        currentRound: tournament.currentRound,
        totalRounds: tournament.bracket?.length || 0,
        status: tournament.status,
        startTime: tournament.startTime,
        completedAt: tournament.completedAt,
      };
    } catch (error) {
      console.error('Error getting tournament stats:', error);
      return null;
    }
  }

  // Cleanup
  cleanup() {
    this.activeTournaments.clear();
    
    for (const [tournamentId, listener] of this.tournamentListeners) {
      if (listener) listener();
    }
    
    this.tournamentListeners.clear();
  }
}

// Export singleton instance
export const tournamentService = new TournamentService();
export default tournamentService;
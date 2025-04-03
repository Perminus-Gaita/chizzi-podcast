export class StrategyProfile {
  static templates = {
    aggressive: {
      weights: { offensive: 0.6, defensive: 0.2, control: 0.2 },
      traits: {
        riskTolerance: 0.8,
        specialCardUsage: 0.7,
        multiCardPreference: 0.6,
        suitControlPriority: 0.4,
      },
    },
    defensive: {
      weights: { offensive: 0.2, defensive: 0.6, control: 0.2 },
      traits: {
        riskTolerance: 0.3,
        specialCardUsage: 0.4,
        multiCardPreference: 0.3,
        suitControlPriority: 0.7,
      },
    },
    tactical: {
      weights: { offensive: 0.2, defensive: 0.2, control: 0.6 },
      traits: {
        riskTolerance: 0.5,
        specialCardUsage: 0.6,
        multiCardPreference: 0.4,
        suitControlPriority: 0.8,
      },
    },
    balanced: {
      weights: { offensive: 0.33, defensive: 0.33, control: 0.34 },
      traits: {
        riskTolerance: 0.5,
        specialCardUsage: 0.5,
        multiCardPreference: 0.5,
        suitControlPriority: 0.5,
      },
    },
  };

  constructor(id, name, userId, template = "balanced") {
    this.id = id;
    this.name = name;
    this.userId = userId;
    this.version = 1;
    this.lastUpdated = new Date();
    this.totalGamesPlayed = 0;
    this.wins = 0;

    // Core strategy weights
    this.weights = {
      offensive: 0.33, // Preference for aggressive plays
      defensive: 0.33, // Preference for defensive moves
      control: 0.34, // Preference for control plays
    };

    // Personality traits
    this.traits = {
      riskTolerance: 0.5, // 0 = very safe, 1 = very risky
      specialCardUsage: 0.5, // How aggressively to use special cards
      multiCardPreference: 0.5, // Preference for playing multiple cards
      suitControlPriority: 0.5, // How much to prioritize suit control
    };

    // Phase-specific adjustments
    this.phaseAdjustments = {
      early: {
        offensive: 0.2,
        defensive: 0.3,
        control: 0.5,
      },
      mid: {
        offensive: 0.4,
        defensive: 0.3,
        control: 0.3,
      },
      late: {
        offensive: 0.6,
        defensive: 0.2,
        control: 0.2,
      },
    };

    // Card type priorities
    this.cardPriorities = {
      answer: {
        base: 1.0,
        suitMatch: 1.5,
        withQuestion: 2.0,
      },
      question: {
        base: 2.0,
        withAnswer: 2.5,
        sequence: 3.0,
      },
      special: {
        jump: 3.0,
        kickback: 2.5,
        penalty: 2.0,
      },
    };

    // Situational rules
    this.situationalRules = {
      penaltyResponse: {
        blockPriority: 0.7, // Priority to block penalties
        counterPriority: 0.6, // Priority to counter with own penalty
        acceptThreshold: 0.3, // Threshold to accept penalty
      },
      questionResponse: {
        answerPriority: 0.8, // Priority to answer with matching card
        sequencePriority: 0.7, // Priority to start new sequence
        drawThreshold: 0.2, // Threshold to draw instead
      },
      suitControl: {
        matchingSuit: 0.8, // Priority for playing matching suit
        changeSuit: 0.6, // Threshold for changing suit
        aceUsage: 0.7, // Threshold for using Ace to control suit
      },
    };

    // Learned patterns (updated during gameplay)
    this.learnedPatterns = {
      successfulSequences: [], // Tracks successful card sequences
      opponentResponses: {}, // Maps moves to common opponent responses
      winningCombinations: [], // Tracks combinations that led to wins
      criticalDecisions: {}, // Stores outcomes of key decision points
    };

    if (template && StrategyProfile.templates[template]) {
      const templateConfig = StrategyProfile.templates[template];
      this.weights = { ...templateConfig.weights };
      this.traits = { ...templateConfig.traits };
    }
  }

  // Update strategy based on game results
  updateFromGameResult(gameData) {
    this.totalGamesPlayed++;
    if (gameData.isWin) this.wins++;

    // Update last played timestamp
    this.lastUpdated = new Date();

    // Analyze game data for pattern updates
    this.updateLearnedPatterns(gameData);

    // Adjust weights based on performance
    this.optimizeWeights(gameData);

    // Increment version
    this.version++;
  }

  // Update learned patterns from game data
  updateLearnedPatterns(gameData) {
    // Extract successful sequences
    const sequences = this.extractSuccessfulSequences(gameData);
    this.learnedPatterns.successfulSequences = [
      ...this.learnedPatterns.successfulSequences,
      ...sequences,
    ].slice(-50); // Keep last 50 successful sequences

    // Update opponent response patterns
    this.updateOpponentResponses(gameData);

    // Record winning combinations if game was won
    if (gameData.isWin) {
      this.learnedPatterns.winningCombinations.push(
        this.extractWinningCombination(gameData)
      );
    }

    // Update critical decision outcomes
    this.updateCriticalDecisions(gameData);
  }

  // Calculate move score based on current strategy
  calculateMoveScore(move, gameState) {
    let score = 0;

    // Base score from core weights
    score += this.weights.offensive * this.getOffensiveScore(move);
    score += this.weights.defensive * this.getDefensiveScore(move);
    score += this.weights.control * this.getControlScore(move);

    // Apply personality trait modifiers
    score *= this.getTraitModifier(move);

    // Apply phase-specific adjustments
    score *= this.getPhaseModifier(gameState);

    // Apply situational rules
    score *= this.getSituationalModifier(move, gameState);

    return score;
  }

  // Get modifier based on personality traits
  getTraitModifier(move) {
    let modifier = 1.0;

    // Risk tolerance impact
    if (this.isRiskyMove(move)) {
      modifier *= this.traits.riskTolerance;
    }

    // Special card usage impact
    if (this.isSpecialCard(move)) {
      modifier *= this.traits.specialCardUsage;
    }

    // Multi-card preference impact
    if (move.cards.length > 1) {
      modifier *= this.traits.multiCardPreference;
    }

    return modifier;
  }

  // Get modifier based on game phase
  getPhaseModifier(gameState) {
    const phase = this.determineGamePhase(gameState);
    return (
      this.phaseAdjustments[phase].offensive +
      this.phaseAdjustments[phase].defensive +
      this.phaseAdjustments[phase].control
    );
  }

  // Get modifier based on situational rules
  getSituationalModifier(move, gameState) {
    let modifier = 1.0;

    // Handle penalty situations
    if (gameState.isPenalty) {
      modifier *= this.getPenaltySituationModifier(move);
    }

    // Handle question situations
    if (gameState.isQuestion) {
      modifier *= this.getQuestionSituationModifier(move);
    }

    // Handle suit control
    modifier *= this.getSuitControlModifier(move, gameState);

    return modifier;
  }

  // Serialize strategy for storage
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      userId: this.userId,
      version: this.version,
      lastUpdated: this.lastUpdated,
      totalGamesPlayed: this.totalGamesPlayed,
      wins: this.wins,
      weights: this.weights,
      traits: this.traits,
      phaseAdjustments: this.phaseAdjustments,
      cardPriorities: this.cardPriorities,
      situationalRules: this.situationalRules,
      learnedPatterns: this.learnedPatterns,
    };
  }

  // Create strategy from stored data
  static fromJSON(data) {
    const strategy = new StrategyProfile(data.id, data.name, data.userId);
    Object.assign(strategy, {
      version: data.version,
      lastUpdated: new Date(data.lastUpdated),
      totalGamesPlayed: data.totalGamesPlayed,
      wins: data.wins,
      weights: data.weights,
      traits: data.traits,
      phaseAdjustments: data.phaseAdjustments,
      cardPriorities: data.cardPriorities,
      situationalRules: data.situationalRules,
      learnedPatterns: data.learnedPatterns,
    });
    return strategy;
  }
}

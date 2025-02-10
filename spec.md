Off-Chain Game Logic Requirements
4.1 Random Number Generation (RNG)
The game server uses a verifiable off-chain RNG (e.g., Chainlink VRF or a secure seed).
The hash of each roll is stored for auditability.
4.2 Dice Game Rules
1️⃣ Players deposit ERC-20 tokens and roll a d6.
2️⃣ If they roll 4, 5, or 6, they win and increase their balance.
3️⃣ If they roll 1 or 2, they lose everything.
4️⃣ If they roll a 3, they trigger a bonus game (rolling 3d6 for multipliers).
5️⃣ Players can cash out anytime before losing.

4.3 Bonus Round Mechanics
Triggered by rolling a 3.
Uses 3d6 for a multiplier-based payout.
The higher the sum, the bigger the reward (1.1x to 10x).
4.4 House Edge & Payout Calculation
Standard win: Pays 0.9x per win (instead of 1x) to give the house an edge.
Jackpot takes 10% of each bet.
The house profits ~5-10% over time.

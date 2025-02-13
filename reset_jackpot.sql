-- Reset jackpot table
UPDATE jackpot 
SET amount = 0,
    jackpot_won = false,
    last_updated = CURRENT_TIMESTAMP
WHERE id = 1;

-- Clear game data
TRUNCATE TABLE game_data;

-- Verify state
SELECT * FROM jackpot;
SELECT COUNT(*) FROM game_data; 
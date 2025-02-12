-- Create game_data table
CREATE TABLE IF NOT EXISTS game_data (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_state JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS game_data_user_id_idx ON game_data(user_id);

-- Enable Row Level Security
ALTER TABLE game_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own game data
CREATE POLICY "Users can only access their own game data"
  ON game_data
  FOR ALL
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_game_data_updated_at
  BEFORE UPDATE ON game_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create shared jackpot table
CREATE TABLE IF NOT EXISTS jackpot (
  id INTEGER PRIMARY KEY DEFAULT 1,
  amount DECIMAL(20, 3) NOT NULL DEFAULT 5.5,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial jackpot record
INSERT INTO jackpot (id, amount) VALUES (1, 5.5) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on jackpot table
ALTER TABLE jackpot ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read jackpot
CREATE POLICY "Anyone can read jackpot"
  ON jackpot
  FOR SELECT
  TO authenticated
  USING (true);

-- Only the service role can update jackpot
CREATE POLICY "Only service role can update jackpot"
  ON jackpot
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to update jackpot amount atomically
CREATE OR REPLACE FUNCTION update_jackpot(contribution DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  new_amount DECIMAL;
BEGIN
  UPDATE jackpot 
  SET amount = amount + contribution,
      last_updated = CURRENT_TIMESTAMP
  WHERE id = 1
  RETURNING amount INTO new_amount;
  
  RETURN new_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle game rolls
CREATE OR REPLACE FUNCTION handle_roll(
  p_current_bank DECIMAL,
  p_current_streak INTEGER,
  p_previous_rolls INTEGER[]
)
RETURNS JSON AS $$
DECLARE
  v_roll INTEGER;
  v_base_multiplier DECIMAL;
  v_streak_bonus DECIMAL;
  v_final_multiplier DECIMAL;
  v_payout DECIMAL;
  v_is_bust BOOLEAN;
  v_new_streak INTEGER;
  v_jackpot_contribution DECIMAL;
  v_new_jackpot DECIMAL;
  v_bonus_type TEXT;
  v_bonus_rolls INTEGER[];
BEGIN
  -- Generate random roll (1-6)
  v_roll := floor(random() * 6 + 1);
  
  -- Calculate multipliers based on roll
  CASE v_roll
    WHEN 1 THEN v_base_multiplier := 0    -- Bust
    WHEN 2 THEN v_base_multiplier := 0.8  -- Small loss
    WHEN 3 THEN v_base_multiplier := 0    -- Break even
    WHEN 4 THEN v_base_multiplier := 1.2  -- Small win
    WHEN 5 THEN v_base_multiplier := 1.5  -- Medium win
    WHEN 6 THEN v_base_multiplier := 0    -- Break even
  END;
  
  -- Calculate streak bonus (5% per level, max 50%)
  v_streak_bonus := LEAST(p_current_streak * 0.05, 0.5);
  
  -- Determine if bust
  v_is_bust := v_roll = 1;
  
  -- Calculate final multiplier and payout
  IF v_is_bust THEN
    v_final_multiplier := 0;
    v_payout := 0;
  ELSE
    v_final_multiplier := v_base_multiplier + v_streak_bonus;
    -- For break-even rolls, ensure at least keeping current bank plus streak
    IF (v_roll = 3 OR v_roll = 6) THEN
      v_final_multiplier := GREATEST(1 + v_streak_bonus, v_final_multiplier);
    END IF;
    v_payout := ROUND((p_current_bank * v_final_multiplier)::numeric, 3);
  END IF;
  
  -- Update streak
  v_new_streak := CASE WHEN v_is_bust THEN 0 ELSE p_current_streak + 1 END;
  
  -- Calculate jackpot contribution
  IF v_is_bust THEN
    v_jackpot_contribution := p_current_bank; -- 100% on bust
  ELSE
    v_jackpot_contribution := v_payout * 0.02; -- 2% of winnings
  END IF;
  
  -- Update jackpot
  SELECT update_jackpot(v_jackpot_contribution + 0.01) INTO v_new_jackpot;
  
  -- Check for bonus rounds
  IF v_roll IN (3, 6) THEN
    IF random() < 0.05 THEN -- 5% chance for MEGA
      v_bonus_type := 'MEGA_BONUS';
      v_bonus_rolls := ARRAY[6, 6, 6];
    ELSIF random() < 0.01 THEN -- 1% chance for MINI
      v_bonus_type := 'MINI_BONUS';
      v_bonus_rolls := ARRAY[3, 3];
    END IF;
  END IF;
  
  -- Return result as JSON
  RETURN json_build_object(
    'roll', v_roll,
    'payout', v_payout,
    'bonusType', v_bonus_type,
    'bonusRolls', v_bonus_rolls,
    'isBust', v_is_bust,
    'newStreak', v_new_streak,
    'jackpotContribution', v_jackpot_contribution,
    'multiplier', v_final_multiplier,
    'newJackpot', v_new_jackpot
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
-- Add jackpot_won column to jackpot table
ALTER TABLE jackpot ADD COLUMN IF NOT EXISTS jackpot_won BOOLEAN NOT NULL DEFAULT false;

-- Drop existing functions first
DROP FUNCTION IF EXISTS update_jackpot(DECIMAL);
DROP FUNCTION IF EXISTS reset_jackpot();
DROP FUNCTION IF EXISTS trigger_jackpot_win();

-- Create function to reset just the jackpot_won flag
CREATE OR REPLACE FUNCTION reset_jackpot_won()
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE jackpot 
  SET jackpot_won = false,
      last_updated = CURRENT_TIMESTAMP
  WHERE id = 1;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to reset jackpot
CREATE OR REPLACE FUNCTION reset_jackpot()
RETURNS DECIMAL AS $$
DECLARE
  new_amount DECIMAL;
BEGIN
  UPDATE jackpot 
  SET amount = 0,
      jackpot_won = false,
      last_updated = CURRENT_TIMESTAMP
  WHERE id = 1
  RETURNING amount INTO new_amount;
  
  RETURN new_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update_jackpot function with new return type
CREATE OR REPLACE FUNCTION update_jackpot(contribution DECIMAL)
RETURNS JSON AS $$
DECLARE
  new_amount DECIMAL;
  is_won BOOLEAN;
BEGIN
  -- First get current state
  SELECT jackpot_won INTO is_won FROM jackpot WHERE id = 1;
  
  -- Only update if jackpot hasn't been won
  IF NOT is_won THEN
    -- Add the contribution (from roll cost, bust, or win)
    UPDATE jackpot 
    SET amount = amount + contribution,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = 1
    RETURNING amount INTO new_amount;
  ELSE
    -- If won, just return current amount without updating
    SELECT amount INTO new_amount FROM jackpot WHERE id = 1;
  END IF;
  
  RETURN json_build_object(
    'amount', new_amount,
    'jackpot_won', is_won
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to trigger jackpot win
CREATE OR REPLACE FUNCTION trigger_jackpot_win()
RETURNS JSON AS $$
DECLARE
  won_amount DECIMAL;
BEGIN
  -- First get the current amount (what the player wins)
  SELECT amount INTO won_amount FROM jackpot WHERE id = 1;
  
  -- Then mark as won and set to 0
  UPDATE jackpot 
  SET amount = 0,
      jackpot_won = true,
      last_updated = CURRENT_TIMESTAMP
  WHERE id = 1;
  
  RETURN json_build_object(
    'won_amount', won_amount,
    'amount', 0,
    'jackpot_won', true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 
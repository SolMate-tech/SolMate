use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod token_tracker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, name: String) -> Result<()> {
        let tracker = &mut ctx.accounts.tracker;
        tracker.authority = ctx.accounts.authority.key();
        tracker.name = name;
        tracker.token_count = 0;
        Ok(())
    }

    pub fn add_token(ctx: Context<AddToken>, token_address: Pubkey, token_name: String, token_symbol: String) -> Result<()> {
        let tracker = &mut ctx.accounts.tracker;
        let token_data = &mut ctx.accounts.token_data;

        token_data.token_address = token_address;
        token_data.token_name = token_name;
        token_data.token_symbol = token_symbol;
        token_data.added_at = Clock::get()?.unix_timestamp;
        token_data.last_price_update = 0;
        token_data.price_usd = 0;
        token_data.price_sol = 0;
        token_data.risk_score = 0;
        token_data.is_active = true;

        tracker.token_count += 1;

        Ok(())
    }

    pub fn update_token_price(ctx: Context<UpdateTokenPrice>, price_usd: u64, price_sol: u64, risk_score: u8) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        
        token_data.price_usd = price_usd;
        token_data.price_sol = price_sol;
        token_data.risk_score = risk_score;
        token_data.last_price_update = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn toggle_token_status(ctx: Context<ToggleTokenStatus>) -> Result<()> {
        let token_data = &mut ctx.accounts.token_data;
        token_data.is_active = !token_data.is_active;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 32 + 8
    )]
    pub tracker: Account<'info, TokenTracker>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddToken<'info> {
    #[account(mut, has_one = authority)]
    pub tracker: Account<'info, TokenTracker>,
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 64 + 16 + 8 + 8 + 8 + 8 + 1 + 1
    )]
    pub token_data: Account<'info, TokenData>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTokenPrice<'info> {
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ToggleTokenStatus<'info> {
    #[account(mut)]
    pub token_data: Account<'info, TokenData>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct TokenTracker {
    pub authority: Pubkey,
    pub name: String,
    pub token_count: u64,
}

#[account]
pub struct TokenData {
    pub token_address: Pubkey,
    pub token_name: String,
    pub token_symbol: String,
    pub added_at: i64,
    pub last_price_update: i64,
    pub price_usd: u64,  // Price in USD (6 decimals)
    pub price_sol: u64,  // Price in SOL (9 decimals)
    pub risk_score: u8,  // 0-100 risk score
    pub is_active: bool,
} 
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{TokenAccount, Mint, mint_to, MintTo, Token};
use anchor_spl::metadata::{create_metadata_accounts_v3, create_master_edition_v3, CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata};
use mpl_token_metadata::pda::{find_master_edition_account, find_metadata_account};
use anchor_spl::metadata::mpl_token_metadata::types::DataV2;


declare_id!("BExr7pdwNn86aAJzH87ejTWeqhuNsRCoMHHhDmfJ8yWN");

#[program]
pub mod bookchain {

    use super::*;

    pub fn init_mint(ctx: Context<InitMint>, name: String, symbol: String, uri: String,) -> Result<()> {
        
        //create mint account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
             MintTo{mint: ctx.accounts.mint.to_account_info(),
                 to: ctx.accounts.associated_token_account.to_account_info(),
                 authority: ctx.accounts.signer.to_account_info(),
                },
            );

        mint_to(cpi_context, 1)?;
            // create metadata account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                mint_authority: ctx.accounts.signer.to_account_info(),
                update_authority: ctx.accounts.signer.to_account_info(),
                payer: ctx.accounts.signer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

            let data_v2 = DataV2 {
                name: name,
                symbol: symbol,
                uri: uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            };

        create_metadata_accounts_v3(cpi_context, data_v2, false, true, None)?;

        //create master edition account
        let cpi_context = CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                update_authority: ctx.accounts.signer.to_account_info(),
                mint_authority: ctx.accounts.signer.to_account_info(),
                payer: ctx.accounts.signer.to_account_info(),
                metadata: ctx.accounts.metadata_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        );

        create_master_edition_v3(cpi_context, None)?;
        Ok(())

    }

}

#[derive(Accounts)]
pub struct InitMint<'info> {
    
    /// CHECK: we are passing in this account ourselves
    #[account(mut, signer)]
    pub signer: AccountInfo<'info>,
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key(),
    )]
    // seeds = [b"mint".as_ref(), signer.key().as_ref()],
    // bump

    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = mint,
        associated_token::authority = signer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,
    /// CHECK: address
    #[account(mut,address=find_metadata_account(&mint.key()).0,)]
    pub metadata_account: AccountInfo<'info>,
    /// CHECK: address
    #[account(mut,address=find_master_edition_account(&mint.key()).0,)]
    pub master_edition_account: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>


}




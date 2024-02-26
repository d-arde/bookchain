use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{TokenAccount, Mint, mint_to, MintTo, Token};
use anchor_spl::metadata::{create_metadata_accounts_v3, create_master_edition_v3, CreateMasterEditionV3, CreateMetadataAccountsV3, Metadata};
use mpl_token_metadata::pda::{find_master_edition_account, find_metadata_account};
use anchor_spl::metadata::mpl_token_metadata::types::DataV2;


declare_id!("BExr7pdwNn86aAJzH87ejTWeqhuNsRCoMHHhDmfJ8yWN");

#[program]
pub mod bookchain {

    // use anchor_lang::solana_program::program::invoke;
    use anchor_spl::metadata::{mint_new_edition_from_master_edition_via_token, MintNewEditionFromMasterEditionViaToken};

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

    pub fn init_edition(ctx: Context<InitEdition>,
        owner_id: u64,
        id: u64,
        edition_num: u64,
        _edition_num_string: String,
    ) -> Result<()> {
        // let edition_info = vec![
        //     ctx.accounts.token_program.to_account_info(),
        //     ctx.accounts.new_metadata.to_account_info(),
        //     ctx.accounts.new_edition.to_account_info(),
        //     ctx.accounts.master_edition.to_account_info(),
        //     ctx.accounts.new_mint.to_account_info(),
        //     ctx.accounts.new_mint_authority.to_account_info(),
        //     ctx.accounts.payer.to_account_info(),
        //     ctx.accounts.token_account_owner.to_account_info(),
        //     ctx.accounts.token_account.to_account_info(),
        //     ctx.accounts.new_metadata_update_authority.to_account_info(),
        //     ctx.accounts.metadata.to_account_info(),
        //     ctx.accounts.system_prgram.to_account_info(),
        //     ctx.accounts.rent.to_account_info()
        // ];

        let owner_id_bytes = owner_id.to_le_bytes();
        let id_bytes = id.to_le_bytes();
        let seeds = &[
                    "mint".as_bytes(),
                    owner_id_bytes.as_ref(),
                    id_bytes.as_ref(),
                    &[ctx.bumps.new_mint],
        ];
        let binding = [&seeds[..]];

        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info()
            , MintNewEditionFromMasterEditionViaToken {
                new_metadata: ctx.accounts.metadata.to_account_info(),
                new_edition: ctx.accounts.new_edition.to_account_info(),
                master_edition: ctx.accounts.master_edition.to_account_info(),
                new_mint: ctx.accounts.new_mint.to_account_info(),
                edition_mark_pda: ctx.accounts.edition_mark_pda.to_account_info(),
                new_mint_authority: ctx.accounts.new_mint_authority.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                token_account_owner: ctx.accounts.token_account_owner.to_account_info(),
                token_account: ctx.accounts.token_account.to_account_info(),
                new_metadata_update_authority: ctx.accounts.new_mint_authority.to_account_info(),
                metadata: ctx.accounts.metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
                metadata_mint: ctx.accounts.master_edition.to_account_info()
            },
            &binding,
            );


        msg!("Edition Account Infos Assigned");
        // invoke(&mint_new_edition_from_master_edition_via_token(
        //     cpi_context, edition), 
        //     edition_info.as_slice())?;
        mint_new_edition_from_master_edition_via_token(cpi_context, edition_num)?;
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



// #[derive(Accounts)]
// pub struct InitEdition<'info> {
//     /// CHECK: we are passing the account
//     #[account(mut)]
//     pub new_metadata: UncheckedAccount<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub new_edition: UncheckedAccount<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub master_edition: UncheckedAccount<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub new_mint: UncheckedAccount<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub edition_mark_pda: UncheckedAccount<'info>,
//     #[account(mut)]
//     pub new_mint_authority: Signer<'info>,
//     /// CHECK: we do not read or write to this address, but changes
//     #[account(mut)]
//     pub payer: AccountInfo<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub token_account_owner: UncheckedAccount<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub token_account: UncheckedAccount<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub new_metadata_update_authority: UncheckedAccount<'info>,
//     /// CHECK: we do not read or write to this address
//     #[account(mut)]
//     pub metadata: UncheckedAccount<'info>,
//     pub token_program: Program<'info, Token>,
//     pub system_prgram: Program<'info, System>,
//      /// CHECK: This is not dangerous because we don't read or write from this account
//     pub rent: AccountInfo<'info>,
    
// }


#[derive(Accounts)]
#[instruction(owner_id: u64, id: u64, edition_num: u64, edition_num_string: String)]
pub struct InitEdition<'info> {
    //Owners Accounts
    
    #[account(signer)]
    pub owner_mint: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = new_mint_authority,
        mint::freeze_authority = new_mint_authority,
        seeds = ["mint".as_bytes(), owner_id.to_le_bytes().as_ref(), id.to_le_bytes().as_ref()],
        bump,
    )]
    pub new_mint: Account<'info, Mint>,
    #[account(
        init,
        payer = payer,
        associated_token::mint = new_mint,
        associated_token::authority = payer,
    )]
    pub token_account: Account<'info, TokenAccount>,
   
    #[account(mut, signer)] 
    pub token_account_owner: Signer<'info>,
    
    pub associated_token_program: Program<'info, AssociatedToken>,

    #[account(mut)]
    pub new_mint_authority: Signer<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,

    pub token_program: Program<'info, Token>,

    pub metadata_program: Program<'info, Metadata>,

    #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            metadata_program.key().as_ref(),
            new_mint.key().as_ref(),
            b"edition".as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK: Accounts validated in the CPI to Metaplex
    pub new_edition: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            metadata_program.key().as_ref(),
            owner_mint.key().as_ref(),
            b"edition".as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK: Accounts validated in the CPI to Metaplex
    pub master_edition: UncheckedAccount<'info>,
    
    #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            metadata_program.key().as_ref(),
            master_edition.key().as_ref(),
            b"edition".as_ref(),
            edition_num_string.as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK: Accounts validated in the CPI to Metaplex
    pub edition_mark_pda: UncheckedAccount<'info>,

      #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            metadata_program.key().as_ref(),
            new_mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK: Accounts validated in the CPI to Metaplex
    pub metadata: UncheckedAccount<'info>,

      #[account(
        mut,
        seeds = [
            b"metadata".as_ref(),
            metadata_program.key().as_ref(),
            owner_mint.key().as_ref(),
        ],
        bump,
        seeds::program = metadata_program.key()
    )]
    /// CHECK: Accounts validated in the CPI to Metaplex
    pub owner_nft_metadata: UncheckedAccount<'info>,
}



#[account]
pub struct TextBook {
    pub title: String,
    pub description: String,
    pub author: String,
    pub year: u32,
    pub price_usd: u32, 
    pub uri: String
}


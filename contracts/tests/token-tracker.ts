import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TokenTracker } from "../target/types/token_tracker";
import { expect } from "chai";

describe("token-tracker", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TokenTracker as Program<TokenTracker>;
  const authority = provider.wallet;

  let trackerPda: anchor.web3.PublicKey;
  let tokenDataPda: anchor.web3.PublicKey;
  const trackerName = "SolMate Token Tracker";
  const tokenAddress = new anchor.web3.PublicKey("So11111111111111111111111111111111111111112");
  const tokenName = "Wrapped SOL";
  const tokenSymbol = "SOL";

  before(async () => {
    // Find PDA for tracker
    [trackerPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("tracker"), authority.publicKey.toBuffer()],
      program.programId
    );

    // Find PDA for token data
    [tokenDataPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("token"), trackerPda.toBuffer(), tokenAddress.toBuffer()],
      program.programId
    );
  });

  it("Initializes the tracker", async () => {
    await program.methods
      .initialize(trackerName)
      .accounts({
        tracker: trackerPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const trackerAccount = await program.account.tokenTracker.fetch(trackerPda);
    expect(trackerAccount.name).to.equal(trackerName);
    expect(trackerAccount.tokenCount.toNumber()).to.equal(0);
    expect(trackerAccount.authority.toString()).to.equal(authority.publicKey.toString());
  });

  it("Adds a token", async () => {
    await program.methods
      .addToken(tokenAddress, tokenName, tokenSymbol)
      .accounts({
        tracker: trackerPda,
        tokenData: tokenDataPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const trackerAccount = await program.account.tokenTracker.fetch(trackerPda);
    expect(trackerAccount.tokenCount.toNumber()).to.equal(1);

    const tokenDataAccount = await program.account.tokenData.fetch(tokenDataPda);
    expect(tokenDataAccount.tokenAddress.toString()).to.equal(tokenAddress.toString());
    expect(tokenDataAccount.tokenName).to.equal(tokenName);
    expect(tokenDataAccount.tokenSymbol).to.equal(tokenSymbol);
    expect(tokenDataAccount.isActive).to.be.true;
  });

  it("Updates token price", async () => {
    const priceUsd = new anchor.BN(20_450_000); // $20.45 with 6 decimals
    const priceSol = new anchor.BN(1_000_000_000); // 1 SOL with 9 decimals
    const riskScore = 25; // Low risk

    await program.methods
      .updateTokenPrice(priceUsd, priceSol, riskScore)
      .accounts({
        tokenData: tokenDataPda,
        authority: authority.publicKey,
      })
      .rpc();

    const tokenDataAccount = await program.account.tokenData.fetch(tokenDataPda);
    expect(tokenDataAccount.priceUsd.toString()).to.equal(priceUsd.toString());
    expect(tokenDataAccount.priceSol.toString()).to.equal(priceSol.toString());
    expect(tokenDataAccount.riskScore).to.equal(riskScore);
    expect(tokenDataAccount.lastPriceUpdate.toNumber()).to.be.greaterThan(0);
  });

  it("Toggles token status", async () => {
    await program.methods
      .toggleTokenStatus()
      .accounts({
        tokenData: tokenDataPda,
        authority: authority.publicKey,
      })
      .rpc();

    let tokenDataAccount = await program.account.tokenData.fetch(tokenDataPda);
    expect(tokenDataAccount.isActive).to.be.false;

    // Toggle back to active
    await program.methods
      .toggleTokenStatus()
      .accounts({
        tokenData: tokenDataPda,
        authority: authority.publicKey,
      })
      .rpc();

    tokenDataAccount = await program.account.tokenData.fetch(tokenDataPda);
    expect(tokenDataAccount.isActive).to.be.true;
  });
}); 
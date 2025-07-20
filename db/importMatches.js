const { prisma } = require('./prisma');
const fs = require('fs');
const { parse } = require('csv-parse');

async function importMatches() {
  const records = [];
  const parser = fs.createReadStream('Match.csv').pipe(parse({ columns: true, trim: true }));
  for await (const record of parser) {
    records.push(mapMatchRecord(record));
  }
  console.log(`Parsed ${records.length} records from Match.csv`);
  await prisma.match.createMany({
    data: records,
    skipDuplicates: true, // Optional: skip duplicate records
  });
  console.log('Import complete!');
}

const mapMatchRecord = (record) => ({
  tourneyId: record.tourney_id,
  tourneyName: record.tourney_name,
  surface: record.surface,
  drawSize: record.draw_size,
  tourneyLevel: record.tourney_level,
  tourneyDate: record.tourney_date,
  matchNumber: record.match_num ? parseInt(record.match_num, 10) : null,

  winnerId: record.winner_id,
  winnerSeed: record.winner_seed,
  winnerEntry: record.winner_entry,
  winnerName: record.winner_name,
  winnerHand: record.winner_hand,
  winnerHeight: record.winner_ht ? parseInt(record.winner_ht, 10) : null,
  winnerCountry: record.winner_ioc,
  winnerAge: record.winner_age ? parseFloat(record.winner_age) : null,
  winnerRank: record.winner_rank ? parseInt(record.winner_rank, 10) : null,
  winnerRankPoints: record.winner_rank_points ? parseInt(record.winner_rank_points, 10) : null,

  loserId: record.loser_id,
  loserSeed: record.loser_seed,
  loserEntry: record.loser_entry,
  loserName: record.loser_name,
  loserHand: record.loser_hand,
  loserHeight: record.loser_ht ? parseInt(record.loser_ht, 10) : null,
  loserCountry: record.loser_ioc,
  loserAge: record.loser_age ? parseFloat(record.loser_age) : null,
  loserRank: record.loser_rank ? parseInt(record.loser_rank, 10) : null,
  loserRankPoints: record.loser_rank_points ? parseInt(record.loser_rank_points, 10) : null,

  score: record.score,
  bestOf: record.best_of ? parseInt(record.best_of, 10) : null,
  round: record.round,
  minutes: record.minutes ? parseInt(record.minutes, 10) : null,

  winnerAces: record.w_ace ? parseInt(record.w_ace, 10) : null,
  winnerDoubleFaults: record.w_df ? parseInt(record.w_df, 10) : null,
  winnerServicePointsPlayed: record.w_svpt ? parseInt(record.w_svpt, 10) : null,
  winner1stServeIn: record.w_1stIn ? parseInt(record.w_1stIn, 10) : null,
  winner1stServeWon: record.w_1stWon ? parseInt(record.w_1stWon, 10) : null,
  winner2ndServeWon: record.w_2ndWon ? parseInt(record.w_2ndWon, 10) : null,
  winnerServeGames: record.w_SvGms ? parseInt(record.w_SvGms, 10) : null,
  winnerBreakPointSaved: record.w_bpSaved ? parseInt(record.w_bpSaved, 10) : null,
  winnerBreakPointFaced: record.w_bpFaced ? parseInt(record.w_bpFaced, 10) : null,

  loserAces: record.l_ace ? parseInt(record.l_ace, 10) : null,
  loserDoubleFaults: record.l_df ? parseInt(record.l_df, 10) : null,
  loserServicePointsPlayed: record.l_svpt ? parseInt(record.l_svpt, 10) : null,
  loser1stServeIn: record.l_1stIn ? parseInt(record.l_1stIn, 10) : null,
  loser1stServeWon: record.l_1stWon ? parseInt(record.l_1stWon, 10) : null,
  loser2ndServeWon: record.l_2ndWon ? parseInt(record.l_2ndWon, 10) : null,
  loserServeGames: record.l_SvGms ? parseInt(record.l_SvGms, 10) : null,
  loserBreakPointSaved: record.l_bpSaved ? parseInt(record.l_bpSaved, 10) : null,
  loserBreakPointFaced: record.l_bpFaced ? parseInt(record.l_bpFaced, 10) : null,
});

importMatches().catch(console.error);

// Regression tests for the calculation engine. Run with: node test.js
// Loads the pure calc code (DEFAULT through findCrossover) straight out of
// index.html, so the tests always exercise what actually ships.
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const src  = html.slice(html.indexOf('const DEFAULT = {'), html.indexOf('const vertLinePlugin'));
const ctx  = {};
vm.runInNewContext(src + '\n;Object.assign(this, { DEFAULT, PRESETS, monthlyPayment, generateData, caIncomeTax });', ctx);
const { DEFAULT, PRESETS, monthlyPayment, generateData, caIncomeTax } = ctx;

let failed = 0;
function check(name, ok, detail = '') {
  console.log((ok ? '  ok   ' : '  FAIL ') + name + (ok ? '' : '  ' + detail));
  if (!ok) failed++;
}
const near = (a, b, tol = 2) => Math.abs(a - b) <= tol;
const starter = { ...DEFAULT, ...PRESETS[0].values };

// Every preset × feature combination must run (catches destructuring slips → ReferenceError / NaN)
for (const p of PRESETS) for (const extra of [{}, { refi: true }, { taxBenefits: true }, { investmentReturn: 4, investDiff: true }]) {
  let ok = true, err = '';
  try { ok = generateData({ ...DEFAULT, ...p.values, ...extra }).every(d => Object.values(d).every(Number.isFinite)); }
  catch (e) { ok = false; err = e.message; }
  check(`${p.label} ${JSON.stringify(extra)} → finite numbers`, ok, err);
}

// 1. Amortization: interest + principal repaid = payments made (no refi)
{
  const data = generateData(starter);
  const loan = starter.homePrice * (1 - starter.downPaymentPct / 100);
  const pi   = monthlyPayment(loan, starter.mortgageRate, starter.loanTerm);
  for (const y of [1, 7, 15]) {
    const d = data[y - 1];
    check(`amortization year ${y}`, near(d.cumInterest + (loan - d.balance), pi * 12 * y, 3),
      `${d.cumInterest + loan - d.balance} vs ${pi * 12 * y}`);
  }
}

// 2. Return 0% → 0.5% must move the renter's net cost smoothly (UI uses cumRent at 0%, rentNetCost above)
{
  const y  = starter.yearsToStay;
  const r0 = generateData({ ...starter, investmentReturn: 0 })[y - 1].cumRent;
  const r5 = generateData({ ...starter, investmentReturn: 0.5 })[y - 1].rentNetCost;
  check('0% → 0.5% return shifts < $20K', Math.abs(r0 - r5) < 20000, `shift ${r0 - r5}`);
}

// 3. Summary columns add up: paid out − recovered = net cost
for (const extra of [{}, { investmentReturn: 4, investDiff: true }, { taxBenefits: true, refi: true }]) {
  const d = generateData({ ...starter, ...extra })[starter.yearsToStay - 1];
  check(`buy column sums ${JSON.stringify(extra)}`, near(d.cumTotalSpent - d.saleProceeds, d.netBuyCost));
  check(`rent column sums ${JSON.stringify(extra)}`, near(d.cumRent + d.costBasis - d.portfolio, d.rentNetCost));
}

// 4. Known values: starter preset, tax benefits off (update deliberately if the model changes)
{
  const d = generateData(starter)[starter.yearsToStay - 1];
  const expect = { netBuyCost: 359826, cumRent: 362461, goneAtSale: 675758, saleProceeds: 436801 };
  for (const [k, v] of Object.entries(expect)) check(`starter year 7 ${k} = ${v}`, near(d[k], v), `got ${d[k]}`);
}

// 5. SALT: state income tax and property tax share one capped federal deduction
{
  check('CA income tax, $250K married = $15,066', near(caIncomeTax(250000, 'married'), 15066));
  // stateRate 0 isolates the federal side; once income tax fills the cap, property tax adds nothing
  const fed = (income, propertyTaxRate) => generateData({ ...starter, taxBenefits: true, stateRate: 0,
    income, propertyTaxRate })[6].cumTaxSavings;
  check('below the cap, higher property tax → more federal savings', fed(250000, 1.5) > fed(250000, 1.0));
  check('cap full at $450K: property tax adds no federal savings', fed(450000, 1.5) === fed(450000, 1.0));
  check('cap shrinks above $505K: $600K saves less than $450K', fed(600000, 1.0) < fed(450000, 1.0));
}

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);

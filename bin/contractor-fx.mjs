#!/usr/bin/env node

// src/cli.ts
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

// src/lib/fx-engine.ts
var REFERENCE_USD_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.39,
  CNY: 7.24,
  INR: 84.4,
  PHP: 58.6,
  BRL: 5.78,
  MXN: 20.15
};
var PROVIDER_MODELS = [
  {
    providerId: "wise",
    providerName: "Wise Business",
    seatFeePerContractorUsd: 0,
    computeFundingFeeUsd: (grossUsd, method) => {
      if (grossUsd <= 0) return 0;
      if (method === "ach-bank") return grossUsd * 43e-4 + 0.35;
      if (method === "wire") return 6.11 + grossUsd * 43e-4;
      return grossUsd * 0.029 + 0.3;
    },
    computeWithdrawalFixedFeeUsd: () => 0,
    crossCurrencySpreadPct: 0.48,
    buildNotes: (isSameCurrency) => isSameCurrency ? "Same-currency local bank transfer with 0% FX conversion markup and $0 monthly seat cost." : "Mid-market exchange rate with a transparent 0.48% conversion fee and $0 monthly seat cost."
  },
  {
    providerId: "payoneer",
    providerName: "Payoneer",
    seatFeePerContractorUsd: 0,
    computeFundingFeeUsd: (grossUsd, method) => {
      if (grossUsd <= 0) return 0;
      if (method === "ach-bank") return grossUsd * 0.01;
      if (method === "wire") return 15;
      return grossUsd * 0.03;
    },
    computeWithdrawalFixedFeeUsd: (grossUsd, _method, isSameCurrency) => {
      if (grossUsd <= 0 || !isSameCurrency) return 0;
      return Math.max(1.5, grossUsd * 0.02);
    },
    crossCurrencySpreadPct: 2.25,
    buildNotes: (isSameCurrency) => isSameCurrency ? "0% FX spread with a 2% same-currency bank withdrawal fee ($1.50 minimum) and $0 seat cost." : "$0 monthly seat fee, client funding fee plus ~2.25% hidden FX spread above mid-market."
  },
  {
    providerId: "deel",
    providerName: "Deel",
    seatFeePerContractorUsd: 49,
    computeFundingFeeUsd: (grossUsd, method) => {
      if (grossUsd <= 0) return 0;
      if (method === "card") return grossUsd * 0.035;
      return 0;
    },
    computeWithdrawalFixedFeeUsd: (grossUsd, method) => {
      if (grossUsd <= 0 || method === "ach-bank") return 0;
      return 5;
    },
    crossCurrencySpreadPct: 1.5,
    buildNotes: (isSameCurrency) => isSameCurrency ? "$49/contractor monthly SaaS seat fee with 0% FX spread on same-currency withdrawals." : "$49/contractor monthly SaaS seat fee plus ~1.5% contractor withdrawal FX spread."
  },
  {
    providerId: "remote",
    providerName: "Remote",
    seatFeePerContractorUsd: 29,
    computeFundingFeeUsd: (grossUsd, method) => {
      if (grossUsd <= 0) return 0;
      if (method === "card") return grossUsd * 0.035;
      return 0;
    },
    computeWithdrawalFixedFeeUsd: () => 0,
    crossCurrencySpreadPct: 1.25,
    buildNotes: (isSameCurrency) => isSameCurrency ? "$29/contractor monthly SaaS seat fee with $0 ACH funding and 0% same-currency FX spread." : "$29/contractor monthly SaaS seat fee plus ~1.25% FX conversion spread on payouts."
  },
  {
    providerId: "swift-wire",
    providerName: "Traditional Bank SWIFT",
    seatFeePerContractorUsd: 0,
    computeFundingFeeUsd: (grossUsd) => grossUsd > 0 ? 35 : 0,
    computeWithdrawalFixedFeeUsd: (grossUsd) => grossUsd > 0 ? 15 : 0,
    crossCurrencySpreadPct: 2.6,
    buildNotes: (isSameCurrency) => isSameCurrency ? "$35 outgoing bank wire plus $15 correspondent bank fee ($50 fixed rail bite) and 0% FX spread." : "$35 outgoing wire plus $15 correspondent bank fee ($50 fixed rail bite) and 2.6% bank FX desk spread."
  }
];
var VALID_BILLING_CURRENCIES = /* @__PURE__ */ new Set(["USD", "EUR", "GBP"]);
var VALID_PAYOUT_CURRENCIES = /* @__PURE__ */ new Set([
  "EUR",
  "GBP",
  "INR",
  "PHP",
  "BRL",
  "MXN",
  "CNY",
  "CAD"
]);
var VALID_PROVIDERS = /* @__PURE__ */ new Set(["wise", "payoneer", "deel", "remote", "swift-wire"]);
var REQUIRED_CSV_COLUMNS = [
  "contractor",
  "amount",
  "billing_currency",
  "payout_currency",
  "current_provider"
];
function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
function round6(value) {
  return Math.round((value + Number.EPSILON) * 1e6) / 1e6;
}
function formatMoney(value) {
  return round2(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function computeNetUsdReachingContractor(grossUsd, fundingFeeUsd, withdrawalFixedFeeUsd, fxLossUsd, feeBearer) {
  const deductedUsd = feeBearer === "contractor" ? fundingFeeUsd + withdrawalFixedFeeUsd + fxLossUsd : withdrawalFixedFeeUsd + fxLossUsd;
  return Math.max(0, grossUsd - deductedUsd);
}
function buildDeelBreakEvenNote(quotes, contractorCount) {
  const wise = quotes.find((q) => q.providerId === "wise");
  const deel = quotes.find((q) => q.providerId === "deel");
  const payoneer = quotes.find((q) => q.providerId === "payoneer");
  const wiseMonthlyUsd = round2(wise.annualFeeDragUsd / 12);
  const deelMonthlyUsd = round2(deel.annualFeeDragUsd / 12);
  const payoneerMonthlyUsd = round2(payoneer.annualFeeDragUsd / 12);
  const savedVsDeelMonthly = round2(deelMonthlyUsd - wiseMonthlyUsd);
  const savedVsDeelAnnual = round2(deel.annualFeeDragUsd - wise.annualFeeDragUsd);
  const savedVsPayoneerMonthly = round2(payoneerMonthlyUsd - wiseMonthlyUsd);
  const savedVsPayoneerAnnual = round2(payoneer.annualFeeDragUsd - wise.annualFeeDragUsd);
  const contractorLabel = contractorCount === 1 ? "contractor" : "contractors";
  return `Direct Wise Business saves $${formatMoney(savedVsDeelMonthly)}/month ($${formatMoney(savedVsDeelAnnual)}/year) vs Deel and $${formatMoney(savedVsPayoneerMonthly)}/month ($${formatMoney(savedVsPayoneerAnnual)}/year) vs Payoneer across ${contractorCount} ${contractorLabel}. Deel charges $${formatMoney(deel.platformMonthlyUsd)}/month in SaaS seat fees before FX spread, which only breaks even when you require managed contract compliance or automated tax filing.`;
}
function comparePayoutProviders(input, customMidRate) {
  const invoiceAmount = Math.max(0, input.invoiceAmount);
  const contractorCount = Math.max(1, Math.floor(input.contractorCount || 1));
  const payoutsPerMonth = Math.max(1, input.payoutsPerMonth || 1);
  const isSameCurrency = input.billingCurrency === input.payoutCurrency;
  const billingPerUsd = REFERENCE_USD_RATES[input.billingCurrency];
  const rawGrossUsd = invoiceAmount / billingPerUsd;
  const hasCustomMidRate = customMidRate !== void 0 && Number.isFinite(customMidRate) && customMidRate > 0;
  const rawMidMarketRate = hasCustomMidRate ? customMidRate : isSameCurrency ? 1 : REFERENCE_USD_RATES[input.payoutCurrency] / billingPerUsd;
  const targetPerUsd = billingPerUsd * rawMidMarketRate;
  const quotes = PROVIDER_MODELS.map((model) => {
    const platformMonthlyUsd = round2(model.seatFeePerContractorUsd * contractorCount);
    const proratedSeatPerInvoiceUsd = model.seatFeePerContractorUsd / payoutsPerMonth;
    const rawFundingFeeUsd = model.computeFundingFeeUsd(rawGrossUsd, input.fundingMethod);
    const rawWithdrawalFeeUsd = model.computeWithdrawalFixedFeeUsd(
      rawGrossUsd,
      input.fundingMethod,
      isSameCurrency
    );
    const fxSpreadPct = isSameCurrency ? 0 : model.crossCurrencySpreadPct;
    const rawFxLossUsd = rawGrossUsd * (fxSpreadPct / 100);
    const unroundedPerInvoiceDragUsd = proratedSeatPerInvoiceUsd + rawFundingFeeUsd + rawWithdrawalFeeUsd + rawFxLossUsd;
    const totalFeeDragUsd = round2(unroundedPerInvoiceDragUsd);
    const annualFeeDragUsd = round2(
      unroundedPerInvoiceDragUsd * payoutsPerMonth * contractorCount * 12
    );
    const effectiveFeePct = rawGrossUsd > 0 ? round2(unroundedPerInvoiceDragUsd / rawGrossUsd * 100) : 0;
    const netUsdReachingContractor = computeNetUsdReachingContractor(
      rawGrossUsd,
      rawFundingFeeUsd,
      rawWithdrawalFeeUsd,
      rawFxLossUsd,
      input.feeBearer
    );
    const rawNetTargetCurrency = Math.max(0, netUsdReachingContractor * targetPerUsd);
    const netReceivedTargetCurrency = round2(rawNetTargetCurrency);
    const effectiveExchangeRate = invoiceAmount > 0 && netReceivedTargetCurrency > 0 ? round6(rawNetTargetCurrency / invoiceAmount) : 0;
    return {
      providerId: model.providerId,
      providerName: model.providerName,
      platformMonthlyUsd,
      fundingFeeUsd: round2(rawFundingFeeUsd),
      withdrawalFixedFeeUsd: round2(rawWithdrawalFeeUsd),
      fxSpreadPct,
      fxLossUsd: round2(rawFxLossUsd),
      totalFeeDragUsd,
      effectiveFeePct,
      netReceivedTargetCurrency,
      effectiveExchangeRate,
      annualFeeDragUsd,
      notes: model.buildNotes(isSameCurrency)
    };
  });
  quotes.sort((a, b) => a.totalFeeDragUsd - b.totalFeeDragUsd);
  const bestQuote = quotes[0];
  const worstQuote = quotes[quotes.length - 1];
  return {
    midMarketRate: round6(rawMidMarketRate),
    grossInvoiceUsdEquivalent: round2(rawGrossUsd),
    quotes,
    bestProviderId: bestQuote.providerId,
    worstProviderId: worstQuote.providerId,
    annualSavingsBestVsWorstUsd: round2(worstQuote.annualFeeDragUsd - bestQuote.annualFeeDragUsd),
    deelBreakEvenNote: buildDeelBreakEvenNote(quotes, contractorCount)
  };
}
function parseCsvLine(line, lineNumber) {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      if (current.trim().length > 0) {
        return { ok: false, error: `Line ${lineNumber} has an unexpected quote inside an unquoted field.` };
      }
      inQuotes = true;
    } else if (ch === ",") {
      cells.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  if (inQuotes) {
    return { ok: false, error: `Line ${lineNumber} has an unclosed double quote.` };
  }
  cells.push(current.trim());
  return { ok: true, cells };
}
function auditContractorCsv(csvText) {
  const normalized = csvText.replace(/^\uFEFF/, "").trim();
  if (!normalized) {
    return { ok: false, error: "CSV input is empty." };
  }
  const rawLines = normalized.split(/\r?\n/).map((line, index) => ({ text: line.trim(), lineNumber: index + 1 })).filter((entry) => entry.text.length > 0);
  if (rawLines.length < 2) {
    return {
      ok: false,
      error: "CSV must include a header row and at least one contractor payout row."
    };
  }
  const headerParsed = parseCsvLine(rawLines[0].text, rawLines[0].lineNumber);
  if (!headerParsed.ok) {
    return headerParsed;
  }
  const headerNormalized = headerParsed.cells.map((col) => col.toLowerCase());
  if (headerNormalized.length !== REQUIRED_CSV_COLUMNS.length) {
    return {
      ok: false,
      error: "CSV header must contain exactly 5 columns: contractor, amount, billing_currency, payout_currency, current_provider."
    };
  }
  const columnIndex = /* @__PURE__ */ new Map();
  for (let i = 0; i < headerNormalized.length; i += 1) {
    columnIndex.set(headerNormalized[i], i);
  }
  for (const requiredCol of REQUIRED_CSV_COLUMNS) {
    if (!columnIndex.has(requiredCol)) {
      return {
        ok: false,
        error: `Missing required CSV column "${requiredCol}". Expected contractor, amount, billing_currency, payout_currency, current_provider.`
      };
    }
  }
  const rows = [];
  for (let rowIdx = 1; rowIdx < rawLines.length; rowIdx += 1) {
    const entry = rawLines[rowIdx];
    const parsed = parseCsvLine(entry.text, entry.lineNumber);
    if (!parsed.ok) {
      return parsed;
    }
    if (parsed.cells.length !== REQUIRED_CSV_COLUMNS.length) {
      return {
        ok: false,
        error: `Row ${rowIdx} (line ${entry.lineNumber}) has ${parsed.cells.length} columns instead of 5.`
      };
    }
    const contractorName = parsed.cells[columnIndex.get("contractor")] ?? "";
    const rawAmount = parsed.cells[columnIndex.get("amount")] ?? "";
    const rawBilling = (parsed.cells[columnIndex.get("billing_currency")] ?? "").toUpperCase();
    const rawPayout = (parsed.cells[columnIndex.get("payout_currency")] ?? "").toUpperCase();
    const rawProvider = (parsed.cells[columnIndex.get("current_provider")] ?? "").toLowerCase();
    if (!contractorName) {
      return {
        ok: false,
        error: `Row ${rowIdx} (line ${entry.lineNumber}) is missing a contractor name.`
      };
    }
    if (!/^\d+(\.\d+)?$/.test(rawAmount)) {
      return {
        ok: false,
        error: `Row ${rowIdx} (${contractorName}) has an invalid invoice amount "${rawAmount}".`
      };
    }
    const invoiceAmount = Number(rawAmount);
    if (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0) {
      return {
        ok: false,
        error: `Row ${rowIdx} (${contractorName}) must have an invoice amount greater than 0.`
      };
    }
    if (!VALID_BILLING_CURRENCIES.has(rawBilling)) {
      return {
        ok: false,
        error: `Row ${rowIdx} (${contractorName}) uses unsupported billing_currency "${rawBilling}". Supported values are USD, EUR, GBP.`
      };
    }
    if (!VALID_PAYOUT_CURRENCIES.has(rawPayout)) {
      return {
        ok: false,
        error: `Row ${rowIdx} (${contractorName}) uses unsupported payout_currency "${rawPayout}". Supported values are EUR, GBP, INR, PHP, BRL, MXN, CNY, CAD.`
      };
    }
    if (!VALID_PROVIDERS.has(rawProvider)) {
      return {
        ok: false,
        error: `Row ${rowIdx} (${contractorName}) uses unsupported current_provider "${rawProvider}". Supported values are wise, payoneer, deel, remote, swift-wire.`
      };
    }
    const billingCurrency = rawBilling;
    const payoutCurrency = rawPayout;
    const currentProvider = rawProvider;
    const comparison = comparePayoutProviders({
      invoiceAmount,
      billingCurrency,
      payoutCurrency,
      fundingMethod: "ach-bank",
      contractorCount: 1,
      payoutsPerMonth: 1,
      feeBearer: "contractor"
    });
    const currentQuote = comparison.quotes.find((q) => q.providerId === currentProvider);
    const bestQuote = comparison.quotes[0];
    const monthlySavedUsd = round2(Math.max(0, currentQuote.totalFeeDragUsd - bestQuote.totalFeeDragUsd));
    rows.push({
      rowNumber: rowIdx,
      contractorName,
      invoiceAmount,
      billingCurrency,
      payoutCurrency,
      currentProvider,
      currentFeeUsd: currentQuote.totalFeeDragUsd,
      bestProvider: bestQuote.providerId,
      bestFeeUsd: bestQuote.totalFeeDragUsd,
      monthlySavedUsd
    });
  }
  const totalMonthlyCurrentFeeUsd = round2(rows.reduce((sum, r) => sum + r.currentFeeUsd, 0));
  const totalMonthlyOptimalFeeUsd = round2(rows.reduce((sum, r) => sum + r.bestFeeUsd, 0));
  const annualSavingsUsd = round2((totalMonthlyCurrentFeeUsd - totalMonthlyOptimalFeeUsd) * 12);
  return {
    ok: true,
    rows,
    totalMonthlyCurrentFeeUsd,
    totalMonthlyOptimalFeeUsd,
    annualSavingsUsd
  };
}
function escapeCsvCell(value) {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}
function exportComparisonReport(input, summary, format) {
  if (format === "csv") {
    const header = [
      "provider_id",
      "provider_name",
      "billing_currency",
      "payout_currency",
      "invoice_amount",
      "funding_method",
      "contractor_count",
      "payouts_per_month",
      "fee_bearer",
      "mid_market_rate",
      "platform_monthly_usd",
      "funding_fee_usd",
      "withdrawal_fixed_fee_usd",
      "fx_spread_pct",
      "fx_loss_usd",
      "total_fee_drag_usd",
      "effective_fee_pct",
      "net_received_target_currency",
      "effective_exchange_rate",
      "annual_fee_drag_usd",
      "notes"
    ];
    const csvRows = summary.quotes.map(
      (quote) => [
        quote.providerId,
        quote.providerName,
        input.billingCurrency,
        input.payoutCurrency,
        input.invoiceAmount.toFixed(2),
        input.fundingMethod,
        input.contractorCount,
        input.payoutsPerMonth,
        input.feeBearer,
        summary.midMarketRate,
        quote.platformMonthlyUsd.toFixed(2),
        quote.fundingFeeUsd.toFixed(2),
        quote.withdrawalFixedFeeUsd.toFixed(2),
        quote.fxSpreadPct.toFixed(2),
        quote.fxLossUsd.toFixed(2),
        quote.totalFeeDragUsd.toFixed(2),
        quote.effectiveFeePct.toFixed(2),
        quote.netReceivedTargetCurrency.toFixed(2),
        quote.effectiveExchangeRate,
        quote.annualFeeDragUsd.toFixed(2),
        quote.notes
      ].map(escapeCsvCell).join(",")
    );
    return [header.join(","), ...csvRows].join("\r\n");
  }
  const bestQuote = summary.quotes[0];
  const worstQuote = summary.quotes[summary.quotes.length - 1];
  const lines = [
    "# Contractor Payout Routing Memo",
    "",
    "## Scenario Parameters",
    `- Corridor: ${input.billingCurrency} to ${input.payoutCurrency}`,
    `- Invoice Amount: ${formatMoney(input.invoiceAmount)} ${input.billingCurrency} ($${formatMoney(summary.grossInvoiceUsdEquivalent)} USD equivalent)`,
    `- Mid-Market Reference Rate: 1 ${input.billingCurrency} = ${summary.midMarketRate} ${input.payoutCurrency}`,
    `- Funding Rail: ${input.fundingMethod}`,
    `- Team Footprint: ${input.contractorCount} contractor(s), ${input.payoutsPerMonth} payout(s) per month`,
    `- Fee Bearer: ${input.feeBearer}`,
    "",
    "## Executive Recommendation",
    `- Optimal Provider: ${bestQuote.providerName} ($${formatMoney(bestQuote.totalFeeDragUsd)} per invoice, $${formatMoney(bestQuote.annualFeeDragUsd)}/year)`,
    `- Highest-Cost Provider: ${worstQuote.providerName} ($${formatMoney(worstQuote.totalFeeDragUsd)} per invoice, $${formatMoney(worstQuote.annualFeeDragUsd)}/year)`,
    `- Annual Routing Savings (Best vs Worst): $${formatMoney(summary.annualSavingsBestVsWorstUsd)}/year`,
    `- SaaS Seat vs Direct FX Analysis: ${summary.deelBreakEvenNote}`,
    "",
    "## Provider Fee Comparison",
    "| Provider | Monthly SaaS (USD) | Funding Fee (USD) | Withdrawal Fee (USD) | FX Spread (%) | FX Loss (USD) | Per-Invoice Drag (USD) | Effective Fee (%) | Net Received | Effective Rate | Annual Drag (USD) |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...summary.quotes.map(
      (q) => `| ${q.providerName} | $${formatMoney(q.platformMonthlyUsd)} | $${formatMoney(q.fundingFeeUsd)} | $${formatMoney(q.withdrawalFixedFeeUsd)} | ${q.fxSpreadPct.toFixed(2)}% | $${formatMoney(q.fxLossUsd)} | $${formatMoney(q.totalFeeDragUsd)} | ${q.effectiveFeePct.toFixed(2)}% | ${formatMoney(q.netReceivedTargetCurrency)} ${input.payoutCurrency} | ${q.effectiveExchangeRate} | $${formatMoney(q.annualFeeDragUsd)} |`
    ),
    ""
  ];
  return lines.join("\n");
}

// src/cli.ts
var CLI_VERSION = "0.1.0";
var FOOTER_PROMPT = "Zero-upload interactive comparison in your browser: https://contractorfx.com";
function printHelp() {
  const text = `ContractorFX CLI - International Contractor Payout and FX Spread Benchmark

USAGE:
  contractor-fx [options]
  contractor-fx --csv <path-to-csv> [options]

SINGLE CORRIDOR OPTIONS:
  -a, --amount <number>        Invoice gross amount in billing currency (default: 3500)
  -b, --billing <currency>     Billing currency: USD, EUR, GBP (default: USD)
  -p, --payout <currency>      Payout currency: EUR, GBP, INR, PHP, BRL, MXN, CNY, CAD (default: INR)
  -f, --funding <rail>         Funding rail: ach, ach-bank, wire, card (default: ach-bank)
  -c, --contractors <number>   Headcount footprint for SaaS seat fees (default: 1)
      --payouts <number>       Payouts per month per contractor (default: 1)
      --bearer <side>          Who absorbs transfer bite: contractor or client (default: contractor)

BATCH AUDIT OPTIONS:
      --csv <file>             Path to contractor payroll CSV for batch fee audit
                               CSV format: contractor,amount,billing_currency,payout_currency,current_provider

GENERAL OPTIONS:
      --format <type>          Output format: table, md, json (default: table)
  -v, --version                Show version number
  -h, --help                   Show this help message

EXAMPLES:
  contractor-fx --amount 3500 --billing USD --payout INR --funding ach --contractors 1
  contractor-fx --amount 5000 --billing USD --payout EUR --contractors 8 --format md
  contractor-fx --csv sample-team.csv --format table
  contractor-fx --csv payroll.csv --format json

${FOOTER_PROMPT}`;
  console.log(text);
}
function normalizeFunding(value) {
  const lowered = value.toLowerCase().trim();
  if (lowered === "ach" || lowered === "ach-bank" || lowered === "bank") {
    return "ach-bank";
  }
  if (lowered === "wire") {
    return "wire";
  }
  if (lowered === "card") {
    return "card";
  }
  throw new Error(`Unsupported funding method "${value}". Supported: ach, wire, card.`);
}
function normalizeBilling(value) {
  const upper = value.toUpperCase().trim();
  if (upper === "USD" || upper === "EUR" || upper === "GBP") {
    return upper;
  }
  throw new Error(`Unsupported billing currency "${value}". Supported: USD, EUR, GBP.`);
}
function normalizePayout(value) {
  const upper = value.toUpperCase().trim();
  const valid = ["EUR", "GBP", "INR", "PHP", "BRL", "MXN", "CNY", "CAD"];
  if (valid.includes(upper)) {
    return upper;
  }
  throw new Error(`Unsupported payout currency "${value}". Supported: ${valid.join(", ")}.`);
}
function normalizeBearer(value) {
  const lowered = value.toLowerCase().trim();
  if (lowered === "client" || lowered === "company") {
    return "client";
  }
  if (lowered === "contractor") {
    return "contractor";
  }
  throw new Error(`Unsupported fee bearer "${value}". Supported: contractor, client.`);
}
function formatSingleTable(input, summary) {
  const best = summary.quotes[0];
  const worst = summary.quotes[summary.quotes.length - 1];
  const header = `ContractorFX - Single Corridor Comparison
Scenario: ${input.invoiceAmount.toFixed(2)} ${input.billingCurrency} to ${input.payoutCurrency} (Mid-market rate: ${summary.midMarketRate})
Funding Rail: ${input.fundingMethod} | Contractors: ${input.contractorCount} | Payouts/mo: ${input.payoutsPerMonth} | Fee Bearer: ${input.feeBearer}

Provider           Monthly SaaS   Funding Fee   Withdrawal Fee   FX Spread   FX Loss   Invoice Drag   Effective %   Annual Drag
---------------------------------------------------------------------------------------------------------------------------------`;
  const rows = summary.quotes.map((q) => {
    const isBest = q.providerId === summary.bestProviderId;
    const tag = isBest ? " [LOWEST DRAG]" : "";
    const pName = q.providerName.padEnd(17);
    const saas = `$${q.platformMonthlyUsd.toFixed(2)}`.padStart(12);
    const fund = `$${q.fundingFeeUsd.toFixed(2)}`.padStart(13);
    const wdraw = `$${q.withdrawalFixedFeeUsd.toFixed(2)}`.padStart(16);
    const spread = `${q.fxSpreadPct.toFixed(2)}%`.padStart(11);
    const fxLoss = `$${q.fxLossUsd.toFixed(2)}`.padStart(9);
    const drag = `$${q.totalFeeDragUsd.toFixed(2)}`.padStart(14);
    const eff = `${q.effectiveFeePct.toFixed(2)}%`.padStart(13);
    const annual = `$${q.annualFeeDragUsd.toFixed(2)}`.padStart(13);
    return `${pName}${saas}${fund}${wdraw}${spread}${fxLoss}${drag}${eff}${annual}${tag}`;
  });
  const summaryBlock = `---------------------------------------------------------------------------------------------------------------------------------
Recommendation:
- Optimal Provider: ${best.providerName} ($${best.totalFeeDragUsd.toFixed(2)} per invoice, $${best.annualFeeDragUsd.toFixed(2)}/year)
- Highest-Cost Provider: ${worst.providerName} ($${worst.totalFeeDragUsd.toFixed(2)} per invoice, $${worst.annualFeeDragUsd.toFixed(2)}/year)
- Annual Routing Savings: $${summary.annualSavingsBestVsWorstUsd.toFixed(2)}/year

${FOOTER_PROMPT}`;
  return [header, ...rows, summaryBlock].join("\n");
}
function formatBatchTable(csvPath, result) {
  const header = `ContractorFX - Batch Contractor Payroll Audit
File: ${path.basename(csvPath)} | Contractors: ${result.rows.length}

Row  Contractor           Amount      Corridor    Current Provider   Current Fee   Optimal Provider   Optimal Fee   Monthly Saved
---------------------------------------------------------------------------------------------------------------------------------`;
  const rows = result.rows.map((r) => {
    const rowNum = String(r.rowNumber).padStart(3);
    const name = r.contractorName.slice(0, 18).padEnd(19);
    const amt = `$${r.invoiceAmount.toFixed(2)}`.padStart(10);
    const corr = `${r.billingCurrency}->${r.payoutCurrency}`.padStart(11);
    const curP = r.currentProvider.padEnd(18);
    const curFee = `$${r.currentFeeUsd.toFixed(2)}`.padStart(12);
    const bestP = r.bestProvider.padEnd(18);
    const bestFee = `$${r.bestFeeUsd.toFixed(2)}`.padStart(12);
    const saved = `$${r.monthlySavedUsd.toFixed(2)}`.padStart(14);
    return `${rowNum}  ${name} ${amt} ${corr}  ${curP} ${curFee}  ${bestP} ${bestFee} ${saved}`;
  });
  const summaryBlock = `---------------------------------------------------------------------------------------------------------------------------------
Batch Audit Totals:
- Current Monthly Transfer Bite: $${result.totalMonthlyCurrentFeeUsd.toFixed(2)}
- Optimal Monthly Transfer Bite: $${result.totalMonthlyOptimalFeeUsd.toFixed(2)}
- Annual Potential Savings:      $${result.annualSavingsUsd.toFixed(2)}/year

${FOOTER_PROMPT}`;
  return [header, ...rows, summaryBlock].join("\n");
}
function formatBatchMd(csvPath, result) {
  const lines = [
    "# Contractor Payroll Batch Audit Report",
    "",
    `Source: \`${path.basename(csvPath)}\` (${result.rows.length} contractors audited)`,
    "",
    "## Executive Audit Summary",
    `- Current Monthly Fee Bite: $${result.totalMonthlyCurrentFeeUsd.toFixed(2)}`,
    `- Optimal Monthly Fee Bite: $${result.totalMonthlyOptimalFeeUsd.toFixed(2)}`,
    `- Annual Recoverable Waste: $${result.annualSavingsUsd.toFixed(2)}/year`,
    "",
    "## Line Item Breakdown",
    "| Row | Contractor | Invoice Amount | Corridor | Current Provider | Current Fee | Optimal Provider | Optimal Fee | Monthly Saved |",
    "| ---: | --- | ---: | :---: | --- | ---: | --- | ---: | ---: |",
    ...result.rows.map(
      (r) => `| ${r.rowNumber} | ${r.contractorName} | $${r.invoiceAmount.toFixed(2)} | ${r.billingCurrency}->${r.payoutCurrency} | ${r.currentProvider} | $${r.currentFeeUsd.toFixed(2)} | ${r.bestProvider} | $${r.bestFeeUsd.toFixed(2)} | $${r.monthlySavedUsd.toFixed(2)} |`
    ),
    "",
    `> ${FOOTER_PROMPT}`
  ];
  return lines.join("\n");
}
function runCli(args = process.argv.slice(2)) {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      options: {
        amount: { type: "string", short: "a" },
        billing: { type: "string", short: "b", default: "USD" },
        payout: { type: "string", short: "p", default: "INR" },
        funding: { type: "string", short: "f", default: "ach-bank" },
        contractors: { type: "string", short: "c", default: "1" },
        payouts: { type: "string", default: "1" },
        bearer: { type: "string", default: "contractor" },
        csv: { type: "string" },
        format: { type: "string", default: "table" },
        help: { type: "boolean", short: "h", default: false },
        version: { type: "boolean", short: "v", default: false }
      },
      allowPositionals: true
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${msg}
Use --help to view available options.`);
    return { exitCode: 1 };
  }
  const { values } = parsed;
  if (values.help) {
    printHelp();
    return { exitCode: 0 };
  }
  if (values.version) {
    console.log(`contractor-fx ${CLI_VERSION}`);
    return { exitCode: 0 };
  }
  const format = (values.format || "table").toLowerCase();
  if (!["table", "md", "markdown", "json"].includes(format)) {
    console.error(`Error: Invalid format "${values.format}". Choose table, md, or json.`);
    return { exitCode: 1 };
  }
  if (values.csv) {
    const resolvedPath = path.resolve(process.cwd(), values.csv);
    if (!existsSync(resolvedPath)) {
      console.error(`Error: CSV file not found: ${resolvedPath}`);
      return { exitCode: 1 };
    }
    let content = "";
    try {
      content = readFileSync(resolvedPath, "utf8");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Error reading CSV file: ${msg}`);
      return { exitCode: 1 };
    }
    const audit = auditContractorCsv(content);
    if (!audit.ok) {
      console.error(`CSV Audit Error: ${audit.error}`);
      return { exitCode: 1 };
    }
    if (format === "json") {
      console.log(JSON.stringify(audit, null, 2));
    } else if (format === "md" || format === "markdown") {
      console.log(formatBatchMd(resolvedPath, audit));
    } else {
      console.log(formatBatchTable(resolvedPath, audit));
    }
    return { exitCode: 0 };
  }
  try {
    const amountRaw = values.amount !== void 0 ? values.amount : "3500";
    const invoiceAmount = Number(amountRaw);
    if (!Number.isFinite(invoiceAmount) || invoiceAmount <= 0) {
      throw new Error(`Amount must be a positive number, received "${amountRaw}".`);
    }
    const billingCurrency = normalizeBilling(values.billing || "USD");
    const payoutCurrency = normalizePayout(values.payout || "INR");
    const fundingMethod = normalizeFunding(values.funding || "ach-bank");
    const contractorCount = Math.max(1, Math.floor(Number(values.contractors || "1")));
    const payoutsPerMonth = Math.max(1, Math.floor(Number(values.payouts || "1")));
    const feeBearer = normalizeBearer(values.bearer || "contractor");
    const scenario = {
      invoiceAmount,
      billingCurrency,
      payoutCurrency,
      fundingMethod,
      contractorCount,
      payoutsPerMonth,
      feeBearer
    };
    const summary = comparePayoutProviders(scenario);
    if (format === "json") {
      console.log(JSON.stringify({ scenario, summary }, null, 2));
    } else if (format === "md" || format === "markdown") {
      console.log(exportComparisonReport(scenario, summary, "md"));
    } else {
      console.log(formatSingleTable(scenario, summary));
    }
    return { exitCode: 0 };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${msg}`);
    return { exitCode: 1 };
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const res = runCli();
  process.exit(res.exitCode);
}
export {
  runCli
};

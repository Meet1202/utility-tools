export interface EmiResult {
  monthlyEmi: number
  totalInterest: number
  totalPayment: number
  principalPercent: number
  interestPercent: number
  schedule: Array<{
    month: number
    principalPaid: number
    interestPaid: number
    balance: number
  }>
}

/**
 * Calculates loan EMI using standard reducing-balance formula:
 * EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
 */
export function calculateEmi(principal: number, annualRatePercent: number, tenureMonths: number): EmiResult {
  if (principal <= 0 || tenureMonths <= 0) {
    return {
      monthlyEmi: 0,
      totalInterest: 0,
      totalPayment: 0,
      principalPercent: 100,
      interestPercent: 0,
      schedule: []
    }
  }

  const monthlyRate = (annualRatePercent / 12) / 100

  let monthlyEmi = 0
  if (monthlyRate === 0) {
    monthlyEmi = principal / tenureMonths
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths)
    monthlyEmi = (principal * monthlyRate * factor) / (factor - 1)
  }

  const totalPayment = monthlyEmi * tenureMonths
  const totalInterest = Math.max(0, totalPayment - principal)
  const principalPercent = totalPayment > 0 ? (principal / totalPayment) * 100 : 100
  const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0

  // Generate monthly amortization breakdown
  const schedule: EmiResult['schedule'] = []
  let balance = principal

  for (let m = 1; m <= tenureMonths; m++) {
    const interestForMonth = balance * monthlyRate
    const principalForMonth = monthlyEmi - interestForMonth
    balance = Math.max(0, balance - principalForMonth)

    schedule.push({
      month: m,
      principalPaid: Math.round(principalForMonth),
      interestPaid: Math.round(interestForMonth),
      balance: Math.round(balance)
    })
  }

  return {
    monthlyEmi: Math.round(monthlyEmi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    principalPercent: Math.round(principalPercent),
    interestPercent: Math.round(interestPercent),
    schedule
  }
}

export interface GstResult {
  netAmount: number
  gstAmount: number
  grossAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  ratePercent: number
  isInclusive: boolean
}

/**
 * Calculates GST with CGST/SGST/IGST split:
 * Exclusive (Add GST): Gross = Net * (1 + R/100)
 * Inclusive (Remove GST): Net = Gross / (1 + R/100)
 */
export function calculateGst(amount: number, ratePercent: number, isInclusive: boolean): GstResult {
  if (amount <= 0 || ratePercent < 0) {
    return {
      netAmount: 0,
      gstAmount: 0,
      grossAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      ratePercent,
      isInclusive
    }
  }

  let netAmount = 0
  let grossAmount = 0
  let gstAmount = 0

  if (isInclusive) {
    // Amount is Gross, extract GST
    grossAmount = amount
    netAmount = grossAmount / (1 + ratePercent / 100)
    gstAmount = grossAmount - netAmount
  } else {
    // Amount is Net, add GST
    netAmount = amount
    gstAmount = (netAmount * ratePercent) / 100
    grossAmount = netAmount + gstAmount
  }

  const halfGst = gstAmount / 2

  return {
    netAmount: parseFloat(netAmount.toFixed(2)),
    gstAmount: parseFloat(gstAmount.toFixed(2)),
    grossAmount: parseFloat(grossAmount.toFixed(2)),
    cgstAmount: parseFloat(halfGst.toFixed(2)),
    sgstAmount: parseFloat(halfGst.toFixed(2)),
    igstAmount: parseFloat(gstAmount.toFixed(2)),
    ratePercent,
    isInclusive
  }
}

/**
 * Calculates percentage operations:
 * 1. "whatIsXPercentOfY": (X / 100) * Y
 * 2. "xIsWhatPercentOfY": (X / Y) * 100
 * 3. "percentageChange": ((Y - X) / X) * 100
 * 4. "increaseByPercent": X * (1 + Y / 100)
 * 5. "decreaseByPercent": X * (1 - Y / 100)
 */
export function calculatePercentage(
  mode: 'whatIsXPercentOfY' | 'xIsWhatPercentOfY' | 'percentageChange' | 'increaseByPercent' | 'decreaseByPercent',
  x: number,
  y: number
): { result: number; formula: string } {
  switch (mode) {
    case 'whatIsXPercentOfY': {
      const res = (x / 100) * y
      return {
        result: parseFloat(res.toFixed(2)),
        formula: `(${x} / 100) × ${y} = ${res.toFixed(2)}`
      }
    }
    case 'xIsWhatPercentOfY': {
      if (y === 0) return { result: 0, formula: 'Cannot divide by zero' }
      const res = (x / y) * 100
      return {
        result: parseFloat(res.toFixed(2)),
        formula: `(${x} / ${y}) × 100 = ${res.toFixed(2)}%`
      }
    }
    case 'percentageChange': {
      if (x === 0) return { result: 0, formula: 'Initial value cannot be zero' }
      const diff = y - x
      const res = (diff / Math.abs(x)) * 100
      const sign = diff >= 0 ? '+' : ''
      return {
        result: parseFloat(res.toFixed(2)),
        formula: `((${y} - ${x}) / ${Math.abs(x)}) × 100 = ${sign}${res.toFixed(2)}%`
      }
    }
    case 'increaseByPercent': {
      const res = x * (1 + y / 100)
      return {
        result: parseFloat(res.toFixed(2)),
        formula: `${x} × (1 + ${y}/100) = ${res.toFixed(2)}`
      }
    }
    case 'decreaseByPercent': {
      const res = x * (1 - y / 100)
      return {
        result: parseFloat(res.toFixed(2)),
        formula: `${x} × (1 - ${y}/100) = ${res.toFixed(2)}`
      }
    }
    default:
      return { result: 0, formula: '' }
  }
}
